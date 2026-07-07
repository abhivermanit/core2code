# =============================================================================
# Stage 1: Dependencies
# =============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Install dependencies only (cache layer)
COPY package.json package-lock.json ./
RUN npm ci --only=production && \
    cp -R node_modules /prod_modules && \
    npm ci

# =============================================================================
# Stage 2: Build
# =============================================================================
FROM node:20-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# =============================================================================
# Stage 3: Production
# =============================================================================
FROM node:20-alpine AS production

# Security: non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser

WORKDIR /app

# Copy production dependencies only
COPY --from=deps /prod_modules ./node_modules

# Copy built application
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./

# Set ownership
RUN chown -R appuser:appgroup /app

USER appuser

# Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start
CMD ["node", "dist/index.js"]
