# 🚀 Deployment Guide

This guide covers all deployment options for the Saleor SvelteKit Storefront.

## 🎯 Quick Start

```bash
# Show all available commands
./dev.sh help

# Start local development
./dev.sh start

# Start with Docker (development)
./dev.sh docker development

# Run tests
./dev.sh test
```

---

## 📋 Table of Contents

1. [Environment Setup](#-environment-setup)
2. [Local Development](#-local-development)
3. [Docker Deployment](#-docker-deployment)
4. [Vercel Deployment](#-vercel-deployment)
5. [Testing](#-testing)
6. [Environment Variables](#-environment-variables)
7. [Troubleshooting](#-troubleshooting)

---

## 🔧 Environment Setup

### Supported Environments

- **development** - Local development with hot reload
- **production** - Optimized production build
- **test** - Testing environment

### Environment Files

```bash
.env.example        # Template with all available variables
.env.development    # Development configuration
.env.production     # Production configuration
.env.test          # Testing configuration
.env               # Active environment (auto-created)
```

---

## 💻 Local Development

### Option 1: Direct Node.js

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev:local
# or
./dev.sh start development
```

### Option 2: Using specific environment

```bash
# Development
pnpm run dev:local

# Production build locally
pnpm run build:production && pnpm run start
```

### Available Scripts

```bash
pnpm run dev:local           # Local development server
pnpm run build:development   # Build for development
pnpm run build:production    # Build for production
pnpm run build:test         # Build for testing
```

---

## 🐳 Docker Deployment

### Quick Docker Commands

```bash
# Development (with hot reload)
./dev.sh docker development

# Production
./dev.sh docker production

# Stop containers
./dev.sh stop development

# View logs
./dev.sh logs development

# Check status
./dev.sh status
```

### Manual Docker Commands

```bash
# Development
docker compose -f docker-compose.development.yml up -d

# Production
docker compose -f docker-compose.production.yml up -d

# Custom environment
NODE_ENV=production ./deploy.sh
```

### Docker Configurations

- `docker-compose.development.yml` - Development with hot reload
- `docker-compose.production.yml` - Production optimized
- `docker-compose.yml` - Default configuration

### Docker Features

- ✅ Multi-stage builds for optimal size
- ✅ Non-root user for security
- ✅ Health checks
- ✅ Hot reload in development
- ✅ Environment-specific configurations

---

## ☁️ Vercel Deployment

### Automated Deployment

1. **Connect Repository**
   - Link your GitHub repository to Vercel
   - Auto-deploy on push to main branch

2. **Set Environment Variables**

   ```bash
   PUBLIC_SALEOR_API_URL=https://your-saleor-instance.com/graphql/
   PUBLIC_STOREFRONT_URL=https://your-domain.vercel.app
   NODE_ENV=production
   ```

3. **Deploy**

   ```bash
   # Using Vercel CLI
   vercel --prod

   # Or push to main branch for auto-deploy
   git push origin main
   ```

### Manual Vercel Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod
```

### Vercel Configuration

The project includes `vercel.json` with optimized settings:

- Custom build command
- Environment variables
- Function configurations

---

## 🧪 Testing

### Test Commands

```bash
# Run all tests
./dev.sh test

# Test against local server
pnpm run test:local

# Test against Docker container
pnpm run test:docker

# Interactive/headed mode
pnpm run test:headed

# Debug mode
pnpm run test:debug
```

### Testing Environments

```bash
# Test against different targets
BASE_URL=http://localhost:3000 pnpm run test    # Local server
BASE_URL=https://your-app.vercel.app pnpm run test  # Vercel deploy
```

### Test Configuration

- Supports all major browsers (Chrome, Firefox, Safari)
- Automatic server startup if BASE_URL not set
- Environment-specific test configurations
- Screenshots and video on failure

---

## 🔐 Environment Variables

### Required Variables

```bash
# Saleor API endpoint
PUBLIC_SALEOR_API_URL=https://your-saleor-instance.com/graphql/

# Your storefront URL (for meta tags and canonical URLs)
PUBLIC_STOREFRONT_URL=https://your-domain.com
```

### Optional Variables

```bash
# Server token for admin operations
SALEOR_APP_TOKEN=your-server-token

# Development settings
PORT=3000
DEBUG=true
GRAPHQL_INTROSPECTION=true

# Testing
BASE_URL=http://localhost:3000
```

### Environment Priority

1. Command line environment variables
2. `.env.{environment}` files
3. `.env` file
4. `.env.example` (fallback)

---

## ⚙️ Advanced Configuration

### Custom Saleor Instance

1. **Update API URL**

   ```bash
   # In your .env file
   PUBLIC_SALEOR_API_URL=https://your-custom-saleor.com/graphql/
   ```

2. **Regenerate Types**
   ```bash
   pnpm run generate
   ```

### Custom Domains

```bash
# For Vercel
PUBLIC_STOREFRONT_URL=https://your-custom-domain.com

# For Docker with reverse proxy
PUBLIC_STOREFRONT_URL=https://your-domain.com
```

### Multiple Environments

```bash
# Create environment-specific files
.env.staging
.env.development
.env.production

# Use specific environment
NODE_ENV=staging ./dev.sh docker
```

---

## 🐛 Troubleshooting

### Common Issues

**1. GraphQL Types Generation Fails**

```bash
# Check API URL
echo $PUBLIC_SALEOR_API_URL

# Regenerate types
pnpm run generate
```

**2. Docker Port Conflicts**

```bash
# Check what's using port 3000
lsof -i :3000

# Use different port
PORT=3001 ./dev.sh docker
```

**3. Tests Timeout**

```bash
# Check if server is running
curl http://localhost:3000

# Run tests with specific base URL
BASE_URL=http://localhost:3000 pnpm run test
```

**4. Environment Variables Not Loading**

```bash
# Check file exists
ls -la .env*

# Check file content
cat .env.development

# Load specific environment
dotenv-cli -e .env.development -- pnpm run dev
```

### Debug Commands

```bash
# Check Docker containers
./dev.sh status

# View logs
./dev.sh logs development

# Clean Docker system
./dev.sh clean

# Test API connection
curl -X POST -H "Content-Type: application/json" \
  -d '{"query":"{ shop { name } }"}' \
  $PUBLIC_SALEOR_API_URL
```

### Performance Issues

```bash
# Build production version
pnpm run build:production

# Check bundle size
ls -lh build/

# Run production build
pnpm run start
```

---

## 📞 Support

- **Documentation**: Check README.md
- **Issues**: Create GitHub issue
- **Logs**: Use `./dev.sh logs` for Docker
- **Debug**: Use `./dev.sh test debug` for tests

---

## 🔄 Quick Reference

| Task            | Local                                     | Docker                        | Vercel                                      |
| --------------- | ----------------------------------------- | ----------------------------- | ------------------------------------------- |
| **Development** | `./dev.sh start`                          | `./dev.sh docker development` | `vercel dev`                                |
| **Production**  | `pnpm run build:production && pnpm start` | `./dev.sh docker production`  | `vercel --prod`                             |
| **Testing**     | `pnpm run test:local`                     | `pnpm run test:docker`        | `BASE_URL=https://app.vercel.app pnpm test` |
| **Logs**        | Check terminal                            | `./dev.sh logs`               | Vercel dashboard                            |
| **Stop**        | `Ctrl+C`                                  | `./dev.sh stop`               | N/A                                         |

---

✅ **Ready to deploy!** Choose your preferred method and start building your Saleor storefront.
