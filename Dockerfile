# Use Node.js 20 with Debian bookworm (has Python 3.11)
FROM node:20-bookworm

# Install Python 3.11, pip, ffmpeg, and yt-dlp
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install latest yt-dlp globally
RUN pip3 install --break-system-packages -U yt-dlp

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node dependencies
RUN npm install

# Copy application files
COPY . .

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
