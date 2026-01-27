import { LogLevel } from "@sapphire/framework";
import { ClientOptions, GatewayIntentBits, Partials } from "discord.js";

const clientOptions: ClientOptions = {
    allowedMentions: { parse: ["users"], repliedUser: true },
    intents: [
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.GuildExpressions,
        GatewayIntentBits.GuildIntegrations,
        GatewayIntentBits.GuildInvites,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildWebhooks,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Reaction,
        Partials.Channel,
        Partials.GuildMember,
    ],
    shards: "auto",
    loadMessageCommandListeners: true,
    loadDefaultErrorListeners: false,
    defaultCooldown: {
        delay: 1000,
    },
    defaultPrefix: process.env.PREFIX,
    caseInsensitiveCommands: true,
    logger: {
        level: LogLevel.Debug,
    },
    typing: true,
}

export default clientOptions;