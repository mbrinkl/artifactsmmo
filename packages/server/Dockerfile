FROM node:20
 
WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/server/package.json ./packages/server/package.json

RUN npm install
 
COPY . .

RUN npm run build:server

EXPOSE 3000

CMD [ "node", "packages/server/dist/main.js" ]