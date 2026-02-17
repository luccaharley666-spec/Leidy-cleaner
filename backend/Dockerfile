# Multi-stage Dockerfile: builds frontend, installs backend, and runs integrated server
FROM node:20-bullseye AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./frontend/
COPY frontend/ ./frontend/
WORKDIR /app/frontend
RUN npm ci --silent --legacy-peer-deps && npm run build

FROM node:20-bullseye AS runtime
WORKDIR /app
# Copy backend sources
COPY backend/package*.json ./backend/
COPY backend/ ./backend/
# Install backend production deps
WORKDIR /app/backend
RUN npm ci --only=production --silent --legacy-peer-deps || true

# Copy built frontend into backend for Next integration
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json

ENV NODE_ENV=production INTEGRATE_NEXT=true PORT=3001
EXPOSE 3001
WORKDIR /app/backend
CMD ["node", "src/index.js"]
