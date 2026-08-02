# ═══════════════════════════════════════════════════════════
# FLOWPEDIDOS - Dockerfile (multi-stage build optimizado)
# ═══════════════════════════════════════════════════════════

# ─── Etapa 1: BUILDER ───
# Instala dependencias y compila TypeScript → dist/
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar deps primero (aprovecha la caché de capas)
COPY package*.json ./
RUN npm ci

# Copiar código fuente y compilar
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ─── Etapa 2: PRODUCCIÓN ───
# Imagen final, mínima y optimizada (solo runtime)
FROM node:20-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Instalar SOLO dependencias de producción
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copiar el build compilado y el frontend estático desde el builder
COPY --from=builder /app/dist ./dist
COPY public ./public

# El server escucha en el puerto 3000 (Render la asigna vía aria PORT)
EXPOSE 3000

# Usuario no-eredit para mejor seguridad (node user existe en imagen alpine)
USER node

# Comando de arranque
CMD ["node", "dist/index.js"]