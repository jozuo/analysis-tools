FROM node:8

RUN apt-get update; \
    apt-get -y install jq
RUN npm i -g typescript
