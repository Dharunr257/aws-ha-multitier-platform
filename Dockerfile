# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Release
FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN npm ci --prefix backend --only=production

# Copy backend code
COPY backend/ ./backend/

# Copy React build artifacts
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose production port
EXPOSE 3000

# Set non-root user
USER node

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start Server
CMD ["node", "backend/server.js"]
