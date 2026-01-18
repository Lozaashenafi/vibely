FROM node:20

# Install ffmpeg
RUN apt-get update && apt-get install -y ffmpeg python3 python3-pip curl

# ALWAYS get the absolute latest yt-dlp binary
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Make sure an empty cookies file exists if one wasn't pushed
RUN touch cookies.txt

CMD ["npm", "start"]