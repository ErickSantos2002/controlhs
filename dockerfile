# Etapa de build
FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de dependência e configs
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Instala as dependências
RUN npm install

# Copia o restante do projeto (src, public etc)
COPY . .

# Corrige permissões dos binários
RUN find node_modules/.bin -type f -exec chmod +x {} \;

# Build do projeto (gera a pasta dist)
RUN npm run build

# Etapa final com Nginx
FROM nginx:1.25-alpine

# Copia os arquivos buildados para a pasta do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Habilita o fallback para SPA (React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
