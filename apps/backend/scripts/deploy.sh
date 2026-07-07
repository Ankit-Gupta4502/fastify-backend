#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT_DIR/../.." && pwd)"
cd "$ROOT_DIR"

IMAGE_NAME="${IMAGE_NAME:-fastify-backend}"
MIGRATE_IMAGE_NAME="${MIGRATE_IMAGE_NAME:-fastify-backend-migrate}"
CONTAINER_NAME="${CONTAINER_NAME:-fastify-backend}"
HOST_PORT="${HOST_PORT:-8080}"
CONTAINER_PORT="${CONTAINER_PORT:-8080}"
ENV_FILE="${ENV_FILE:-$REPO_ROOT/.env}"
NETWORK_NAME="${NETWORK_NAME:-yoga-app-network}"
REDIS_CONTAINER_NAME="${REDIS_CONTAINER_NAME:-yoga-app-redis}"
REDIS_VOLUME_NAME="${REDIS_VOLUME_NAME:-yoga-app-redis-data}"
REDIS_PASSWORD="${REDIS_PASSWORD:-redis}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found. Create a root .env and fill in values."
  exit 1
fi

# Docker --env-file rejects whitespace in variable names; sanitize into a temp file.
CLEAN_ENV_FILE="$(mktemp)"
trap 'rm -f "$CLEAN_ENV_FILE"' EXIT
grep -v '^\s*#' "$ENV_FILE" | grep -v '^\s*$' | sed 's/^[[:space:]]*//; s/[[:space:]]*=/=/' > "$CLEAN_ENV_FILE"
ENV_FILE="$CLEAN_ENV_FILE"

echo "==> Ensuring docker network exists: $NETWORK_NAME"
docker network create "$NETWORK_NAME" >/dev/null 2>&1 || true

echo "==> Ensuring Redis is running: $REDIS_CONTAINER_NAME"
if docker ps -q --filter "name=^${REDIS_CONTAINER_NAME}$" | grep -q .; then
  echo "$REDIS_CONTAINER_NAME already running — leaving as-is (data persists across deploys)."
elif docker ps -aq --filter "name=^${REDIS_CONTAINER_NAME}$" | grep -q .; then
  echo "$REDIS_CONTAINER_NAME exists but is stopped — starting it."
  docker start "$REDIS_CONTAINER_NAME" >/dev/null
else
  docker volume create "$REDIS_VOLUME_NAME" >/dev/null
  docker run -d \
    --name "$REDIS_CONTAINER_NAME" \
    --network "$NETWORK_NAME" \
    -v "$REDIS_VOLUME_NAME:/data" \
    --restart unless-stopped \
    redis:7-alpine redis-server --requirepass "$REDIS_PASSWORD" --appendonly yes >/dev/null
  echo "Started $REDIS_CONTAINER_NAME."
fi
# Redis may pre-date this script's network (e.g. from an older deploy) — make
# sure it's attached so the backend container can reach it by name.
docker network connect "$NETWORK_NAME" "$REDIS_CONTAINER_NAME" >/dev/null 2>&1 || true

echo "==> Running database migrations..."
docker build --target build -t "$MIGRATE_IMAGE_NAME" -f "$ROOT_DIR/Dockerfile" "$REPO_ROOT"
docker run --rm --env-file "$ENV_FILE" "$MIGRATE_IMAGE_NAME" pnpm --filter @yoga-app/backend db:migrate
docker rmi -f "$MIGRATE_IMAGE_NAME" 2>/dev/null || true

echo "==> Stopping existing container (if any)..."
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
docker rmi -f "$IMAGE_NAME" 2>/dev/null || true

echo "==> Building image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" -f "$ROOT_DIR/Dockerfile" "$REPO_ROOT"

echo "==> Starting container: $CONTAINER_NAME"
docker run -d \
  --name "$CONTAINER_NAME" \
  --network "$NETWORK_NAME" \
  --env-file "$ENV_FILE" \
  -e "REDIS_URL=redis://:${REDIS_PASSWORD}@${REDIS_CONTAINER_NAME}:6379" \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  --restart unless-stopped \
  "$IMAGE_NAME"

echo "==> Container status"
docker ps --filter "name=^${CONTAINER_NAME}$" --filter "name=^${REDIS_CONTAINER_NAME}$"

echo "==> Pruning dangling images..."
docker image prune -f

echo ""
echo "Deployed successfully."
echo "  API:       http://localhost:${HOST_PORT}"
echo "  Health:    http://localhost:${HOST_PORT}/health"
echo "  Logs:      docker logs -f ${CONTAINER_NAME}"
echo "  Redis:     docker logs -f ${REDIS_CONTAINER_NAME}"
