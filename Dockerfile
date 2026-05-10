FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --include=dev --no-audit --no-fund --legacy-peer-deps

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
