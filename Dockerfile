# Stage 1: Build the Angular application
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
# We use npm ci for a more rigorous, lock-file matching installation
COPY package*.json ./
RUN npm ci

# Copy the rest of the app's source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the Nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the built Angular app from the builder stage
# Note: The application builder outputs into the 'browser' subfolder.
# If this fails, update to /app/dist/frontend depending on exact Angular version behavior.
COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
