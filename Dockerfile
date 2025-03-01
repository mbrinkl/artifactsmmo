FROM node:20 AS builder
 
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/client/package.json ./packages/client/package.json
COPY packages/server/package.json ./packages/server/package.json

RUN npm install
 
COPY . .

RUN npm run build

RUN cp -r packages/client/dist/* /srv

EXPOSE 3000

CMD [ "node", "packages/server/dist/main.js" ]
