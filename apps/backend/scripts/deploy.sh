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
DOCKER_LOG_MAX_SIZE="${DOCKER_LOG_MAX_SIZE:-10m}"
DOCKER_LOG_MAX_FILES="${DOCKER_LOG_MAX_FILES:-3}"

cleanup_old_images() {
  local image_name="$1"
  local current_id
  current_id="$(docker image inspect --format '{{.Id}}' "$image_name" 2>/dev/null || true)"
  current_id="${current_id#sha256:}"

  docker image ls "$image_name" --format '{{.Repository}}:{{.Tag}} {{.ID}}' \
    | while read -r image_ref image_id; do
        [[ -z "$image_ref" || "$image_id" == "$current_id" ]] && continue
        docker rmi "$image_ref" 2>/dev/null || true
      done
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found. Create a root .env and fill in values."
  exit 1
fi

# Docker --env-file rejects whitespace in variable names; sanitize into a temp file.
CLEAN_ENV_FILE="$(mktemp)"
trap 'rm -f "$CLEAN_ENV_FILE"' EXIT
grep -v '^\s*#' "$ENV_FILE" | grep -v '^\s*$' | sed 's/^[[:space:]]*//; s/[[:space:]]*=/=/' > "$CLEAN_ENV_FILE"
ENV_FILE="$CLEAN_ENV_FILE"

echo "==> Running database migrations..."
docker build --rm --target build -t "$MIGRATE_IMAGE_NAME" -f "$ROOT_DIR/Dockerfile" "$REPO_ROOT"
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
  --env-file "$ENV_FILE" \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  --log-driver json-file \
  --log-opt "max-size=${DOCKER_LOG_MAX_SIZE}" \
  --log-opt "max-file=${DOCKER_LOG_MAX_FILES}" \
  --restart unless-stopped \
  "$IMAGE_NAME"

echo "==> Container status"
docker ps --filter "name=^${CONTAINER_NAME}$"

echo "==> Removing older images for $IMAGE_NAME..."
cleanup_old_images "$IMAGE_NAME"
echo "==> Pruning dangling images and unused build cache..."
docker image prune -f
docker builder prune -af --filter "until=${DOCKER_CACHE_MAX_AGE:-168h}"

echo ""
echo "Deployed successfully."
echo "  API:    http://localhost:${HOST_PORT}"
echo "  Health: http://localhost:${HOST_PORT}/health"
echo "  Logs:   docker logs -f ${CONTAINER_NAME}"
