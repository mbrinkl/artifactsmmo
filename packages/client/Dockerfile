FROM node:20 as builder
 
WORKDIR /app

COPY package.json ./
COPY package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/client/package.json ./packages/client/package.json

RUN npm install
 
COPY . .

RUN npm run build:client

# Stage 2: Serve static files with Caddy
FROM caddy:2

# Set the working directory
WORKDIR /srv

# Copy static files from the build stage
COPY --from=builder /app/packages/client/dist /srv
