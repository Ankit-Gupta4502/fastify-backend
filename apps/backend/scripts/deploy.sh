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
docker build --target build -t "$MIGRATE_IMAGE_NAME" -f "$ROOT_DIR/Dockerfile" "$REPO_ROOT"
docker run --rm --env-file "$ENV_FILE" "$MIGRATE_IMAGE_NAME" pnpm --filter @yoga-app/backend db:migrate

echo "==> Stopping existing container (if any)..."
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

echo "==> Building image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" -f "$ROOT_DIR/Dockerfile" "$REPO_ROOT"

echo "==> Starting container: $CONTAINER_NAME"
docker run -d \
  --name "$CONTAINER_NAME" \
  --env-file "$ENV_FILE" \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  --restart unless-stopped \
  "$IMAGE_NAME"

echo "==> Container status"
docker ps --filter "name=^${CONTAINER_NAME}$"

echo ""
echo "Deployed successfully."
echo "  API:    http://localhost:${HOST_PORT}"
echo "  Health: http://localhost:${HOST_PORT}/health"
echo "  Logs:   docker logs -f ${CONTAINER_NAME}"
