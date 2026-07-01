FROM node:20-alpine

WORKDIR /app

COPY server/package.json server/package-lock.json* ./
RUN npm install

COPY server/ .

RUN npm run build

EXPOSE 10000

CMD ["node", "dist/index.js"]
