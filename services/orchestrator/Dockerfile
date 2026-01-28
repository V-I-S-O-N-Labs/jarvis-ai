FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages ./packages
COPY services/orchestrator ./services/orchestrator

RUN npm install
RUN npm run prisma:generate -w @jarvis/orchestrator
RUN npm run build -w @jarvis/orchestrator

ENV PORT=4000
WORKDIR /app/services/orchestrator

CMD ["node", "dist/main.js"]
