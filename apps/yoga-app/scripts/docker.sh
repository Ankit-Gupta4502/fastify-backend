#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
APP_DIR="$ROOT_DIR/apps/yoga-app"

IMAGE_NAME="${IMAGE_NAME:-yoga-app-frontend-dev}"
CONTAINER_NAME="${CONTAINER_NAME:-yoga-app-frontend-dev}"
HOST_PORT="${HOST_PORT:-3000}"
CONTAINER_PORT="${CONTAINER_PORT:-3000}"

cd "$ROOT_DIR"

case "${1:-help}" in
  build)
    docker build \
      --build-arg "VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://host.docker.internal:8080}" \
      -t "$IMAGE_NAME" \
      -f "$APP_DIR/Dockerfile.dev" \
      "$ROOT_DIR"
    ;;
  start)
    docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
    docker build \
      --build-arg "VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://host.docker.internal:8080}" \
      -t "$IMAGE_NAME" \
      -f "$APP_DIR/Dockerfile.dev" \
      "$ROOT_DIR"
    docker run -d \
      --name "$CONTAINER_NAME" \
      -p "${HOST_PORT}:${CONTAINER_PORT}" \
      --restart unless-stopped \
      "$IMAGE_NAME"
    docker ps --filter "name=^${CONTAINER_NAME}$"
    ;;
  stop)
    docker rm -f "$CONTAINER_NAME" 2>/dev/null || true
    ;;
  logs)
    docker logs -f "$CONTAINER_NAME"
    ;;
  status)
    docker ps --filter "name=^${CONTAINER_NAME}$"
    ;;
  help|*)
    cat <<'EOF'
Usage: ./scripts/docker.sh [command]

Commands:
  build   Build the development image
  start   Build and run the development container
  stop    Stop and remove the development container
  logs    Follow development container logs
  status  Show development container status
EOF
    ;;
esac
