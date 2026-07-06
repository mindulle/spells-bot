# Build stage
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install build dependencies for native modules (opus, sodium)
RUN apt-get update && apt-get install -y python3 build-essential && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies (HUSKY=0 prevents husky from installing hooks)
RUN HUSKY=0 npm ci

# Copy source code
COPY src ./src
COPY scripts ./scripts

# Build TypeScript
RUN npm run build

# Remove devDependencies
RUN HUSKY=0 npm prune --omit=dev

# Production stage
FROM node:20-bookworm-slim

WORKDIR /app

# Install ffmpeg for audio streaming
RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Copy built files and pruned node_modules from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

# Create non-root user for security
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nodejs

USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "console.log('healthy')" || exit 1

# Start the bot
CMD ["node", "dist/index.js"]
