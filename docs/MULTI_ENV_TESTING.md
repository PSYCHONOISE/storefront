# Multi-Environment Testing Guide

## Overview

This project now supports running multiple environments in parallel without conflicts. Each environment uses its own build directory and port.

## Environment Configuration

| Environment | Port | Build Directory     | Config File                   |
| ----------- | ---- | ------------------- | ----------------------------- |
| Development | 3000 | `build/`            | `svelte.config.js` (default)  |
| Production  | 3001 | `build-production/` | `svelte.config.production.js` |
| Test        | 3002 | `build-test/`       | `svelte.config.test.js`       |

## Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Build for Each Environment

```bash
# Build development (optional for dev server)
./dev.sh build development

# Build production
./dev.sh build production

# Build test
./dev.sh build test
```

### 3. Start Environments in Parallel

Open separate terminal windows/tabs:

**Terminal 1 - Development:**

```bash
./dev.sh start development
# Serves on http://127.0.0.1:3000
```

**Terminal 2 - Production:**

```bash
./dev.sh start production
# Serves on http://127.0.0.1:3001
```

**Terminal 3 - Test:**

```bash
./dev.sh start test
# Serves on http://127.0.0.1:3002
```

## Testing the Fix

### Before the Fix

- ❌ Multiple environments conflicted
- ❌ `ENOENT` errors when switching between environments
- ❌ Shared `build/` directory caused file conflicts

### After the Fix

- ✅ Each environment has its own build directory
- ✅ No file conflicts between environments
- ✅ Can run all three environments simultaneously
- ✅ Each environment serves on its own port

## Verification Steps

1. **Build all environments:**

   ```bash
   ./dev.sh build production
   ./dev.sh build test
   ```

2. **Check build directories exist:**

   ```bash
   ls -la build*
   # Should show: build/, build-production/, build-test/
   ```

3. **Start production and test in parallel:**

   ```bash
   # Terminal 1
   ./dev.sh start production

   # Terminal 2 (different terminal)
   ./dev.sh start test
   ```

4. **Verify both are running:**
   ```bash
   curl http://127.0.0.1:3001  # Production
   curl http://127.0.0.1:3002  # Test
   ```

## Troubleshooting

### Port Conflicts

If you get port conflicts, the `scripts/port-check.sh` script can help:

```bash
./scripts/port-check.sh 3001 production
```

### Build Issues

Make sure you have the correct Node.js version:

```bash
node --version  # Should be >= 20
```

### Environment Variables

Check that your environment files are configured:

- `.env.development`
- `.env.production`
- `.env.test`

## Node.js Version Compatibility

- ✅ **Node.js v22.x**: Fully tested and supported
- ✅ **Node.js v25.x**: Should work (newer versions are generally compatible)
- ⚠️ **Node.js < v20**: Not supported (minimum requirement)

## Additional Commands

```bash
# Show help
./dev.sh help

# Check Docker status
./dev.sh status

# Run tests against specific environment
./dev.sh test production

# Stop Docker containers
./dev.sh stop
```

---

**Last Updated**: 2025-11-11  
**Node.js Compatibility**: v22+ (tested with v22.21.0 and v25.0.0)  
**Fixed Issue**: Multi-environment build conflicts
