# KaikiBot

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/C0C3IJV8A)

## Kaiki is a feature-rich Discord bot, written with ❤️ in **TypeScript**

| [Website](https://kaikibot.xyz) | [Invite Kaiki to your server](https://discord.com/oauth2/authorize?client_id=714695773534814238&scope=bot) | [Commands](https://kaikibot.xyz/commands) | [Support Server](https://kaikibot.xyz/discord) |
|-|-|-|-|

![Website](https://img.shields.io/website?url=http%3A//kaikibot.xyz)
![Live Version](https://img.shields.io/endpoint?url=https%3A%2F%2Fkaikibot.xyz%2Fshields%3Fparam%3Dversion)

<img width=600 src="https://kaikibot.xyz/kaikibot.png">
<!-- TODO: Add a nice visual header screenshot or GIF here! -->
<!-- > ![KaikiBot Showcase Placeholder](https://via.placeholder.com/800x400?text=KaikiBot+Dashboard+or+Commands+Showcase) -->

## Tech Stack

KaikiBot is built using these technologies

- [TypeScript](https://www.typescriptlang.org/)
- [Discord.js](https://discord.js.org/)
- [Sapphire Framework](https://www.sapphirejs.dev/) - Command framework
- [Prisma ORM](https://www.prisma.io/) - Database interaction
- [MariaDB](https://mariadb.org/) / MySQL - Primary database

## Features

### Economy

- Gambling commands (slots, coinflip, and more)  
- Daily rewards to keep users engaged  
- Currency transactions between members  
- Gacha card collection
  - PvP - Battle friends
  - PvE - Battle the bot

### Interactions

- Huge collection of **anime reaction gifs**  
- Don’t forget to **+pat your homies**

### Utilities & Unique Tools

- `+emotecount` - Track how many times each **emote** has been used in your server  
- `+mcping` - Ping your **Minecraft server** to check its status  
- `+todo` - Manage your **personal todo list**  
- `+info` - Get detailed information on channels, members, roles, emojis, or messages  
- `+weather` / `+forecast` - Check the current weather or get a forecast

### Website / Dashboard

- [Website Dashboard](https://kaikibot.xyz/dashboard)
- Login using Discord account
- Manage server
  - Configurations
  - Messages
  - Colors
  - Roles
- Build Embed messages
- Full command list

## Documentation

- [Self-hosting Guide](docs/GUIDE.md)  
- [Placeholders](docs/PLACEHOLDERS.md) for greet/bye messages  
- [.env Setup](docs/ENV.md)  

## Quick Start (Development)

Want to run KaikiBot locally for development?

1. Clone the repository and install dependencies:

   ```bash
   git clone https://github.com/cataclym/KaikiBot.git
   cd KaikiBot
   npm i
   ```

2. Create and configure your `.env` file (essential for the database and bot token):

   ```bash
   cp .env.example .env
   ```

   *(Be sure to edit `.env` with your MySQL/MariaDB credentials! See [.env Setup](docs/ENV.md))*
3. Push the database schema:

   ```bash
   npx prisma db push
   ```

4. Start the bot in watch mode:

   ```bash
   npm run dev
   ```

## Contributing

Want to make Kaiki better? Contributions are always welcome!  
Check out issues, submit PRs, or suggest features — every bit of help means a lot. 💜  

- **Looking for a place to start?** Check out our [Good First Issues](https://github.com/cataclym/KaikiBot/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) and [Help Wanted](https://github.com/cataclym/KaikiBot/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) tags!
- Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before participating to help us keep an approachable and respectable community.
- Need development help? Join our [Discord Support Server](https://kaikibot.xyz/discord).

## Upcoming Plans

- Rework todo (TodoRework branch)

- ~~Serve and Update commandlist to website automatically~~ Finished

> Built with blood, sweat and tears ✨
