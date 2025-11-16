#!/bin/bash

# Development Docker Management Script
# Usage: ./scripts/docker-dev.sh [command]

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
COMPOSE_FILE="$PROJECT_DIR/docker-compose.dev.yml"
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
        echo -e "${RED}Error: docker-compose.dev.yml not found at $COMPOSE_FILE${NC}"
        exit 1
    fi
}

# Check if .env file exists
check_env_file() {
    if [ ! -f "$PROJECT_DIR/.env" ]; then
        echo -e "${YELLOW}Warning: .env file not found. Creating from .env.example if available...${NC}"
        if [ -f "$PROJECT_DIR/.env.example" ]; then
            cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
            echo -e "${GREEN}Created .env file from .env.example${NC}"
            echo -e "${YELLOW}Please update .env file with your configuration before continuing.${NC}"
        else
            echo -e "${YELLOW}Please create a .env file with the following variables:${NC}"
            echo "  DATABASE_URL=postgresql://postgres:postgres@postgres:5432/social_sync_dev"
            echo "  JWT_SECRET=dev-secret-change-in-production"
            echo "  PORT=8080"
        fi
    fi
}

# Function to start services
start() {
    echo -e "${BLUE}Starting development services...${NC}"
    # Change to project directory so docker-compose can find .env file
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d)
    echo -e "${GREEN}Development services started!${NC}"
    echo -e "${BLUE}Backend API: http://localhost:8080${NC}"
    echo -e "${BLUE}Database: localhost:5432${NC}"
    echo ""
    echo -e "${YELLOW}To view logs: ./scripts/docker-dev.sh logs${NC}"
    echo -e "${YELLOW}To stop: ./scripts/docker-dev.sh stop${NC}"
}

# Function to stop services
stop() {
    echo -e "${BLUE}Stopping development services...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down)
    echo -e "${GREEN}Development services stopped!${NC}"
}

# Function to restart services
restart() {
    echo -e "${BLUE}Restarting development services...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" restart)
    echo -e "${GREEN}Development services restarted!${NC}"
}

# Function to rebuild services
rebuild() {
    echo -e "${BLUE}Rebuilding development services...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --no-cache)
    echo -e "${GREEN}Development services rebuilt!${NC}"
    echo -e "${YELLOW}Starting services...${NC}"
    start
}

# Function to view logs
logs() {
    SERVICE=${1:-backend}
    echo -e "${BLUE}Showing logs for $SERVICE (Press Ctrl+C to exit)...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f "$SERVICE")
}

# Function to show status
status() {
    echo -e "${BLUE}Service Status:${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps)
}

# Function to run migrations
migrate() {
    echo -e "${BLUE}Running database migrations...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec backend npm run db:push)
    echo -e "${GREEN}Migrations completed!${NC}"
}

# Function to generate migrations
generate_migrations() {
    echo -e "${BLUE}Generating database migrations...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec backend npm run db:generate)
    echo -e "${GREEN}Migrations generated!${NC}"
}

# Function to access database shell
db_shell() {
    echo -e "${BLUE}Accessing PostgreSQL shell...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec postgres psql -U postgres -d social_sync_dev)
}

# Function to access backend shell
backend_shell() {
    echo -e "${BLUE}Accessing backend container shell...${NC}"
    (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec backend sh)
}

# Function to clean everything
clean() {
    echo -e "${YELLOW}This will stop and remove all containers, volumes, and networks.${NC}"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Cleaning up development environment...${NC}"
        (cd "$PROJECT_DIR" && docker-compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down -v)
        echo -e "${GREEN}Cleanup completed!${NC}"
    else
        echo -e "${BLUE}Cleanup cancelled.${NC}"
    fi
}

# Function to show help
show_help() {
    echo -e "${BLUE}Development Docker Management Script${NC}"
    echo ""
    echo "Usage: ./scripts/docker-dev.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start              Start all development services"
    echo "  stop               Stop all development services"
    echo "  restart            Restart all development services"
    echo "  rebuild            Rebuild and start all services"
    echo "  logs [service]     Show logs (default: backend)"
    echo "  status             Show service status"
    echo "  migrate            Run database migrations"
    echo "  generate           Generate database migrations"
    echo "  db-shell           Access PostgreSQL shell"
    echo "  shell              Access backend container shell"
    echo "  clean              Stop and remove all containers/volumes"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/docker-dev.sh start"
    echo "  ./scripts/docker-dev.sh logs backend"
    echo "  ./scripts/docker-dev.sh migrate"
}

# Main script logic
check_docker
check_compose_file
load_env_file  # Load environment variables from .env file
check_env_file

# Parse command
COMMAND=${1:-help}

case "$COMMAND" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    rebuild)
        rebuild
        ;;
    logs)
        logs "$2"
        ;;
    status)
        status
        ;;
    migrate)
        migrate
        ;;
    generate)
        generate_migrations
        ;;
    db-shell)
        db_shell
        ;;
    shell)
        backend_shell
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

