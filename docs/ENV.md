### Paths

-   [Readme](../README.md)
-   Docs
    -   [Guide](GUIDE.md)
    -   [Placeholders](PLACEHOLDERS.md)

# .env setup guide

The .env file is important for the bot to run at all. Read below how to populate its fields.

## CLIENT_TOKEN

Create a bot application

-   Go to your discord bot applications (https://discord.com/developers/applications/)
-   Click `New Application` in top right corner
-   Fill in a name, and assign it to personal team.
-   Click `Bot` under `SETTINGS` on the menu, on the left.
-   Click `Add Bot`
-   Click `Copy` under `TOKEN`
-   Paste the token in the .env file. Make sure it looks like the example below.

Example

    CLIENT_TOKEN=MCD5MTB2MzY2MzgwNzU5Fjgw.O08nDN.Rl6rIwtlAg9Hauq8CLFL0l23sun

## PREFIX

Decide what prefix the bot should default to on new servers.

Example

    PREFIX=+

Prefix is `+`

## MySQL/MariaDB

`DATABASE_URL` is the connection string Prisma uses. Replace `yourUsername`, `yourPassword` and `kaikidb` with the user, password and database you created in [step 1 of the guide](GUIDE.md#1-create-the-database).

-   Note: In some cases you need to change `localhost` with `127.0.0.1`
-   Docker Compose: use the service name `db` as the host and the container port `3306`, see [Docker Compose](GUIDE.md#docker-compose)

Example

    DATABASE_URL="mysql://yourUsername:yourPassword@localhost:3306/kaikidb"

### Docker database initialization

Only read when you start the MariaDB container from `docker-compose.yml`: the image creates this database and user the first time its volume is initialized. Ignored if you point the bot at your own database server.

    MYSQL_ROOT_PASSWORD=yourRootPassword
    MYSQL_DATABASE=kaikidb
    MYSQL_USER=yourUsername
    MYSQL_PASSWORD=yourPassword

## NODE_ENV

Set this to `production` on a production deployment. It decides the log level and whether the bot registers its DiscordBotList webhook, and without it `npm run build` will not apply database migrations, see [step 3 of the guide](GUIDE.md#3-apply-the-migrations).

    NODE_ENV=production

## KAWAIIKEY (Optional)

-   Login to https://kawaii.red/dashboard/ with your Discord account
-   Reveal and copy the token
-   Paste the token in the .env file. Make sure it looks like the example below.

Example

    KAWAIIKEY=142788173885276162.DspDpD0isjuXAKD73vWs

## Dashboard (Optiona)
Requires a running clone of https://github.com/cataDev0/kaikibot.xyz/ 

The port the website is using

    SELF_API_PORT=3636

Specify a secret the dashboard uses to communicate

    SELF_API_TOKEN=

The url including endpoint where the bot will upload the commandlist to 

    CMDLIST_URL=


## The rest of the file

Please leave this as is, unless you know what you're doing

## Example of finished .env file

    # Bot
    CLIENT_TOKEN=MND5MTA2MzY2MzgwNzU5Fjgw.O08nDN.Bl6rIwtlAg9Hxuz8CLPD0l23sun
    PREFIX=+
    KAWAIIKEY=142788173885276162.DspDpD0isjuXAKD73vWs

    # Database
    DATABASE_URL="mysql://yourUsername:yourPassword@localhost:3306/kaikidb"

    # Docker
    MYSQL_ROOT_PASSWORD=yourRootPassword
    MYSQL_DATABASE=kaikidb
    MYSQL_USER=yourUsername
    MYSQL_PASSWORD=yourPassword
    NODE_DOCKER_PORT=8080
    NODE_ENV=production

    # Bot settings
    DADBOT_MAX_LENGTH=256
    DADBOT_NICKNAME_LENGTH=32
    DADBOT_DEFAULT_ROLENAME=Dadbot-excluded
