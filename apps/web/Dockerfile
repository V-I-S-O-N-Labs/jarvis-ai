FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY packages ./packages
COPY apps/web ./apps/web

RUN npm install
RUN npm run build -w @jarvis/web

WORKDIR /app/apps/web

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "5173"]
