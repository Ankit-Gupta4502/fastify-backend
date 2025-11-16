# Docker Scripts Guide

This directory contains helper scripts for managing Docker containers in development and production environments.

## Scripts Overview

### 1. `docker-dev.sh` - Development Environment
Script for managing development Docker containers with hot reload support.

### 2. `docker-prod.sh` - Production Environment
Script for managing production Docker containers with additional safety checks and backup features.

### 3. `docker.sh` - Universal Wrapper
Unified script that routes to the appropriate environment script based on the first argument.

## Environment Variables

**All scripts automatically load environment variables from `.env` file** if it exists in the project root. The scripts:

- ✅ Load variables from `.env` before executing commands
- ✅ Export variables so docker-compose can use them
- ✅ Use `--env-file` flag for explicit .env file reference
- ✅ Skip comments and empty lines
- ✅ Handle variables with special characters safely

The scripts will show a message when loading environment variables:
```
Loading environment variables from .env file...
Environment variables loaded!
```

## Quick Start

### Development

```bash
# Start development services
./scripts/docker-dev.sh start

# View logs
./scripts/docker-dev.sh logs

# Run migrations
./scripts/docker-dev.sh migrate

# Stop services
./scripts/docker-dev.sh stop
```

### Production

```bash
# Build production image
./scripts/docker-prod.sh build

# Start production services
./scripts/docker-prod.sh start

# View logs
./scripts/docker-prod.sh logs

# Create database backup
./scripts/docker-prod.sh backup

# Stop services
./scripts/docker-prod.sh stop
```

### Using the Universal Wrapper

```bash
# Development commands
./scripts/docker.sh dev start
./scripts/docker.sh dev logs

# Production commands
./scripts/docker.sh prod start
./scripts/docker.sh prod backup
```

## Development Commands

### `./scripts/docker-dev.sh start`
Start all development services (PostgreSQL and backend with hot reload).

### `./scripts/docker-dev.sh stop`
Stop all development services.

### `./scripts/docker-dev.sh restart`
Restart all development services without rebuilding.

### `./scripts/docker-dev.sh rebuild`
Rebuild Docker images from scratch and start services.

### `./scripts/docker-dev.sh logs [service]`
Show logs for a service (default: `backend`).
- `./scripts/docker-dev.sh logs` - Show backend logs
- `./scripts/docker-dev.sh logs postgres` - Show database logs

### `./scripts/docker-dev.sh status`
Show status of all running services.

### `./scripts/docker-dev.sh migrate`
Run database migrations using Drizzle ORM.

### `./scripts/docker-dev.sh generate`
Generate database migrations from schema changes.

### `./scripts/docker-dev.sh db-shell`
Access PostgreSQL shell for direct database queries.

### `./scripts/docker-dev.sh shell`
Access the backend container shell for debugging.

### `./scripts/docker-dev.sh clean`
Stop and remove all containers, volumes, and networks. ⚠️ **Deletes all data!**

## Production Commands

### `./scripts/docker-prod.sh build`
Build production Docker images from scratch.

### `./scripts/docker-prod.sh start`
Start all production services. Waits for database to be healthy before starting backend.

### `./scripts/docker-prod.sh stop`
Stop all production services.

### `./scripts/docker-prod.sh restart`
Restart all production services without rebuilding.

### `./scripts/docker-prod.sh update`
Update services by pulling latest images and rebuilding backend.

### `./scripts/docker-prod.sh logs [service]`
Show logs for a service (default: `backend`).
- `./scripts/docker-prod.sh logs` - Show backend logs (last 100 lines)
- `./scripts/docker-prod.sh logs postgres` - Show database logs

### `./scripts/docker-prod.sh logs-recent [service]`
Show logs from the last 24 hours for a service.

### `./scripts/docker-prod.sh status`
Show service status and resource usage (CPU, memory, network).

### `./scripts/docker-prod.sh migrate`
Run database migrations using Drizzle ORM.

### `./scripts/docker-prod.sh backup`
Create a timestamped database backup in the `backups/` directory.
- Backups are automatically compressed with gzip
- Format: `social_sync_backup_YYYYMMDD_HHMMSS.sql.gz`

### `./scripts/docker-prod.sh restore <backup_file>`
Restore database from a backup file.
```bash
./scripts/docker-prod.sh restore backups/social_sync_backup_20240101_120000.sql.gz
```

### `./scripts/docker-prod.sh db-shell`
Access PostgreSQL shell for direct database queries.

### `./scripts/docker-prod.sh clean`
Stop and remove all containers, volumes, and networks. ⚠️ **Requires confirmation and deletes all data!**

## Common Workflows

### Development Setup (First Time)

```bash
# 1. Ensure .env file exists
cp .env.example .env  # Edit with your settings

# 2. Start services
./scripts/docker-dev.sh start

# 3. Run migrations (first time)
./scripts/docker-dev.sh migrate

# 4. View logs to verify everything is working
./scripts/docker-dev.sh logs
```

### Daily Development

```bash
# Start services
./scripts/docker-dev.sh start

# Make code changes (hot reload enabled)

# Run migrations if schema changed
./scripts/docker-dev.sh generate
./scripts/docker-dev.sh migrate

# Stop when done
./scripts/docker-dev.sh stop
```

### Production Deployment

```bash
# 1. Ensure .env file has production values
# Verify JWT_SECRET is secure (32+ characters)

# 2. Build production image
./scripts/docker-prod.sh build

# 3. Start services
./scripts/docker-prod.sh start

# 4. Run migrations
./scripts/docker-prod.sh migrate

# 5. Verify status
./scripts/docker-prod.sh status

# 6. Monitor logs
./scripts/docker-prod.sh logs
```

### Production Updates

```bash
# 1. Create backup before updating
./scripts/docker-prod.sh backup

# 2. Update code and rebuild
git pull
./scripts/docker-prod.sh update

# 3. Run migrations if needed
./scripts/docker-prod.sh migrate

# 4. Monitor logs
./scripts/docker-prod.sh logs
```

### Database Backup & Restore

```bash
# Create backup
./scripts/docker-prod.sh backup
# Output: backups/social_sync_backup_20240101_120000.sql.gz

# Restore from backup
./scripts/docker-prod.sh restore backups/social_sync_backup_20240101_120000.sql.gz
```

## Troubleshooting

### Scripts not executable
```bash
chmod +x scripts/*.sh
```

### Permission denied errors
```bash
# On Linux/Mac, ensure scripts are executable
chmod +x scripts/docker-dev.sh scripts/docker-prod.sh scripts/docker.sh
```

### Services won't start
```bash
# Check Docker is running
docker info

# Check logs for errors
./scripts/docker-dev.sh logs

# Check service status
./scripts/docker-dev.sh status
```

### Database connection issues
```bash
# Verify database is running
./scripts/docker-dev.sh status

# Check database logs
./scripts/docker-dev.sh logs postgres

# Access database shell
./scripts/docker-dev.sh db-shell
```

### Port already in use
```bash
# Check what's using the port
lsof -i :8080  # Mac/Linux
netstat -ano | findstr :8080  # Windows

# Stop existing container
./scripts/docker-dev.sh stop

# Or change port in docker-compose.yml and .env
```

## Environment Variables

### Development (.env)
```env
NODE_ENV=development
PORT=8080
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/social_sync_dev
JWT_SECRET=dev-secret-change-in-production
```

### Production (.env)
```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://postgres:secure-password@postgres:5432/social_sync
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your-secure-password
POSTGRES_DB=social_sync
```

## Notes

- All scripts include safety checks and validation
- Production scripts require explicit confirmation for destructive operations
- Backups are stored in `backups/` directory (auto-created)
- Logs follow with `Ctrl+C` to exit
- Services are automatically restarted on failure (unless-stopped policy)

## Script Features

✅ Color-coded output for better readability  
✅ Safety checks (Docker running, files exist, env vars)  
✅ Help messages for all commands  
✅ Error handling with informative messages  
✅ Database health checks before starting backend  
✅ Automatic backup compression  
✅ Resource usage monitoring (production)  
✅ Confirmation prompts for destructive operations  

