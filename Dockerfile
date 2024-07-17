FROM node:18-alpine
LABEL org.opencontainers.image.source https://github.com/patrickfuhrmann-HTWBerlin/oai-pmh-view

WORKDIR /home/node/app
##
COPY package*.json /home/node/app/
COPY . /home/node/app/

RUN npm install -g npm@10.8.1

RUN ln -s src/web ./public
RUN npm install

CMD ["node", "src/oai-pmh-multi-viewer.js"]
