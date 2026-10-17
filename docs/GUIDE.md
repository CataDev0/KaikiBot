### Paths

-   [Readme](../README.md)
-   Docs
    -   [.env setup](ENV.md)
    -   [Placeholders](PLACEHOLDERS.md)
    -   [Discord intents](INTENTS.md)

# Self-hosting guide

## Requirements
<svg role="img" width="25px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Node.js</title><path fill="#5FA04E" d="M11.998,24c-0.321,0-0.641-0.084-0.922-0.247l-2.936-1.737c-0.438-0.245-0.224-0.332-0.08-0.383 c0.585-0.203,0.703-0.25,1.328-0.604c0.065-0.037,0.151-0.023,0.218,0.017l2.256,1.339c0.082,0.045,0.197,0.045,0.272,0l8.795-5.076 c0.082-0.047,0.134-0.141,0.134-0.238V6.921c0-0.099-0.053-0.192-0.137-0.242l-8.791-5.072c-0.081-0.047-0.189-0.047-0.271,0 L3.075,6.68C2.99,6.729,2.936,6.825,2.936,6.921v10.15c0,0.097,0.054,0.189,0.139,0.235l2.409,1.392 c1.307,0.654,2.108-0.116,2.108-0.89V7.787c0-0.142,0.114-0.253,0.256-0.253h1.115c0.139,0,0.255,0.112,0.255,0.253v10.021 c0,1.745-0.95,2.745-2.604,2.745c-0.508,0-0.909,0-2.026-0.551L2.28,18.675c-0.57-0.329-0.922-0.945-0.922-1.604V6.921 c0-0.659,0.353-1.275,0.922-1.603l8.795-5.082c0.557-0.315,1.296-0.315,1.848,0l8.794,5.082c0.57,0.329,0.924,0.944,0.924,1.603 v10.15c0,0.659-0.354,1.273-0.924,1.604l-8.794,5.078C12.643,23.916,12.324,24,11.998,24z M19.099,13.993 c0-1.9-1.284-2.406-3.987-2.763c-2.731-0.361-3.009-0.548-3.009-1.187c0-0.528,0.235-1.233,2.258-1.233 c1.807,0,2.473,0.389,2.747,1.607c0.024,0.115,0.129,0.199,0.247,0.199h1.141c0.071,0,0.138-0.031,0.186-0.081 c0.048-0.054,0.074-0.123,0.067-0.196c-0.177-2.098-1.571-3.076-4.388-3.076c-2.508,0-4.004,1.058-4.004,2.833 c0,1.925,1.488,2.457,3.895,2.695c2.88,0.282,3.103,0.703,3.103,1.269c0,0.983-0.789,1.402-2.642,1.402 c-2.327,0-2.839-0.584-3.011-1.742c-0.02-0.124-0.126-0.215-0.253-0.215h-1.137c-0.141,0-0.254,0.112-0.254,0.253 c0,1.482,0.806,3.248,4.655,3.248C17.501,17.007,19.099,15.91,19.099,13.993z"/></svg>
<svg role="img" width="25px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>MariaDB</title><path fill="#003545" d="M23.157 4.412c-.676.284-.79.31-1.673.372-.65.045-.757.057-1.212.209-.75.246-1.395.75-2.02 1.59-.296.398-1.249 1.913-1.249 1.988 0 .057-.65.998-.915 1.32-.574.713-1.08 1.079-2.14 1.59-.77.36-1.224.524-4.102 1.477-1.073.353-2.133.738-2.367.864-.852.449-1.515 1.036-2.203 1.938-1.003 1.32-.972 1.313-3.042.947a12.264 12.264 0 00-.675-.063c-.644-.05-1.023.044-1.332.334L0 17.193l.177.088c.094.05.353.234.561.398.215.17.461.347.55.391.088.044.17.088.183.101.012.013-.089.17-.228.353-.435.581-.593.871-.574 1.048.019.164.032.17.43.17.517-.006.826-.056 1.261-.208.65-.233 2.058-.94 2.784-1.4.776-.5 1.717-.998 1.956-1.042.082-.02.354-.07.594-.114.58-.107 1.464-.095 2.587.05.108.013.373.045.6.064.227.025.43.057.454.076.026.012.474.037.998.056.934.026 1.104.007 1.3-.189.126-.133.385-.631.498-.985.209-.643.417-.921.366-.492-.113.966-.322 1.692-.713 2.411-.259.499-.663 1.092-.934 1.395-.322.347-.315.36.088.315.619-.063 1.471-.397 2.096-.82.827-.562 1.647-1.691 2.19-3.03.107-.27.22-.22.183.083-.013.094-.038.315-.057.498l-.031.328.353-.202c.833-.48 1.414-1.262 2.127-2.884.227-.518.877-2.922 1.073-3.976a9.64 9.64 0 01.271-1.042c.127-.429.196-.555.48-.858.183-.19.625-.555.978-.808.72-.505.953-.75 1.187-1.205.208-.417.284-1.13.132-1.357-.132-.202-.284-.196-.763.006Z"/></svg>
<svg role="img" width="25px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Discord</title><path fill="#5865F2" d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
<svg role="img" width="25px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Docker</title><path fill="#2496ED" d="M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z"/></svg>
- Node.js https://nodejs.org/en/
    - v20.9 (End of Life)
    - v22.23.3 LTS
    - v24.22.0 LTS
    - v26.x
-   MySQL or MariaDB
-   A Discord bot application, see [.env setup](ENV.md)
-   **Optional**: Docker + Docker Compose, for the [container deployment](#docker-compose)
-   **Optional**: yt-dlp, for music functionality (off by default: `DISABLE_MUSIC=true`)

## 1. Create the database

KaikiBot stores data using MySQL/MariaDB. Prisma migrations create the **tables**, but the database itself has to exist **before** the first migration.

Log into the database server as an administrator (`sudo mariadb`, or `sudo mysql`) and run:

    CREATE DATABASE kaikidb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    CREATE USER 'kaikibot'@'localhost' IDENTIFIED BY 'your_Password';
    GRANT ALL PRIVILEGES ON kaikidb.* TO 'kaikibot'@'localhost';
    FLUSH PRIVILEGES;

-   `utf8mb4` is required to store emoji, nicknames and other text correctly.
-   `GRANT ALL PRIVILEGES ON kaikidb.*` is enough for both the migrations and normal operation, and keeps the bot's user scoped to its own database.

Prisma will create the database for you only if the configured user has the server-wide `CREATE` privilege. Creating it explicitly, as above, is preferable as it avoids handing the bot's user more privileges than it needs.

Point the bot at the database in `.env` (see [.env setup](ENV.md)):

    DATABASE_URL="mysql://kaikibot:your_Password@localhost:3306/kaikidb"


## 2. Clone, install, build

    git clone https://github.com/cataclym/KaikiBot.git && cd KaikiBot

### 2.1. Configure .env

    cp .env.example .env

Fill it in, following [.env setup](ENV.md), and set `NODE_ENV=production` for a production deployment.

### 2.2. Install and build
    npm ci
    npm run build

`npm run build` generates the Prisma client and compiles TypeScript.

For a lean production install you can use `npm run deploy` instead: it installs dev dependencies, builds, then prunes them again.

    NODE_ENV=production npm run deploy

## 3. Apply the migrations

The tables are created by Prisma migrations — never by hand. The production command is:

    npx prisma migrate deploy

It applies every migration that has not been applied yet, in order, non-interactively, and is safe to re-run. Check where you stand at any time with:

    npx prisma migrate status

`npm run build` already runs `prisma migrate deploy` for you, **but only when it can see `NODE_ENV=production`**, and it reads that from the shell environment, not from `.env` (the check in the build script is a bare `node -e`, and Node does not load `.env` by itself). So either export it:

    NODE_ENV=production npm run build

or build and migrate as two separate steps, which is what you want if you build somewhere without database access, such as CI:

    npm run build
    npx prisma migrate deploy

Never run `prisma migrate dev` or `prisma db push` against a production database — they are development tools and can reset the database, dropping all data.

## 4. Run the bot

    npm start

### A production deployment should run as a service.

Example systemd unit — adjust the paths, and note that `npm` from a version manager (nvm, fnm) usually does not resolve for systemd, so point `ExecStart` at the `node` binary directly (`which node`): 

Create and edit file with `nano /etc/systemd/system/kaikibot.service`

    [Unit]
    Description=KaikiBot
    After=network-online.target mariadb.service
    Wants=network-online.target

    [Service]
    User=kaikibot
    WorkingDirectory=/opt/KaikiBot
    Environment=NODE_ENV=production
    ExecStart=/usr/bin/node dist/index.js --color
    Restart=on-failure
    RestartSec=10

    [Install]
    WantedBy=multi-user.target

Save with `ctrl+o`

Exit with `ctrl+x`

Commands

    sudo systemctl daemon-reload
    sudo systemctl enable --now kaikibot
    sudo journalctl -u kaikibot -f

# Docker Compose

`docker-compose.yml` runs MariaDB and the bot together. The MariaDB image creates the database and the user on its **first** start from the `MYSQL_*` values in `.env`, so no manual database setup is needed here:

    MYSQL_ROOT_PASSWORD=your_Root_Password
    MYSQL_DATABASE=kaikidb
    MYSQL_USER=kaikibot
    MYSQL_PASSWORD=your_Password

Inside the Compose network the bot reaches the database over the service name, not `localhost`:

    DATABASE_URL="mysql://kaikibot:your_Password@db:3306/kaikidb"

Then:

    docker compose up -d --build
    docker compose logs -f kaikibot

-   The container applies migrations itself: the Dockerfile's start command is `npx prisma migrate deploy && node dist/index.js --color`.
-   The `MYSQL_*` values are only read while the database volume is being initialized. Changing them later has no effect until the volume is recreated with `docker compose down -v` — which **deletes all data**, or until you change the password in MariaDB directly.
-   MariaDB is published on host port 3307 (`3307:3306`), so anything connecting from outside the Compose network — for example a bot running natively against the Compose database — uses `localhost:3307`, not 3306. Only the bot container itself uses `db:3306`.
-   `depends_on` waits for the database container to start, not for MariaDB to be ready to accept connections. On a very first boot the bot can therefore hit a connection error, exit, and be restarted by `restart: unless-stopped` until the database is up.

# Updating

    git pull
    NODE_ENV=production npm run deploy
    sudo systemctl restart kaikibot

With Docker: `git pull && docker compose up -d --build`.

# Troubleshooting

-   `P1010: User ... was denied access on the database ...` — the database does not exist, the name in `DATABASE_URL` is wrong, or the user lacks privileges on it. See [step 1](#1-create-the-database).
-   `P1001: Can't reach database server` — the database is not running, or the host/port is wrong. Inside Docker Compose the host is `db` and the port `3306`; from the host machine the Compose MariaDB is on `localhost:3307`.
-   `P3009: migrate found failed migrations in the target database` — a migration did not finish. Inspect the `_prisma_migrations` table, fix the cause, then clear it with `npx prisma migrate resolve --rolled-back <migration_name>`, or `--applied <migration_name>` if it did in fact complete.

Having issues? Come join us on Discord

<a href="https://discord.kaikibot.xyz">
    <img src="https://discord.com/api/guilds/794671071886049280/embed.png?style=banner3" title="Discord Server" alt="Kaiki invite link">
</a>

---

# Inviting your bot

First make sure you have created a bot application. Learn how to [here](ENV.md).

You can use the following link to invite your bot: Replace `YOUR_BOT_ID_HERE` with your bot id/client id.

https://discord.com/oauth2/authorize?client_id=YOUR_BOT_ID_HERE&scope=bot
