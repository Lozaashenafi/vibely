FROM node:20

# Install ffmpeg and python
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip curl

# Install the LATEST yt-dlp directly from GitHub
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Ensure cookies.txt is treated correctly
RUN touch cookies.txt

CMD ["npm", "start"]