# build image
FROM node:latest as builder
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
RUN yarn prod

# server image
FROM nginx:latest as deploy
RUN rm -rf /etc/nginx/conf.d
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx/gzip.conf /etc/nginx/conf.d/gzip.conf
COPY --from=builder /chat/build /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
