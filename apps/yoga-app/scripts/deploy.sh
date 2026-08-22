#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
APP_DIR="$ROOT_DIR/apps/yoga-app"

# Enable modern Docker builder
export DOCKER_BUILDKIT=1

# Load environment variables
ENV_FILE=""
if [ -f "$APP_DIR/.env" ]; then
  ENV_FILE="$APP_DIR/.env"
elif [ -f "$ROOT_DIR/.env" ]; then
  ENV_FILE="$ROOT_DIR/.env"
fi

if [ -n "$ENV_FILE" ]; then
  echo "==> Loading environment variables from $ENV_FILE"

  set -a
  source <(
    grep -v '^\s*#' "$ENV_FILE" \
    | grep -v '^\s*$' \
    | sed 's/^[[:space:]]*//; s/[[:space:]]*=/=/'
  )
  set +a
fi

cd "$APP_DIR"

IMAGE_NAME="${IMAGE_NAME:-yoga-app-frontend}"
CONTAINER_NAME="${CONTAINER_NAME:-yoga-app-frontend}"
HOST_PORT="${HOST_PORT:-3000}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"
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

echo "==> Stopping existing container (if any)..."
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

echo "==> Removing old image (if any)..."
docker rmi "$IMAGE_NAME" 2>/dev/null || true

echo "==> Cleaning old build cache..."
docker builder prune -f >/dev/null 2>&1 || true

echo "==> Building frontend image: $IMAGE_NAME"

docker build \
  --rm \
  --build-arg "VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8080}" \
  -t "$IMAGE_NAME" \
  -f "$APP_DIR/Dockerfile" \
  "$ROOT_DIR"

echo "==> Starting frontend container: $CONTAINER_NAME"

docker run -d \
  --name "$CONTAINER_NAME" \
  -e PORT="$CONTAINER_PORT" \
  -e NODE_ENV=production \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  --log-driver json-file \
  --log-opt "max-size=${DOCKER_LOG_MAX_SIZE}" \
  --log-opt "max-file=${DOCKER_LOG_MAX_FILES}" \
  --restart unless-stopped \
  "$IMAGE_NAME"

echo "==> Final cleanup..."
cleanup_old_images "$IMAGE_NAME"
docker image prune -f >/dev/null 2>&1 || true
docker builder prune -af --filter "until=${DOCKER_CACHE_MAX_AGE:-168h}" >/dev/null 2>&1 || true

echo "==> Container status"
docker ps --filter "name=^${CONTAINER_NAME}$"

echo ""
echo "Deployed successfully."
echo "  Frontend: http://localhost:${HOST_PORT}"
echo "  API URL:  ${VITE_API_BASE_URL:-http://localhost:8080}"
echo "  Logs:     docker logs -f ${CONTAINER_NAME}"
