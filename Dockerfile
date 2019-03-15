# build environment
FROM node:latest
# Global install yarn package manager
RUN apt-get update && apt-get install -y curl apt-transport-https && \
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  apt-get update && apt-get install -y yarn
RUN mkdir /chat
WORKDIR /chat
COPY ./client/package.json ./client/package.json
COPY ./client/yarn.lock ./client/yarn.lock
COPY ./server/package.json ./server/package.json
COPY ./server/yarn.lock ./server/yarn.lock  
WORKDIR /chat/server
RUN yarn
RUN yarn client-i
WORKDIR /chat
COPY . ./
WORKDIR /chat/server
RUN yarn client-prod

