#!/bin/bash

# Universal Docker Management Script
# Usage: ./scripts/docker.sh [env] [command]
#   env: dev (default) or prod

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Parse arguments
ENV=${1:-dev}
COMMAND=${2:-help}

# Validate environment
if [ "$ENV" != "dev" ] && [ "$cleaENV" != "prod" ]; then
    echo -e "${RED}Error: Invalid environment '$ENV'. Use 'dev' or 'prod'.${NC}"
    echo ""
    echo "Usage: ./scripts/docker.sh [env] [command]"
    echo "  env: dev (default) or prod"
    echo "  command: start, stop, logs, etc."
    exit 1
fi

# Route to appropriate script
if [ "$ENV" = "dev" ]; then
    exec "$SCRIPT_DIR/docker-dev.sh" "$COMMAND" "${@:3}"
else
    exec "$SCRIPT_DIR/docker-prod.sh" "$COMMAND" "${@:3}"
fi

