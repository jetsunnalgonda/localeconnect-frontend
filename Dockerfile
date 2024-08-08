# Use the official Node.js image as a base
FROM node:22-alpine

# Create and change to the app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Copy the certificate and key files
COPY private.key /app/private.key
COPY certificate.crt /app/certificate.crt

# Build the app
RUN npm run build

# Use a simple web server to serve static files
RUN npm install -g serve

# Expose the port the app runs on
EXPOSE 3011

# Serve the app
CMD ["serve", "-s", "dist"]
