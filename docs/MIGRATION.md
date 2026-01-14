# Migration from Next.js to SvelteKit

This document describes the migration process from Next.js to SvelteKit for the Saleor storefront.

## Completed Migration Steps

### 1. Project Configuration

- ✅ Updated `package.json` with SvelteKit dependencies
- ✅ Created `svelte.config.js`
- ✅ Created `vite.config.ts`
- ✅ Updated `tsconfig.json` for SvelteKit
- ✅ Updated `tailwind.config.ts` to include `.svelte` files
- ✅ Updated Prettier configuration for Svelte

### 2. Project Structure

- ✅ Created `src/app.html` (SvelteKit equivalent of Next.js `_document`)
- ✅ Created `src/app.css` (global styles)
- ✅ Created `src/routes/+layout.svelte` (equivalent of Next.js `layout.tsx`)
- ✅ Migrated routing structure to SvelteKit's file-based routing

### 3. Component Migration

- ✅ Converted basic React components to Svelte:
  - `ProductList.svelte`
  - `ProductElement.svelte`
  - `ProductImageWrapper.svelte`
  - `LinkWithChannel.svelte`

### 4. GraphQL Integration

- ✅ Updated GraphQL codegen configuration for SvelteKit
- ✅ Adapted GraphQL client for SvelteKit environment
- ✅ Updated environment variables (PREFIX: `PUBLIC_` instead of `NEXT_PUBLIC_`)

### 5. Pages/Routes

- ✅ Created main routes:
  - `/` - Home page with hero section and featured products
  - `/products` - Product listing page
  - `/products/[slug]` - Individual product page
  - `/cart` - Shopping cart page

### 6. Styling

- ✅ TailwindCSS configured for SvelteKit
- ✅ Basic responsive layout with navigation and footer

## Current Status

**✅ BASIC MIGRATION COMPLETED**

The project successfully runs with SvelteKit and includes:

- Working development server
- Basic routing structure
- Mock data for products
- TailwindCSS styling
- Navigation between pages

## What's Not Migrated (TODO for future work)

### High Priority

- [ ] **Checkout System** - The entire checkout flow needs to be migrated
- [ ] **Authentication** - User login/registration components
- [ ] **Real GraphQL Integration** - Currently using mock data
- [ ] **State Management** - Shopping cart state management
- [ ] **Payment Integration** - Stripe/Adyen payment components

### Medium Priority

- [ ] **SEO Components** - Meta tags, structured data
- [ ] **Error Handling** - Error boundaries and 404 pages
- [ ] **Loading States** - Skeleton loaders and spinners
- [ ] **Form Handling** - Replace Formik with Svelte forms

### Low Priority

- [ ] **Advanced Features** - User accounts, order history
- [ ] **Performance Optimization** - Image optimization, lazy loading
- [ ] **Testing** - Playwright tests need updates
- [ ] **Linting** - ESLint configuration for Svelte

## Development Commands

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Generate GraphQL types
pnpm run generate

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Key Differences from Next.js

1. **File Naming**:
   - `+page.svelte` instead of `page.tsx`
   - `+layout.svelte` instead of `layout.tsx`
   - `+page.ts` for data loading instead of React Server Components

2. **Data Loading**:
   - SvelteKit's `load` functions instead of Next.js server components
   - No built-in data fetching caching (need to implement manually)

3. **Environment Variables**:
   - `PUBLIC_*` prefix for client-side variables instead of `NEXT_PUBLIC_*`

4. **Component Syntax**:
   - Svelte's reactive syntax instead of React hooks
   - `$props()` and `$derived()` instead of `useState()` and `useEffect()`

5. **Routing**:
   - File-based routing similar to Next.js but with different conventions
   - Dynamic routes use `[param]` syntax (same as Next.js)

## Notes

This migration provides a solid foundation for the Saleor storefront in SvelteKit. The basic structure is in place, and the project can be extended with the remaining features as needed.

The checkout system will require the most work to migrate, as it involves complex state management and payment integrations that were tightly coupled to React.
