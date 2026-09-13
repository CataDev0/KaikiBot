import { LogLevel } from "@sapphire/framework";
import {
    ClientOptions,
    GatewayIntentBits,
    Options,
    Partials,
    Sweepers,
} from "discord.js";
import Constants from "../../struct/Constants";

const clientOptions: ClientOptions = {
    allowedMentions: { parse: ["users"], repliedUser: true },
    makeCache: Options.cacheWithLimits({
        ...Options.DefaultMakeCacheSettings,
        UserManager: Constants.MAGIC_NUMBERS.CACHE.USER_CACHE_MAX_SIZE,
        PresenceManager: 0,
    }),
    sweepers: {
        ...Options.DefaultSweeperSettings,
        guildMembers: {
            interval: Constants.MAGIC_NUMBERS.CACHE.MEMBER_SWEEP_INTERVAL_S,
            filter: Sweepers.filterByLifetime({
                lifetime: Constants.MAGIC_NUMBERS.CACHE.MEMBER_SWEEP_LIFETIME_S,
                // guild.members.me is a cache getter - permission checks
                // break if the bot's own member is swept
                excludeFromSweep: (member) =>
                    member.id === member.client.user.id,
            }),
        },
        messages: {
            interval: Constants.MAGIC_NUMBERS.CACHE.MESSAGE_SWEEP_INTERVAL_S,
            lifetime: Constants.MAGIC_NUMBERS.CACHE.MESSAGE_SWEEP_LIFETIME_S,
        },
    },
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
        level: process.env.NODE_ENV === "production" ? LogLevel.Info : LogLevel.Debug, 
    },
    typing: true,
}

export default clientOptions;