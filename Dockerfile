# ==========================================
# 1. Stage Builder (Menginstal dependensi dan membangun Next.js)
# ==========================================
FROM node:20-alpine AS builder
WORKDIR /app

# Salin file konfigurasi dependensi
COPY package.json package-lock.json ./

# Instal dependensi menggunakan npm ci untuk konsistensi
RUN npm ci

# Salin seluruh kode sumber proyek ke dalam container
COPY . .

# Pastikan folder public ada sebelum build untuk mencegah error not found
RUN mkdir -p public

# Jalankan proses build Next.js (Output mode standalone akan aktif jika diatur di next.config.ts)
ENV NODE_ENV=production
RUN npm run build

# ==========================================
# 2. Stage Runner (Menjalankan aplikasi hasil build di mode production)
# ==========================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Salin aset publik dan file hasil build standalone dari stage 'builder'
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Jalankan server Next.js standalone
CMD ["node", "server.js"]