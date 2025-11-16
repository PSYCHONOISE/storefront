FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat bash
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
COPY scripts/ ./scripts/
RUN chmod +x ./scripts/*.sh
ENV DOCKER_BUILD=true
RUN pnpm i --frozen-lockfile --prefer-offline

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Install bash for scripts
RUN apk add --no-cache bash
RUN chmod +x ./scripts/*.sh

# Environment variables for SvelteKit build
ARG PUBLIC_SALEOR_API_URL
ENV PUBLIC_SALEOR_API_URL=${PUBLIC_SALEOR_API_URL}
ARG PUBLIC_STOREFRONT_URL
ENV PUBLIC_STOREFRONT_URL=${PUBLIC_STOREFRONT_URL}

# Get PNPM version from package.json
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Generate GraphQL types
RUN pnpm run generate || echo "GraphQL generation failed, continuing..."

# Build SvelteKit application
RUN pnpm build

# Production image, copy all the files and run SvelteKit
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Environment variables for runtime
ARG PUBLIC_SALEOR_API_URL
ENV PUBLIC_SALEOR_API_URL=${PUBLIC_SALEOR_API_URL}
ARG PUBLIC_STOREFRONT_URL
ENV PUBLIC_STOREFRONT_URL=${PUBLIC_STOREFRONT_URL}

# Create user for running the application
RUN addgroup --system --gid 1001 sveltekit
RUN adduser --system --uid 1001 sveltekit

# Copy the built application from builder stage
COPY --from=builder --chown=sveltekit:sveltekit /app/build ./build
COPY --from=builder --chown=sveltekit:sveltekit /app/node_modules ./node_modules
COPY --from=builder --chown=sveltekit:sveltekit /app/package.json ./package.json

# Switch to non-root user
USER sveltekit

# Expose port
EXPOSE 3000

# Start the SvelteKit application
CMD ["node", "build"]
