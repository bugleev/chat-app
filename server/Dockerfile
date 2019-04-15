# build environment
FROM node:latest
# Global install yarn package manager
RUN apt-get update && apt-get install -y curl apt-transport-https && \
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  apt-get update && apt-get install -y yarn
RUN mkdir /chat
WORKDIR /chat
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock  
RUN yarn
COPY . ./
CMD ["yarn", "server"]
