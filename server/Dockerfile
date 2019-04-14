# build environment
FROM node:latest
RUN mkdir /chat
WORKDIR /chat
COPY package.json ./package.json
COPY yarn.lock ./yarn.lock  
RUN npm install
COPY . ./
CMD ["nodemon", "index.js"]
