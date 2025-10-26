FROM node:20 AS build
LABEL authors="Catadev"

WORKDIR /kaikibot
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npx prisma generate
RUN npx tsc -p tsconfig.json

FROM node:20-slim AS production
LABEL authors="Catadev"

WORKDIR /kaikibot

RUN apt update && \
    curl -sLO https://github.com/fastfetch-cli/fastfetch/releases/latest/download/fastfetch-linux-amd64.deb && \
    dpkg -i fastfetch-linux-amd64.deb && \
    rm fastfetch-linux-amd64.deb && \
    apt clean && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /kaikibot/dist ./dist
COPY --from=build /kaikibot/prisma ./prisma
COPY --from=build /kaikibot/node_modules/.prisma ./node_modules/.prisma

CMD ["node", "dist/index.js", "--color"]
