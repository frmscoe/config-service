# Use the Node.js base image
FROM node:20.10.0

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY packages/config-svc-fe/package*.json ./
RUN npm install

# Copy the rest of your application's source code
COPY packages/config-svc-fe/ ./

# Generate and copy certificates
RUN mkdir -p certificates && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout certificates/localhost.key \
    -out certificates/localhost.crt \
    -subj "/C=AU/ST=Some-State/L=/O=Internet Widgits Pty Ltd/OU=/CN=/emailAddress="

# Copy environment variables
COPY packages/config-svc-fe/.env.sample ./.env.local

# Expose the port the app runs on, ensure the PORT environment variable is set for production
EXPOSE ${PORT}

# Development mode
CMD ["npm", "run", "dev"]
