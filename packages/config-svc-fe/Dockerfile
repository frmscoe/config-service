# Use a Node.js base image with version 20.10.0
FROM node:20.10.0

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy environment files
COPY .env ./

# Expose the port defined in the environment variable
EXPOSE ${PORT}

# Command to run the application
CMD ["npm", "run", "dev"]
