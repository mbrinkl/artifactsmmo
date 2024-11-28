FROM node:20 as builder
 
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/client/package.json ./packages/client/package.json
COPY packages/server/package.json ./packages/server/package.json

RUN npm install
 
COPY . .

RUN npm run build

FROM caddy:2 AS caddy

WORKDIR /srv

COPY --from=builder /app/packages/client/dist /srv

FROM builder AS server

EXPOSE 3000

CMD [ "node", "packages/server/dist/main.js" ]
