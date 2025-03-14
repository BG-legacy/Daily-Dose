# ===========================================
# Build stage configuration for Node.js backend
# ===========================================

# Use Node.js LTS version as the base image
# We use the slim version to keep the image size small while maintaining necessary features
FROM node:20-slim

# Set the working directory in the container
# This is where our application code will live
WORKDIR /usr/src/app

# Copy package files first
# This is done before copying the rest of the code to leverage Docker's cache
# If package files don't change, npm install won't run again in subsequent builds
COPY package*.json ./

# Install all dependencies
# This includes both production and development dependencies
RUN npm install

# Copy the rest of the application code
# This happens after npm install to leverage caching
COPY . .

# Expose port 3011 for the application
# This is a documentation feature that tells users which ports are intended to be published
EXPOSE 3011

# Set environment variables that will be available at runtime
# PORT: The port number the application will listen on
# NODE_ENV: The environment mode (production enables optimizations)
ENV PORT=3011
ENV NODE_ENV=production

# Command to start the application
# Using node directly instead of npm start for better container signal handling
CMD ["node", "index.js"] 