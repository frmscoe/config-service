# syntax=docker/dockerfile:1
# Use Node.js 20 as the base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY packages/config-svc-be/package*.json ./

# Create .npmrc that reads the token from the environment at install time.
# The token is supplied via a BuildKit secret mount and is never written into
# any image layer, so it cannot leak in the published image.
RUN echo "@tazama-lf:registry=https://npm.pkg.github.com" > .npmrc \
    && echo "//npm.pkg.github.com/:_authToken=\${GH_TOKEN}" >> .npmrc

# Install nvm and set Node.js version
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash \
    && export NVM_DIR="$HOME/.nvm" \
    && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" \
    && nvm install 20 \
    && nvm use 20

# Install dependencies
RUN --mount=type=secret,id=GH_TOKEN,env=GH_TOKEN npm install

# Install specific auth-lib package
RUN --mount=type=secret,id=GH_TOKEN,env=GH_TOKEN npm install @tazama-lf/auth-lib

# Install audit and logging library
RUN --mount=type=secret,id=GH_TOKEN,env=GH_TOKEN npm install @tazama-lf/frms-coe-lib

# Copy the rest of the backend code
COPY packages/config-svc-be ./

# Copy test keys
COPY packages/test-private-key.pem ./test-private-key.pem
COPY packages/test-public-key.pem ./test-public-key.pem

# Copy lumberjack.env to env directory (directory should already exist from COPY)
COPY packages/config-svc-be/env/lumberjack.env ./env/lumberjack.env

# Copy .env file
COPY packages/config-svc-be/.env ./

# Set permissions for key files
RUN chmod 600 test-private-key.pem test-public-key.pem

# Expose the application port
EXPOSE 3007

# Start the server
CMD ["npm", "run", "start"]
