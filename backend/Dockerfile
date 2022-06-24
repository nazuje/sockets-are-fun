FROM node:14-alpine

RUN apk add --no-cache --virtual alpine-sdk make gcc g++ python3 git curl

WORKDIR /backend

## Add the wait script to the image
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

## installing NPMs takes the longest
ADD package.json .
ADD package-lock.json .
RUN npm install

EXPOSE 8080
## now update the source
COPY . .

## there are multiple daemons in package.json
## run/expose via docker-compose to select which to run