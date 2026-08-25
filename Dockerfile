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

ARG VITE_ZOE_WEBHOOK_URL=https://ia-whatsapp-n8n.7niwok.easypanel.host/webhook/zoe/chat
ENV VITE_ZOE_WEBHOOK_URL=$VITE_ZOE_WEBHOOK_URL

ARG VITE_ZOE_REVISAR_GC_URL=https://ia-whatsapp-n8n.7niwok.easypanel.host/webhook/revisar-gc
ENV VITE_ZOE_REVISAR_GC_URL=$VITE_ZOE_REVISAR_GC_URL

ARG VITE_ZOE_REVISAR_GF_URL=https://ia-whatsapp-n8n.7niwok.easypanel.host/webhook/revisar-gf
ENV VITE_ZOE_REVISAR_GF_URL=$VITE_ZOE_REVISAR_GF_URL

RUN npm run build

# ============================
# Etapa 2: imagen final (nginx sirviendo los archivos estáticos)
# ============================
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
