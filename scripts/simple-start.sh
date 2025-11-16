#!/bin/bash

# Ultra-simple server start for troubleshooting
# Usage: ./scripts/simple-start.sh <environment>

ENV=${1:-development}

echo "🚀 Starting $ENV server (simple mode)"

case $ENV in
    development)
        echo "Command: npx dotenv-cli -e .env.development -- vite dev"
        npx dotenv-cli -e .env.development -- vite dev
        ;;
    production)
        echo "Command: npx dotenv-cli -e .env.production -- node build/index.js"
        npx dotenv-cli -e .env.production -- node build/index.js
        ;;
    test)
        echo "Command: npx dotenv-cli -e .env.test -- node build/index.js"
        npx dotenv-cli -e .env.test -- node build/index.js
        ;;
    *)
        echo "❌ Unknown environment: $ENV"
        exit 1
        ;;
esac

echo "\n✅ Server stopped"
