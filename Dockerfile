FROM node:8

WORKDIR /usr/src/app

ARG port
ARG secret
ARG publish

ENV NODE_ENV prod
ENV PORT $port
ENV DATABASE_NAME prod.db
ENV PAYPAL_SANDBOX_ID demo_sandbox_client_id
ENV PAYPAL_PRODUCTION_ID demo_production_client_id
ENV STRIPE_PUBLISH_KEY $secret
ENV STRIPE_SECRET_KEY $publish

COPY package*.json ./
RUN npm install

COPY ./src ./src
COPY ./db ./db

EXPOSE $port

CMD [ "node", "./src/app.js", "--no-env-file"]

