# Use Node.js LTS version
FROM node:20-slim

# Install ffmpeg for video processing
RUN apt-get update && apt-get install -y \
    ffmpeg \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Create downloads directory
RUN mkdir -p downloads

# Expose port
EXPOSE 8080

# Start the application
CMD ["node", "server.js"]
