FROM node:8

WORKDIR /usr/src/app

ARG secret
ARG publish

ENV NODE_ENV prod
ENV PORT 80
ENV DATABASE_NAME prod.db
ENV PAYPAL_SANDBOX_ID demo_sandbox_client_id
ENV PAYPAL_PRODUCTION_ID demo_production_client_id
ENV STRIPE_PUBLISH_KEY $secret
ENV STRIPE_SECRET_KEY $publish

COPY package*.json ./
RUN npm install

COPY ./src ./src
COPY ./db ./db

EXPOSE 80

CMD [ "node", "./src/app.js", "--no-env-file"]

