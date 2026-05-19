#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
APP_DIR="$ROOT_DIR/apps/yoga-app"

# Load environment variables — app-specific .env takes precedence over root .env
ENV_FILE=""
if [ -f "$APP_DIR/.env" ]; then
  ENV_FILE="$APP_DIR/.env"
elif [ -f "$ROOT_DIR/.env" ]; then
  ENV_FILE="$ROOT_DIR/.env"
fi

if [ -n "$ENV_FILE" ]; then
  echo "==> Loading environment variables from $ENV_FILE"
  set -a
  # Strip leading/trailing whitespace around keys and skip comments/blanks
  source <(grep -v '^\s*#' "$ENV_FILE" | grep -v '^\s*$' | sed 's/^[[:space:]]*//; s/[[:space:]]*=/=/')
  set +a
fi

cd "$APP_DIR"

IMAGE_NAME="${IMAGE_NAME:-yoga-app-frontend}"
CONTAINER_NAME="${CONTAINER_NAME:-yoga-app-frontend}"
HOST_PORT="${HOST_PORT:-3000}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"

echo "==> Building frontend image: $IMAGE_NAME"
docker build \
  --build-arg "VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8080}" \
  -t "$IMAGE_NAME" \
  -f "$APP_DIR/Dockerfile" \
  "$ROOT_DIR"

echo "==> Stopping existing frontend container (if any)..."
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

echo "==> Starting frontend container: $CONTAINER_NAME"
docker run -d \
  --name "$CONTAINER_NAME" \
  -e PORT="$CONTAINER_PORT" \
  -e NODE_ENV=production \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  --restart unless-stopped \
  "$IMAGE_NAME"

echo "==> Container status"
docker ps --filter "name=^${CONTAINER_NAME}$"

echo ""
echo "Deployed successfully."
echo "  Frontend: http://localhost:${HOST_PORT}"
echo "  API URL:  ${VITE_API_BASE_URL:-http://localhost:8080}"
echo "  Logs:     docker logs -f ${CONTAINER_NAME}"
