FROM node:18-alpine AS builder
WORKDIR /app

# Salin package.json dan package-lock.json yang baru dibuat
COPY package.json package-lock.json ./

# Instal dependensi menggunakan npm ci (standar produksi yang aman dan cepat)
RUN npm ci

# Salin seluruh sisa file proyek
COPY . .

# Build aplikasi Next.js
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]