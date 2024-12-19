FROM node:20 AS build
LABEL authors="Catadev"

WORKDIR /kaikibot
RUN apt update && curl -sLO https://github.com/fastfetch-cli/fastfetch/releases/latest/download/fastfetch-linux-amd64.deb && dpkg -i fastfetch-linux-amd64.deb
COPY package*.json .
RUN npm i --include dev
COPY . .
RUN npx prisma generate
RUN npx tsc -p tsconfig.json
