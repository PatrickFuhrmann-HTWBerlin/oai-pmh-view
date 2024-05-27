FROM node:18-alpine

WORKDIR /home/node/app
#
COPY package*.json /home/node/app/
COPY . /home/node/app/
RUN mv src/web ./public
RUN mv ./public/index-basic.html ./public/index.html
RUN npm install

CMD ["node", "src/oai-pmh-view-server.js"]
