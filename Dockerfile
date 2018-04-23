FROM node:8

ENV http_proxy=http://10.0.201.201:8080 \
    https_proxy=http://10.0.201.201:8080

RUN apt-get update; \
    apt-get -y install jq
RUN npm i -g typescript
