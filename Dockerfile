FROM node:20 AS build
LABEL authors="Catadev"

WORKDIR /kaikibot
COPY package*.json ./
RUN npm ci --include=dev
COPY . .
RUN npx prisma generate && npx tsc -p tsconfig.json

FROM node:20-slim AS production
LABEL authors="Catadev"

WORKDIR /kaikibot

RUN apt-get update && apt-get install -y curl && \
    curl -sLO https://github.com/fastfetch-cli/fastfetch/releases/latest/download/fastfetch-linux-amd64.deb && \
    dpkg -i fastfetch-linux-amd64.deb && \
    rm fastfetch-linux-amd64.deb && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /kaikibot/dist ./dist
COPY --from=build /kaikibot/prisma ./prisma
COPY --from=build /kaikibot/node_modules/.prisma ./node_modules/.prisma

CMD ["node", "dist/index.js", "--color"]
