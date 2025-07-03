# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia configs e dependências primeiro (melhora cache)
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Instala dependências
RUN npm install

# Copia todo o restante do projeto (inclui src/ e public/)
COPY . .

# Corrige permissões dos binários (opcional)
RUN find node_modules/.bin -type f -exec chmod +x {} \;

# Build do projeto Vite (gera dist/)
RUN npm run build

# Etapa de produção
FROM nginx:1.25-alpine

# Copia o build gerado
COPY --from=builder /app/dist /usr/share/nginx/html

# SPA fallback (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
