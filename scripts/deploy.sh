#!/usr/bin/env bash
# Root deploy script — orchestrates backend (Docker) and frontend (yoga-app) together.
#
# Usage: ./scripts/deploy.sh [command] [options]
#
#   deploy            Full deploy: start backend (prod) + build & run frontend (default)
#   build             Build both images without starting
#   start             Start backend (prod) + deploy frontend
#   stop              Stop both backend and frontend containers
#   restart           Restart backend; redeploy frontend
#   update            Update & restart backend; redeploy frontend
#   status            Show status of both services
#   logs [service]    Tail logs  (service: backend | postgres | frontend, default: backend)
#   migrate           Run backend DB migrations
#   help              Show this message

set -euo pipefail

# ── Paths ─────────────────────────────────────────────────────────────────────
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_SCRIPT="$ROOT_DIR/apps/backend/scripts/docker.sh"
FRONTEND_SCRIPT="$ROOT_DIR/apps/yoga-app/scripts/deploy.sh"

# ── Colors ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

COMMAND="${1:-deploy}"

# ── Helpers ───────────────────────────────────────────────────────────────────
section() { echo -e "\n${CYAN}━━━ $1 ━━━${NC}"; }
ok()      { echo -e "${GREEN}✓ $1${NC}"; }

backend() { bash "$BACKEND_SCRIPT" prod "$@"; }
frontend() { bash "$FRONTEND_SCRIPT" "$@"; }

# ── Commands ──────────────────────────────────────────────────────────────────
cmd_deploy() {
  section "Backend — build"
  backend build

  section "Backend — start"
  backend start

  section "Frontend — deploy"
  frontend

  ok "Full deploy complete."
  echo -e "  Backend:  http://localhost:${PORT:-8080}"
  echo -e "  Frontend: http://localhost:${HOST_PORT:-3000}"
}

cmd_build() {
  section "Backend — build"
  backend build
  section "Frontend — build"
  frontend
  ok "Both images built."
}

cmd_start() {
  section "Backend — start"
  backend start
  section "Frontend — deploy"
  frontend
  ok "All services started."
}

cmd_stop() {
  section "Backend — stop"
  backend stop

  section "Frontend — stop"
  CONTAINER_NAME="${CONTAINER_NAME:-yoga-app-frontend}"
  if docker ps -q --filter "name=^${CONTAINER_NAME}$" | grep -q .; then
    docker stop "$CONTAINER_NAME" && docker rm "$CONTAINER_NAME"
    ok "Frontend container stopped."
  else
    echo -e "${YELLOW}Frontend container not running.${NC}"
  fi
}

cmd_restart() {
  section "Backend — restart"
  backend restart
  section "Frontend — redeploy"
  frontend
  ok "All services restarted."
}

cmd_update() {
  section "Backend — update"
  backend update
  section "Frontend — redeploy"
  frontend
  ok "All services updated."
}

cmd_status() {
  section "Backend — status"
  backend status
  section "Frontend — status"
  CONTAINER_NAME="${CONTAINER_NAME:-yoga-app-frontend}"
  docker ps --filter "name=^${CONTAINER_NAME}$" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

cmd_logs() {
  SERVICE="${2:-backend}"
  if [ "$SERVICE" = "frontend" ]; then
    CONTAINER_NAME="${CONTAINER_NAME:-yoga-app-frontend}"
    docker logs -f --tail=100 "$CONTAINER_NAME"
  else
    backend logs "$SERVICE"
  fi
}

cmd_migrate() {
  section "Backend — migrate"
  backend migrate
  ok "Migrations complete."
}

show_help() {
  echo -e "${BLUE}Root Deploy Script${NC}"
  echo ""
  echo "Usage: ./scripts/deploy.sh [command] [options]"
  echo ""
  echo "Commands:"
  echo "  deploy            Full deploy: build + start backend (prod) and frontend (default)"
  echo "  build             Build both images without starting"
  echo "  start             Start backend (prod) + deploy frontend"
  echo "  stop              Stop both backend and frontend"
  echo "  restart           Restart backend; redeploy frontend"
  echo "  update            Update & restart backend; redeploy frontend"
  echo "  status            Show status of both services"
  echo "  logs [service]    Tail logs  (backend | postgres | frontend, default: backend)"
  echo "  migrate           Run backend DB migrations"
  echo "  help              Show this message"
  echo ""
  echo "Underlying scripts:"
  echo "  Backend:   apps/backend/scripts/docker.sh  (always run in prod mode)"
  echo "  Frontend:  apps/yoga-app/scripts/deploy.sh"
}

# ── Dispatch ──────────────────────────────────────────────────────────────────
case "$COMMAND" in
  deploy)         cmd_deploy ;;
  build)          cmd_build ;;
  start)          cmd_start ;;
  stop)           cmd_stop ;;
  restart)        cmd_restart ;;
  update)         cmd_update ;;
  status)         cmd_status ;;
  logs)           cmd_logs "$@" ;;
  migrate)        cmd_migrate ;;
  help|--help|-h) show_help ;;
  *)
    echo -e "${RED}Unknown command: $COMMAND${NC}"
    echo ""
    show_help
    exit 1
    ;;
esac
