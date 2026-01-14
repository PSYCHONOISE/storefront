# GraphQL Setup and Troubleshooting

## The @gql Import Issue

When deploying or running the project for the first time, you may encounter this error:

```
During SSR, Vite can't find the `@gql`
```

### Why This Happens

1. **GraphQL Codegen** generates TypeScript types in `src/gql/` directory
2. **SvelteKit** needs `svelte-kit sync` to create path mappings and type definitions
3. During **Server-Side Rendering (SSR)**, Vite tries to resolve `@gql` imports before the types are generated
4. The `src/gql/` directory doesn't exist until GraphQL codegen runs

### The Solution

We've implemented a **postinstall** script that:

1. ✅ Runs `svelte-kit sync` to create SvelteKit types and aliases
2. ✅ Creates `src/gql/` directory with placeholder types
3. ✅ Runs `graphql-codegen` to generate real types (if API URL is available)

### Manual Fix

If you encounter this issue:

```bash
# Quick fix
pnpm run setup

# Or step by step:
pnpm exec svelte-kit sync    # Creates SvelteKit types
pnpm run generate            # Generates GraphQL types
```

### Package.json Scripts

```json
{
	"scripts": {
		"postinstall": "./scripts/postinstall.sh", // Automatic setup
		"setup": "svelte-kit sync && pnpm run generate", // Manual setup
		"sync": "svelte-kit sync", // Just SvelteKit sync
		"generate": "graphql-codegen --config .graphqlrc.ts" // Just GraphQL codegen
	}
}
```

### Development Workflow

1. **First time setup**:

   ```bash
   npm install  # postinstall runs automatically
   ```

2. **After adding new GraphQL queries**:

   ```bash
   pnpm run generate
   ```

3. **After changing SvelteKit config**:
   ```bash
   pnpm run sync
   ```

### Files Created

- `src/gql/index.ts` - Entry point for generated GraphQL types
- `src/gql/gql.ts` - Generated GraphQL operations
- `src/gql/graphql.ts` - Generated TypeScript types
- `.svelte-kit/` - SvelteKit generated files

### Environment Variables

GraphQL codegen requires:

```bash
PUBLIC_SALEOR_API_URL=https://your-saleor-api.com/graphql/
```

If this is not set, postinstall will skip codegen but still create placeholder types to prevent build errors.

### Docker Considerations

In Docker environments, make sure:

1. Environment variables are available during build
2. Network access to Saleor API during build (if running codegen)
3. `postinstall` script has execute permissions

```dockerfile
# Dockerfile example
COPY package*.json ./
RUN chmod +x scripts/postinstall.sh
RUN npm install
```
