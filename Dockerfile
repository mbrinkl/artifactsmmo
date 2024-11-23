FROM node:20 AS front
 
WORKDIR /usr/src/app
 
# Copy root package.json and lockfile
COPY package.json ./
COPY package-lock.json ./
 
# Copy the api package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/client/package.json ./packages/client/package.json
COPY packages/server/package.json ./packages/server/package.json
 
RUN npm install
 
# Copy app source
COPY . .

RUN npm run build

RUN cp -r ./packages/client/dist/* /srv

EXPOSE 3000
 
CMD [ "npx", "tsx", "packages/server/src/index.ts" ]