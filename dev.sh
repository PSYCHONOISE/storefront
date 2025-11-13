#!/bin/bash
set -e

# Saleor SvelteKit Storefront - Development CLI
# Usage: ./dev.sh [command] [environment]

COMMAND=${1:-help}
ENV=${2:-development}

# Check Node.js version requirement (skip for Docker commands)
if [ "$COMMAND" != "docker" ]; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 22 ]; then
        echo "⚠️  Node.js version $NODE_VERSION detected. This project requires Node.js 22+"
        echo "💡 Please update Node.js or use nvm:"
        echo "   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash"
        echo "   nvm install 22"
        echo "   nvm use 22"
        exit 1
    fi
fi

# Detect available package manager with preference for pnpm
# First try to enable pnpm via corepack if available
if command -v corepack > /dev/null 2>&1; then
    corepack enable 2>/dev/null || true
fi

# Check for pnpm first (preferred)
if command -v pnpm > /dev/null 2>&1 && pnpm --version > /dev/null 2>&1; then
    # Test if pnpm can execute dotenv (the actual command for $DOTENV_CMD package)
    if pnpm exec dotenv --help > /dev/null 2>&1; then
        PKG_MANAGER="pnpm"
        PKG_EXEC="pnpm exec"
        DOTENV_CMD="dotenv"  # pnpm uses 'dotenv' command from dotenv-cli package
        echo "📦 Using package manager: $PKG_MANAGER (with pnpm configuration)"
    else
        echo "⚠️  pnpm found but dotenv not available, falling back to npm"
        PKG_MANAGER="npm"
        PKG_EXEC="npx"
        DOTENV_CMD="dotenv-cli"  # npm uses 'dotenv-cli' command
        echo "📦 Using package manager: $PKG_MANAGER (fallback from pnpm)"
    fi
elif command -v npm > /dev/null 2>&1 && npm --version > /dev/null 2>&1; then
    PKG_MANAGER="npm"
    PKG_EXEC="npx"
    DOTENV_CMD="dotenv-cli"  # npm uses 'dotenv-cli' command
    # Create npm-friendly config if needed
    if [ -f ".pnpmrc" ] && [ ! -f ".npmrc" ]; then
        echo "🔧 Creating npm-compatible .npmrc from .pnpmrc"
        echo "save-exact=true" > .npmrc
    fi
    echo "📦 Using package manager: $PKG_MANAGER (with npm configuration)"
else
    echo "❌ No package manager found. Please install npm or pnpm."
    exit 1
fi

show_help() {
    echo "🌐 Saleor SvelteKit Storefront - Development CLI"
    echo ""
    echo "Usage: ./dev.sh [command] [environment]"
    echo ""
    echo "Commands:"
    echo "  start [env]     - Start development server"
    echo "  docker [env]    - Start in Docker (test env runs tests)"
    echo "  build [env]     - Build for production"
    echo "  test [env]      - Run tests locally"
    echo "  stop [env]      - Stop Docker containers"
    echo "  logs [env]      - Show Docker logs"
    echo "  status          - Show Docker container status"
    echo "  clean           - Clean Docker containers and images"
    echo "  install         - Install Playwright browsers"
    echo "  help            - Show this help"
    echo ""
    echo "Environments:"
    echo "  development     - Local development (port 3000)"
    echo "  production      - Production build (port 3001)"
    echo "  test            - Testing environment (port 3002)"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh start                    # Start local dev server"
    echo "  ./dev.sh docker development       # Start dev Docker container"
    echo "  ./dev.sh docker production        # Start prod Docker container"
    echo "  ./dev.sh docker test              # Run tests in Docker"
    echo "  ./dev.sh test                     # Run tests (auto-detects servers)"
    echo "  ./dev.sh test production          # Test against production (auto-starts if needed)"
    echo "  ./dev.sh build production         # Build for production"
}

start_local() {
    echo "🚀 Starting local server ($ENV)..."
    case $ENV in
        development)
            echo "💻 Development mode with hot reload (port 3000)"
            ./scripts/dev-start.sh
            ;;
        production)
            echo "🎭 Production mode with optimized build (port 3001)"
            $PKG_MANAGER run build:production && ./scripts/start-clean.sh production
            ;;
        test)
            echo "🧪 Test mode for testing environment (port 3002)"
            $PKG_MANAGER run build:test && ./scripts/start-clean.sh test
            ;;
        *)
            echo "❌ Unknown environment: $ENV"
            exit 1
            ;;
    esac
}

start_docker() {
    if [ "$ENV" = "test" ]; then
        echo "🧪 Running Docker tests..."
        ./test-docker.sh
    else
        echo "🐳 Starting Docker containers ($ENV)..."
        ./deploy.sh $ENV
    fi
}

build_project() {
    echo "🏗️  Building project ($ENV)..."
    case $ENV in
        development)
            $PKG_EXEC $DOTENV_CMD -e .env.development -- $PKG_MANAGER run build
            ;;
        production)
            $PKG_MANAGER run build:production
            ;;
        test)
            $PKG_EXEC $DOTENV_CMD -e .env.test -- $PKG_MANAGER run build
            ;;
        *)
            echo "❌ Unknown environment: $ENV"
            exit 1
            ;;
    esac
}

run_tests() {
    echo "🧪 Running tests ($ENV)..."
    
    # Check if Playwright browsers are installed
    if ! $PKG_EXEC playwright --version > /dev/null 2>&1; then
        echo "📺 Installing Playwright browsers..."
        $PKG_EXEC playwright install
        echo "✅ Playwright browsers installed!"
    fi
    
    echo "ℹ️  Smart server detection enabled - Playwright will:"
    echo "   - Check if server is already running on target port"
    echo "   - Auto-start appropriate server if needed"
    echo "   - Use correct environment configuration"
    echo ""
    
    case $ENV in
        development)
            echo "🎯 Testing against development environment (port 3000)"
            BASE_URL=http://127.0.0.1:3000 $PKG_EXEC $DOTENV_CMD -e .env.test -- $PKG_EXEC playwright test
            ;;
        production)
            echo "🎯 Testing against production environment (port 3001)" 
            BASE_URL=http://127.0.0.1:3001 $PKG_EXEC $DOTENV_CMD -e .env.test -- $PKG_EXEC playwright test
            ;;
        test)
            echo "🎯 Testing against test environment (port 3002)"
            BASE_URL=http://127.0.0.1:3002 $PKG_EXEC $DOTENV_CMD -e .env.test -- $PKG_EXEC playwright test
            ;;
        local)
            echo "🎯 Testing with local configuration (default port)"
            $PKG_EXEC $DOTENV_CMD -e .env.test -- $PKG_EXEC playwright test
            ;;
        *)
            echo "🎯 Testing with default configuration"
            $PKG_EXEC $DOTENV_CMD -e .env.test -- $PKG_EXEC playwright test
            ;;
    esac
}

stop_containers() {
    echo "🛑 Stopping Docker containers ($ENV)..."
    ./stop.sh $ENV
}

show_logs() {
    echo "📝 Showing Docker logs ($ENV)..."
    ./logs.sh $ENV
}

show_status() {
    echo "📊 Checking Docker status..."
    ./status.sh
}

clean_docker() {
    echo "🧹 Cleaning Docker containers and images..."
    docker system prune -f
    echo "✅ Docker cleanup complete!"
}

install_browsers() {
    echo "📺 Installing Playwright browsers..."
    $PKG_EXEC playwright install
    echo "✅ Playwright browsers installed!"
}

case $COMMAND in
    start)
        start_local
        ;;
    docker)
        start_docker
        ;;
    build)
        build_project
        ;;
    test)
        run_tests
        ;;
    stop)
        stop_containers
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    clean)
        clean_docker
        ;;
    install)
        install_browsers
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo "❌ Unknown command: $COMMAND"
        echo ""
        show_help
        exit 1
        ;;
esac
