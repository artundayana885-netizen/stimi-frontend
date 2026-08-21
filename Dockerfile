# ============================
# Etapa 1: build (genera los archivos estáticos con Vite)
# ============================
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=https://stimii-backend.7niwok.easypanel.host
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN npm run build

# ============================
# Etapa 2: imagen final (nginx sirviendo los archivos estáticos)
# ============================
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
