FROM node:20.18.1

# Install dependencies
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y \
    ffmpeg \
    curl \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN yarn install

COPY . .

CMD ['node', 'index.js']