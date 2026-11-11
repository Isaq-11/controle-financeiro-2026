# ==============================================================================
# ESTÁGIO 1: Build da Aplicação React com Vite
# ==============================================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm ci

# Copia código-fonte e compila para produção
COPY . ./
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# ==============================================================================
# ESTÁGIO 2: Nginx Alpine para servir o SPA com suporte a roteamento e PWA
# ==============================================================================
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

