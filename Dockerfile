FROM node:18-alpine AS builder
WORKDIR /app

# Salin konfigurasi dependensi
COPY package.json pnpm-lock.yaml ./

# Ubah pnpm-lock.yaml menjadi package-lock.json secara otomatis agar npm bisa langsung instal dengan stabil
RUN npm install -g pnpm && pnpm import && rm pnpm-lock.yaml

# Instal dependensi menggunakan npm standar (bersih, stabil, tanpa error esbuild)
RUN npm ci

# Salin seluruh file proyek
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