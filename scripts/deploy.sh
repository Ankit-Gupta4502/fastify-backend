#!/usr/bin/env bash
# Root deploy script — orchestrates backend and frontend together.
#
# Usage: ./scripts/deploy.sh [command] [options]
#
#   deploy            Build, migrate, and start both services (default)
#   stop              Stop both containers
#   restart           Stop then full-deploy both
#   status            Show running containers for both
#   logs [service]    Tail logs  (backend | frontend, default: backend)
#   help              Show this message

set -euo pipefail

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_SCRIPT="$ROOT_DIR/apps/backend/scripts/deploy.sh"
FRONTEND_SCRIPT="$ROOT_DIR/apps/yoga-app/scripts/deploy.sh"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

COMMAND="${1:-deploy}"

# Container names (must match defaults in each sub-script)
BACKEND_CONTAINER="${CONTAINER_NAME:-fastify-backend}"
FRONTEND_CONTAINER="yoga-app-frontend"

# ── Helpers ───────────────────────────────────────────────────────────────────
section() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }
ok()      { echo -e "${GREEN}✓ $1${NC}"; }

stop_container() {
  local name="$1"
  if docker ps -aq --filter "name=^${name}$" | grep -q .; then
    docker rm -f "$name"
    ok "$name stopped and removed."
  else
    echo -e "${YELLOW}$name is not present.${NC}"
  fi
}

# ── Commands ──────────────────────────────────────────────────────────────────
cmd_deploy() {
  section "Backend — deploy"
  bash "$BACKEND_SCRIPT"

  section "Frontend — deploy"
  bash "$FRONTEND_SCRIPT"

  ok "Full deploy complete."
  echo -e "  Backend:  http://localhost:${HOST_PORT:-8080}"
  echo -e "  Frontend: http://localhost:3000"
}

cmd_stop() {
  section "Backend — stop"
  stop_container "$BACKEND_CONTAINER"

  section "Frontend — stop"
  stop_container "$FRONTEND_CONTAINER"
}

cmd_restart() {
  cmd_stop
  cmd_deploy
}

cmd_status() {
  section "Container status"
  docker ps \
    --filter "name=^${BACKEND_CONTAINER}$" \
    --filter "name=^${FRONTEND_CONTAINER}$" \
    --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

cmd_logs() {
  local service="${2:-backend}"
  case "$service" in
    backend)  docker logs -f --tail=100 "$BACKEND_CONTAINER" ;;
    frontend) docker logs -f --tail=100 "$FRONTEND_CONTAINER" ;;
    *)
      echo -e "${RED}Unknown service '$service'. Use: backend | frontend${NC}"
      exit 1
      ;;
  esac
}

show_help() {
  echo -e "${BLUE}Root Deploy Script${NC}"
  echo ""
  echo "Usage: ./scripts/deploy.sh [command] [options]"
  echo ""
  echo "Commands:"
  echo "  deploy            Build, migrate, and start both services (default)"
  echo "  stop              Stop both containers"
  echo "  restart           Stop then full-deploy both"
  echo "  status            Show container status for both"
  echo "  logs [service]    Tail logs  (backend | frontend, default: backend)"
  echo "  help              Show this message"
  echo ""
  echo "Underlying scripts:"
  echo "  Backend:   apps/backend/scripts/deploy.sh"
  echo "  Frontend:  apps/yoga-app/scripts/deploy.sh"
}

# ── Dispatch ──────────────────────────────────────────────────────────────────
case "$COMMAND" in
  deploy)         cmd_deploy ;;
  stop)           cmd_stop ;;
  restart)        cmd_restart ;;
  status)         cmd_status ;;
  logs)           cmd_logs "$@" ;;
  help|--help|-h) show_help ;;
  *)
    echo -e "${RED}Unknown command: $COMMAND${NC}"
    echo ""
    show_help
    exit 1
    ;;
esac
