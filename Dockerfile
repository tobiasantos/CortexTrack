# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build
WORKDIR /build
COPY front/package.json front/package-lock.json ./
RUN npm ci
COPY front/ ./
RUN npm run build

# Stage 2: Production API server
FROM node:20-alpine
WORKDIR /app

COPY api/package.json api/package-lock.json ./
RUN npm ci --omit=dev

COPY api/src/ ./src/
COPY --from=frontend-build /build/dist ./public/

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "src/server.js"]
