# Use the Node.js base image
FROM node:20.12.0-alpine3.18

# Set the working directory
WORKDIR /app

# Install dependencies
RUN apk add --no-cache -t build-dependencies git make gcc g++ python3 \
    libtool autoconf pkgconfig automake librdkafka-dev bash # wget tar xz

# Copy package files and install dependencies
COPY packages/config-svc-be/package*.json ./
RUN npm install
RUN ls -la

# Copy tsconfig files
COPY packages/config-svc-be/tsconfig*.json ./

# Copy the rest of your application's source code
COPY packages/config-svc-be ./packages/config-svc-be/  
COPY packages/config-svc-be/.env.sample ./.env

# Build the application
RUN npm run build

# Development mode
CMD [ "npm", "run", "start" ]
