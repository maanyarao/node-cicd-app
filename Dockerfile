FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy package files first for cached layer installation
COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy application source code
COPY . .

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
