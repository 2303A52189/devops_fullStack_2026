# ─── Stage 1: Builder ──────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (layer cache optimization)
COPY package*.json ./

# Install all dependencies
RUN npm ci --only=production

# ─── Stage 2: Production ───────────────────────────────────────
FROM node:20-alpine AS production

# Security: run as non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S studyapp -u 1001

WORKDIR /app

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application source
COPY --chown=studyapp:nodejs . .

# Create upload directory
RUN mkdir -p public/uploads && chown studyapp:nodejs public/uploads

# Switch to non-root user
USER studyapp

# Expose app port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start server
CMD ["node", "app.js"]
