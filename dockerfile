FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Copia a pasta public (com o index.html)
COPY public ./public

# Copia o restante do projeto
COPY . .

RUN npm install
# Corrige permissões dos binários
RUN find node_modules/.bin -type f -exec chmod +x {} \;
RUN npm run build

FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# Descomente se precisar de SPA fallback
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
