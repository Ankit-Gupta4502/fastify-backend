# Docker Setup Guide

This guide explains how to run the Social Sync Backend using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0 or higher)

## Quick Start

### Production Setup

1. **Create a `.env` file** in the root directory:
   ```env
   NODE_ENV=production
   PORT=8080
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your-secure-password
   POSTGRES_DB=social_sync
   POSTGRES_PORT=5432
   DATABASE_URL=postgresql://postgres:your-secure-password@postgres:5432/social_sync
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
   ```

2. **Build and start all services**:
   ```bash
   docker-compose up -d
   ```

3. **Run database migrations** (first time only):
   ```bash
   # Option 1: Run migrations inside the container
   docker-compose exec backend npm run db:push

   # Option 2: Generate and run migrations locally
   npm run db:generate
   docker-compose exec backend npm run db:push
   ```

4. **Check logs**:
   ```bash
   docker-compose logs -f backend
   ```

5. **Access the API**:
   - Backend: http://localhost:8080
   - Database: localhost:5432

### Development Setup

1. **Use the development compose file**:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

   This will:
   - Mount source code for hot reload
   - Use development environment variables
   - Enable TypeScript watch mode

2. **Access database tools** (optional):
   ```bash
   # Start Adminer (database management UI)
   docker-compose --profile tools up adminer
   # Access at http://localhost:8081
   ```

## Docker Commands

### Build

```bash
# Build production image
docker build -t social-sync-backend:latest .

# Build development image
docker build -f Dockerfile.dev -t social-sync-backend:dev .
```

### Run

```bash
# Run production container
docker run -p 8080:8080 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e JWT_SECRET=your-secret \
  social-sync-backend:latest

# Run development container
docker run -p 8080:8080 \
  -v $(pwd)/src:/app/src \
  -e DATABASE_URL=postgresql://user:pass@host:5432/db \
  -e JWT_SECRET=your-secret \
  social-sync-backend:dev
```

### Docker Compose

```bash
# Start all services in detached mode
docker-compose up -d

# Start with development configuration
docker-compose -f docker-compose.dev.yml up

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Restart a service
docker-compose restart backend

# Execute commands in container
docker-compose exec backend npm run db:push
docker-compose exec backend sh

# Scale services (if needed)
docker-compose up -d --scale backend=3
```

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `NODE_ENV` | Environment mode | `production` | No |
| `PORT` | Server port | `8080` | No |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `POSTGRES_USER` | PostgreSQL username | `postgres` | No |
| `POSTGRES_PASSWORD` | PostgreSQL password | `postgres` | No |
| `POSTGRES_DB` | Database name | `social_sync` | No |
| `POSTGRES_PORT` | PostgreSQL port | `5432` | No |

## Database Migrations

### Running Migrations

```bash
# Generate migrations from schema changes
npm run db:generate

# Push migrations to database (inside container)
docker-compose exec backend npm run db:push

# Or run locally if you have local PostgreSQL
npm run db:push
```

### First-Time Setup

1. Start the database:
   ```bash
   docker-compose up -d postgres
   ```

2. Wait for database to be healthy (check with `docker-compose ps`)

3. Generate migrations:
   ```bash
   npm run db:generate
   ```

4. Run migrations:
   ```bash
   docker-compose exec backend npm run db:push
   ```

## Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs backend

# Check container status
docker-compose ps

# Verify environment variables
docker-compose exec backend env | grep DATABASE_URL
```

### Database connection issues

1. **Verify database is running**:
   ```bash
   docker-compose ps postgres
   ```

2. **Check database health**:
   ```bash
   docker-compose exec postgres pg_isready -U postgres
   ```

3. **Verify connection string**:
   ```bash
   docker-compose exec backend env | grep DATABASE_URL
   ```

4. **Connect to database manually**:
   ```bash
   docker-compose exec postgres psql -U postgres -d social_sync
   ```

### Port already in use

If port 8080 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "3000:8080"  # Host port : Container port
```

Or set `PORT` environment variable for the host port.

### Permission issues

If you encounter permission issues:
```bash
# Fix ownership (on Linux/Mac)
sudo chown -R $USER:$USER .

# Or run with user override
docker-compose exec --user nodejs backend sh
```

### Rebuild after code changes

```bash
# Rebuild and restart
docker-compose up -d --build backend

# Or force rebuild without cache
docker-compose build --no-cache backend
docker-compose up -d backend
```

## Production Deployment

### Image Optimization

The Dockerfile uses multi-stage builds to:
- Minimize image size (~100MB vs ~500MB+)
- Include only production dependencies
- Run as non-root user for security

### Security Best Practices

1. **Never commit `.env` files** - Use secrets management
2. **Use strong `JWT_SECRET`** - Minimum 32 characters, random
3. **Change default PostgreSQL password**
4. **Use Docker secrets** for sensitive data in production
5. **Regularly update base images**:
   ```bash
   docker pull node:20-alpine
   docker-compose build --no-cache
   ```

### Deployment Options

#### Option 1: Docker Compose (Simple)
```bash
docker-compose up -d
```

#### Option 2: Kubernetes
```bash
# Build and push to registry
docker build -t your-registry/social-sync-backend:latest .
docker push your-registry/social-sync-backend:latest

# Deploy with kubectl
kubectl apply -f k8s/
```

#### Option 3: Cloud Platforms
- **AWS ECS**: Use task definitions
- **Google Cloud Run**: Deploy as container
- **Azure Container Apps**: Deploy via Azure CLI
- **DigitalOcean App Platform**: Use Dockerfile option

## Volume Management

### Persistent Volumes

Database data is persisted in Docker volumes:
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect social-sync-backend_postgres_data

# Backup database
docker-compose exec postgres pg_dump -U postgres social_sync > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres social_sync < backup.sql
```

### Remove Volumes

⚠️ **Warning**: This deletes all database data!
```bash
docker-compose down -v
```

## Monitoring

### Health Checks

Add a health endpoint to your application:
```typescript
// In src/index.ts
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});
```

Then uncomment the HEALTHCHECK in Dockerfile.

### Logs

```bash
# Follow logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Logs with timestamps
docker-compose logs -f -t backend
```

## Cleanup

```bash
# Stop and remove containers
docker-compose down

# Remove containers, networks, and volumes
docker-compose down -v

# Remove images
docker rmi social-sync-backend:latest

# Remove all unused resources
docker system prune -a
```

