# build environment
FROM node:latest
RUN mkdir /chat
WORKDIR /chat
COPY . ./
# Global install yarn package manager
RUN apt-get update && apt-get install -y curl apt-transport-https && \
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
  apt-get update && apt-get install -y yarn
WORKDIR /chat/server
RUN yarn
RUN yarn client-i
RUN yarn client-prod
ENV NODE_ENV=production
CMD [ "yarn", "server" ]


