# --- build: compilo TS, no llega a la imagen final ---
FROM node:22-alpine AS builder

# alpine no trae openssl y prisma lo necesita
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# --- runtime: imagen final, solo prod ---
FROM node:22-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3000

# migro antes de levantar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
