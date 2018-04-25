FROM node:8

RUN apt-get update; \
    apt-get -y install jq
RUN npm i -g typescript

RUN groupadd -g 1007 docker; \
    useradd -g docker -u 1006 -m docke

USER docker
