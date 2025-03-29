# Production Dockerfile for Disaster Response Backend
FROM node:18-alpine as builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git python3 make g++

# Copy package files
COPY package*.json ./
COPY yarn.lock .

# Install production dependencies
RUN npm install --production --frozen-lockfile

# Copy source code
COPY . .

# Build step (if needed)
# RUN npm run build

# Remove dev dependencies
RUN npm prune --production

# Final production image
FROM node:18-alpine

WORKDIR /app

# Copy built files from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/config ./config

# Install runtime dependencies
RUN apk add --no-cache tini curl

# Security hardening
RUN chown -R node:node /app
USER node

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/healthcheck || exit 1

# Configure runtime
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Entrypoint
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]
