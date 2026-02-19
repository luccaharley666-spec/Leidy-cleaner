# Multi-stage Dockerfile: builds frontend, installs backend, and runs integrated server
FROM node:20-bullseye AS builder
WORKDIR /app

# Install backend deps and build TypeScript
COPY package*.json ./
COPY tsconfig.json ./
COPY ./src ./src
COPY ./migrations ./migrations
COPY ./package*.json ./
RUN npm ci --silent --legacy-peer-deps
RUN npm run build

FROM node:20-bullseye AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
# copy migrations into image runtime so entrypoint can run them
COPY ./migrations ./migrations
COPY package*.json ./
RUN npm ci --only=production --silent --legacy-peer-deps || true

# install curl for healthchecks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# copy entrypoint and make it executable
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

ENV NODE_ENV=production PORT=3001
EXPOSE 3001
ENTRYPOINT ["./docker-entrypoint.sh"]
