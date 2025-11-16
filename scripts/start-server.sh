#!/bin/bash

# Simple wrapper to prevent ELIFECYCLE errors and handle graceful shutdown
# Usage: ./scripts/start-server.sh <environment>

ENV=${1:-development}

echo "🚀 Starting server in $ENV mode"
echo "💡 Press Ctrl+C to stop (clean shutdown)"

# Function to handle shutdown
cleanup() {
    echo "\n🛑 Shutting down server..."
    # Kill all child processes
    jobs -p | xargs -r kill 2>/dev/null
    echo "✅ Server stopped"
    exit 0
}

# Set up trap for clean exit
trap cleanup INT TERM

# Start the appropriate server based on environment
case $ENV in
    development)
        # Development with hot reload
        npx dotenv-cli -e .env.development -- npm run dev 2>&1 | sed 's/^.*ELIFECYCLE.*$//' | grep -v "Command failed" || true
        ;;
    production)
        # Production server
        npx dotenv-cli -e .env.production -- npm run start 2>&1 | sed 's/^.*ELIFECYCLE.*$//' | grep -v "Command failed" || true
        ;;
    test)
        # Test server
        npx dotenv-cli -e .env.test -- npm run start 2>&1 | sed 's/^.*ELIFECYCLE.*$//' | grep -v "Command failed" || true
        ;;
    *)
        echo "❌ Unknown environment: $ENV"
        echo "Available: development, production, test"
        exit 1
        ;;
esac

# Clean exit
cleanup
