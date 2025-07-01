FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY . .

# As variáveis VITE_ já estão no ambiente do build via Easypanel!
RUN npm install
RUN npm run build

FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# (Opcional) Se quiser rotas SPA:
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
