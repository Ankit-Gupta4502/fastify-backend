# Yoga App Frontend Deployment

This frontend now includes Docker and shell deployment helpers under `apps/yoga-app`.

## Production

```bash
pnpm --filter @yoga-app/web build
pnpm --filter @yoga-app/web start
```

Docker deployment:

```bash
cd apps/yoga-app
./scripts/deploy.sh
```

Optional environment overrides:

```bash
IMAGE_NAME=my-yoga-app
CONTAINER_NAME=my-yoga-app
HOST_PORT=3000
CONTAINER_PORT=3000
VITE_API_BASE_URL=https://api.example.com
./scripts/deploy.sh
```

## Development Container

```bash
cd apps/yoga-app
./scripts/docker.sh start
./scripts/docker.sh logs
./scripts/docker.sh stop
```

## Files

- `Dockerfile`: production build and runtime image
- `Dockerfile.dev`: development image
- `scripts/deploy.sh`: build and run the production container
- `scripts/docker.sh`: local development container helper
