FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json next.config.js ./
COPY public ./public
COPY src ./src

RUN npm run build

FROM node:20-alpine

WORKDIR /app
RUN apk add --no-cache dumb-init curl
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY public ./public

ENV NODE_ENV=production
EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
