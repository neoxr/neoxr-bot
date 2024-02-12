FROM node:14.21.3 AS node_base

ENV NODE_VERSION=14.21.3
RUN apt install -y curl
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"

RUN apt-get update && \
  apt-get install -y \
  ffmpeg \
  imagemagick \
  apt-get upgrade -y && \
  rm -rf /var/lib/apt/lists/*

COPY package.json .

RUN yarn global add node-pre-gyp@v0.7.x && yarn global add node-pre && yarn install

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]