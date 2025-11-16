#!/bin/bash

# Production Docker Management Script
# Usage: ./scripts/docker-prod.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
ENV_FILE="$PROJECT_DIR/.env"

# Load environment variables from .env file if it exists
load_env_file() {
    if [ -f "$ENV_FILE" ]; then
        echo -e "${BLUE}Loading environment variables from .env file...${NC}"
        # Export variables from .env file, ignoring comments and empty lines
        set -a
        # Use source or eval to handle variables with spaces or special characters in values
        while IFS= read -r line || [ -n "$line" ]; do
            # Skip comments and empty lines
            if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "${line// /}" ]]; then
                continue
            fi
            # Export variable if it looks like KEY=VALUE
            if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
                export "${line}"
            fi
        done < "$ENV_FILE"
        set +a
        echo -e "${GREEN}Environment variables loaded!${NC}"
    fi
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
        exit 1
    fi
}

# Check if docker-compose file exists
check_compose_file() {
    if [ ! -f "$COMPOSE_FILE" ]; then
        echo -e "${RED}Error: docker-compose.yml not found at $COMPOSE_FILE${NC}"
        exit 1
    fi
}

# Check if .env file exists and has required variables
check_env_file() {
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        echo -e "${RED}Error: .env file not found!${NC}"
        echo -e "${YELLOW}Please create a .env file with the following required variables:${NC}"
        echo "  NODE_ENV=production"
        echo "  DATABASE_URL=postgresql://user:password@postgres:5432/social_sync"
        echo "  JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters"
        echo "  PORT=8080"
        echo "  POSTGRES_USER=postgres"
        echo "  POSTGRES_PASSWORD=your-secure-password"
        echo "  POSTGRES_DB=social_sync"
        exit 1
    fi

    # Check for required variables
    source "$PROJECT_DIR/.env"
    REQUIRED_VARS=("DATABASE_URL" "JWT_SECRET")
    MISSING_VARS=()

    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_VARS+=("$var")
        fi
    done

    if [ ${#MISSING_VARS[@]} -ne 0 ]; then
        echo -e "${RED}Error: Missing required environment variables:${NC}"
        printf '%s\n' "${MISSING_VARS[@]}"
        exit 1
    fi

    # Warn about insecure JWT_SECRET
    if [ "$JWT_SECRET" = "dev-secret" ] || [ ${#JWT_SECRET} -lt 32 ]; then
        echo -e "${YELLOW}Warning: JWT_SECRET appears to be insecure or too short (minimum 32 characters recommended)${NC}"
    fi
}

# Function to build production image
build() {
    echo -e "${BLUE}Building production Docker image...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache)
    echo -e "${GREEN}Production image built successfully!${NC}"
}

# Function to start services
start() {
    echo -e "${BLUE}Starting production services...${NC}"
    
    # Ensure database is healthy before starting backend
    echo -e "${BLUE}Waiting for database to be ready...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres)
    
    # Wait for database health check
    MAX_WAIT=60
    COUNTER=0
    while [ $COUNTER -lt $MAX_WAIT ]; do
        if (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps postgres | grep -q "healthy"); then
            echo -e "${GREEN}Database is ready!${NC}"
            break
        fi
        echo -n "."
        sleep 1
        COUNTER=$((COUNTER + 1))
    done

    if [ $COUNTER -eq $MAX_WAIT ]; then
        echo -e "${RED}Database failed to become healthy within $MAX_WAIT seconds${NC}"
        exit 1
    fi

    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d backend)
    echo -e "${GREEN}Production services started!${NC}"
    echo -e "${BLUE}Backend API: http://localhost:${PORT:-8080}${NC}"
    echo ""
    echo -e "${YELLOW}To view logs: ./scripts/docker-prod.sh logs${NC}"
    echo -e "${YELLOW}To check status: ./scripts/docker-prod.sh status${NC}"
}

# Function to stop services
stop() {
    echo -e "${BLUE}Stopping production services...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down)
    echo -e "${GREEN}Production services stopped!${NC}"
}

# Function to restart services
restart() {
    echo -e "${BLUE}Restarting production services...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart)
    echo -e "${GREEN}Production services restarted!${NC}"
}

# Function to view logs
logs() {
    SERVICE=${1:-backend}
    echo -e "${BLUE}Showing logs for $SERVICE (Press Ctrl+C to exit)...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f --tail=100 "$SERVICE")
}

# Function to show status
status() {
    echo -e "${BLUE}Service Status:${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps)
    echo ""
    echo -e "${BLUE}Resource Usage:${NC}"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
}

# Function to run migrations
migrate() {
    echo -e "${BLUE}Running database migrations...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec backend npm run db:push)
    echo -e "${GREEN}Migrations completed!${NC}"
}

# Function to backup database
backup() {
    BACKUP_DIR="$PROJECT_DIR/backups"
    mkdir -p "$BACKUP_DIR"
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/social_sync_backup_$TIMESTAMP.sql"
    
    echo -e "${BLUE}Creating database backup...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres pg_dumpall -U postgres > "$BACKUP_FILE")
    
    if [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
        echo -e "${GREEN}Backup created successfully: $BACKUP_FILE${NC}"
        
        # Compress backup
        gzip "$BACKUP_FILE"
        echo -e "${GREEN}Backup compressed: ${BACKUP_FILE}.gz${NC}"
    else
        echo -e "${RED}Backup failed!${NC}"
        exit 1
    fi
}

# Function to restore database
restore() {
    if [ -z "$1" ]; then
        echo -e "${RED}Error: Please specify a backup file${NC}"
        echo "Usage: ./scripts/docker-prod.sh restore <backup_file.sql.gz>"
        exit 1
    fi

    BACKUP_FILE="$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Warning: This will replace the current database!${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Restore cancelled.${NC}"
        exit 0
    fi

    echo -e "${BLUE}Restoring database from backup...${NC}"
    
    # Decompress if needed and restore
    if [[ "$BACKUP_FILE" == *.gz ]]; then
        gunzip -c "$BACKUP_FILE" | (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres psql -U postgres)
    else
        cat "$BACKUP_FILE" | (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres psql -U postgres)
    fi
    
    echo -e "${GREEN}Database restored successfully!${NC}"
}

# Function to access database shell
db_shell() {
    echo -e "${BLUE}Accessing PostgreSQL shell...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec postgres psql -U postgres -d social_sync)
}

# Function to show logs from last 24 hours
logs_recent() {
    SERVICE=${1:-backend}
    echo -e "${BLUE}Showing logs from last 24 hours for $SERVICE...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs --since 24h "$SERVICE")
}

# Function to update services (pull, rebuild, restart)
update() {
    echo -e "${BLUE}Updating production services...${NC}"
    
    # Pull latest images
    echo -e "${BLUE}Pulling latest base images...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull postgres)
    
    # Rebuild backend
    echo -e "${BLUE}Rebuilding backend image...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache backend)
    
    # Restart with zero downtime (if possible)
    echo -e "${BLUE}Restarting services...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --no-deps backend)
    
    echo -e "${GREEN}Services updated successfully!${NC}"
}

# Function to clean everything
clean() {
    echo -e "${RED}Warning: This will stop and remove ALL containers, volumes, and networks!${NC}"
    echo -e "${RED}This will DELETE your database data!${NC}"
    read -p "Are you absolutely sure? Type 'yes' to confirm: " -r
    echo
    if [ "$REPLY" != "yes" ]; then
        echo -e "${BLUE}Cleanup cancelled.${NC}"
        exit 0
    fi
    
    echo -e "${BLUE}Cleaning up production environment...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v --remove-orphans)
    echo -e "${GREEN}Cleanup completed!${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}Production Docker Management Script${NC}"
    echo ""
    echo "Usage: ./scripts/docker-prod.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  build              Build production Docker images"
    echo "  start              Start all production services"
    echo "  stop               Stop all production services"
    echo "  restart            Restart all production services"
    echo "  update             Update and restart services"
    echo "  logs [service]      Show logs (default: backend)"
    echo "  logs-recent        Show logs from last 24 hours"
    echo "  status             Show service status and resource usage"
    echo "  migrate            Run database migrations"
    echo "  backup             Create database backup"
    echo "  restore <file>     Restore database from backup"
    echo "  db-shell           Access PostgreSQL shell"
    echo "  clean              Stop and remove all containers/volumes"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/docker-prod.sh build"
    echo "  ./scripts/docker-prod.sh start"
    echo "  ./scripts/docker-prod.sh logs backend"
    echo "  ./scripts/docker-prod.sh backup"
    echo "  ./scripts/docker-prod.sh restore backups/social_sync_backup_20240101_120000.sql.gz"
}

# Main script logic
check_docker
check_compose_file

# Parse command
COMMAND=${1:-help}

# Load environment variables early
load_env_file

# Check env file for most commands (not for help or build)
if [ "$COMMAND" != "help" ] && [ "$COMMAND" != "--help" ] && [ "$COMMAND" != "-h" ] && [ "$COMMAND" != "build" ]; then
    check_env_file
fi

case "$COMMAND" in
    build)
        build
        ;;
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    update)
        update
        ;;
    logs)
        logs "$2"
        ;;
    logs-recent)
        logs_recent "$2"
        ;;
    status)
        status
        ;;
    migrate)
        migrate
        ;;
    backup)
        backup
        ;;
    restore)
        restore "$2"
        ;;
    db-shell)
        db_shell
        ;;
    clean)
        clean
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $COMMAND${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

