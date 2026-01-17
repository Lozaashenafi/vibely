# 1. Use Node.js image
FROM node:18

# 2. Install Python, ffmpeg, and curl
RUN apt-get update && apt-get install -y python3 python3-pip ffmpeg curl

# 3. Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

# 4. Set working directory
WORKDIR /app

# 5. Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# 6. Copy the rest of your code
COPY . .

# 7. Build the TypeScript code
RUN npm run build

# 8. Start the bot
CMD ["npm", "start"]