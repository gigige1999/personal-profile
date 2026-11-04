FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# 独立域名整站部署：资源从根路径加载
ENV VITE_BASE=/
RUN npm run build

ENV PORT=3000
ENV CONFIG_DATA_DIR=/app/data
VOLUME ["/app/data"]
EXPOSE 3000

CMD ["node", "server/index.mjs"]
