FROM node:8

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY ./src ./src

ENV NODE_ENV prod
COPY ./env/prod.env ./env/

EXPOSE 3000

CMD [ "node", "./src/app.js" ]

