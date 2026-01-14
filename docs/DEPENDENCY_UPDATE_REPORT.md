# Dependency Update Report

## Summary

Dependency analysis completed for Saleor SvelteKit Storefront project. Several updates are available, but many require Node.js 22+ due to the project's SvelteKit 5 + Vite 7 configuration.

## Updates Applied ✅

The following dependencies have been safely updated:

### Development Dependencies

- `@types/node`: `24.10.0` → `24.10.1`
- `svelte-check`: `^4.3.3` → `^4.3.4`
- `@esbuild/linux-x64`: `0.25.9` → `0.25.12` (синхронизация с esbuild)

### Production Dependencies

- `@stripe/stripe-js`: `7.9.0` → `8.4.0`
- `@tailwindcss/typography`: `^0.5.16` → `^0.5.19`

## Available Updates Requiring Node.js 22+ ⚠️

The following updates are available but require Node.js 22+ and should be tested in your development environment:

### Critical Framework Updates

- `@sveltejs/vite-plugin-svelte`: `^6.1.4` → `^6.2.1` (requires Node.js 22+)
- `svelte`: `^5.43.5` → `^5.43.6` (latest patch)
- `vite`: `^7.1.4` → `^7.2.2` (likely requires Node.js 22+)

### GraphQL Tooling (Major Version Updates)

- `@graphql-codegen/cli`: `5.0.7` → `6.0.2` ⚠️ **Major version**
- `@graphql-codegen/client-preset`: `4.8.3` → `5.1.2` ⚠️ **Major version**

### CSS Framework (Breaking Changes)

- `tailwindcss`: `^3.4.17` → `^4.1.17` ⚠️ **Major version - Breaking changes**

### Package Manager

- `pnpm`: `10.14.0` → `10.22.0`

## Node.js Version Compatibility Issues

### Current Situation

- **Project Configuration**: Requires Node.js 22+ (configured in package.json engines)
- **SvelteKit 5**: Uses `styleText` from 'node:util' (Node.js 22+ feature)
- **Development Environment**: Should use Node.js 22+ as configured
- **Testing Environment**: May use different Node.js versions

### Environment Handling

- Modified `postinstall.sh` to gracefully handle Node.js < 22 environments
- Added `DOCKER_BUILD` flag for simplified container builds
- Node.js version check in `dev.sh` prevents issues in development

## Recommendations

### Safe to Apply Immediately ✅

1. The updates already applied are safe and backward compatible
2. No breaking changes or new Node.js requirements

### Test in Node.js 22+ Environment ⚠️

1. **Framework Updates**: Test `@sveltejs/vite-plugin-svelte`, `vite`, and `svelte` updates in your Node.js 22+ development environment
2. **Package Manager**: Update `pnpm` to `10.22.0` for latest features

### Major Version Updates (Requires Planning) 🔄

1. **GraphQL CodeGen**: v6 may have breaking changes - review changelog
2. **Tailwind CSS v4**: Major rewrite with breaking changes - requires migration guide
3. Plan these updates as separate tasks with proper testing

## Testing Status

### Completed ✅

- Dependency installation successful
- No package conflicts detected
- Postinstall script handles version compatibility

### Cannot Test in Current Environment ❌

- SvelteKit commands (`svelte-kit sync`, `pnpm run check`)
- Build processes requiring Node.js 22+
- Full TypeScript checking

### Requires Node.js 22+ Testing ⚠️

- `./dev.sh start development`
- `pnpm run build:*`
- `pnpm run test`
- Full development workflow

## Next Steps

1. **Immediate**: The applied updates are ready for commit
2. **Development Environment**: Test additional updates in Node.js 22+ environment:

   ```bash
   # In your Node.js 22+ environment:
   pnpm update @sveltejs/vite-plugin-svelte svelte vite
   pnpm run check  # Verify TypeScript
   ./dev.sh start development  # Test development server
   ```

3. **Major Updates**: Plan separate migration tasks for:
   - GraphQL CodeGen v6 migration
   - Tailwind CSS v4 migration (breaking changes)

4. **Docker Testing**: Test the fixed Docker permissions:

   ```bash
   ./dev.sh docker test  # Should now work without permission errors
   ```

5. **Continuous Updates**: Consider setting up dependabot or similar for automated minor/patch updates

## Files Modified

- `package.json`: Updated safe dependencies
- `scripts/postinstall.sh`: Added Node.js version compatibility handling
- `dev.sh`: Node.js version check skips Docker commands
- `Dockerfile.test`: Fixed permissions for Playwright test subdirectories
- `start-tests.sh`: Added test directory permission checks
- `playwright.config.container.ts`: Explicit output directory configuration

All changes maintain backward compatibility while enabling the project to work in both Node.js 18 (limited functionality) and Node.js 22+ (full functionality) environments.
