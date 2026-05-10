FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=development
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_PROGRESS=false

COPY package.json package-lock.json* ./

RUN npm install --include=dev --no-audit --no-fund --legacy-peer-deps --verbose

COPY . .

RUN npm run build

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["npm", "start"]
