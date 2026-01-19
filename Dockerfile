# Build
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --production

# Runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
# optional: init nhỏ gọn
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini","--"]
COPY --from=builder /app ./
EXPOSE 3000
CMD ["npm", "start"]
