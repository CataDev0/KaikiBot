import * as process from "process";
import { ApplyOptions } from "@sapphire/decorators";
import { version as sapphireVersion } from "@sapphire/framework";
import { sendPaginatedMessage } from "discord-js-button-pagination-ts";
import { ChannelType, EmbedBuilder, Message, time, version } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    aliases: ["stats"],
    name: "stats",
    usage: "",
    description: "Statistics and information about the bot application",
    minorCategory: "Info",
})
export default class StatsCommand extends KaikiCommand {
    public async messageRun(message: Message) {
        const packageJSON = this.client.package;
        const { cache } = this.client.guilds;
        const pages = [
            new EmbedBuilder()
                .setAuthor({
                    name: `${packageJSON.name} v${packageJSON.version}`,
                    iconURL: message.client.user.displayAvatarURL(),
                    url: Constants.LINKS.REPO_URL,
                })
                .setDescription("Detailed statistics")
                .addFields([
                    {
                        name: "Memory Usage",
                        value: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                        inline: true,
                    },
                    {
                        name: "Uptime",
                        value: time(
                            new Date(Date.now() - process.uptime() * 1000),
                            "R"
                        ),
                        inline: true,
                    },
                    {
                        name: "Users",
                        value: `${message.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0)} (${message.client.users.cache.size} cached)`,
                        inline: true,
                    },
                    {
                        name: "Presence",
                        value: `Guilds: **${cache.size}**\nText channels: **${cache
                            .map(
                                (g) =>
                                    g.channels.cache.filter(
                                        (channel) =>
                                            channel.type !==
												ChannelType.GuildVoice &&
											channel.type !==
												ChannelType.GuildCategory
                                    ).size
                            )
                            .reduce(
                                (a, b) => a + b,
                                0
                            )}**\nVoice channels: **${cache
                            .map(
                                (g) =>
                                    g.channels.cache.filter(
                                        (channel) =>
                                            channel.type ===
											ChannelType.GuildVoice
                                    ).size
                            )
                            .reduce((a, b) => a + b, 0)}**`,
                        inline: true,
                    },
                ])
                .withOkColor(message),
            new EmbedBuilder()
                .setDescription("**Built using**:")
                .addFields([
                    {
                        name: "Discord.js",
                        value: `[Discord.js](https://discord.js.org/#/ 'Discord.js website') v${version}`,
                        inline: true,
                    },
                    {
                        name: "@Sapphire/framework",
                        value: `[sapphirejs](https://www.sapphirejs.dev/ 'sapphirejs website') v${sapphireVersion}`,
                        inline: true,
                    },
                    {
                        name: "Running on Node.js",
                        value: `[Node.js](https://nodejs.org/en/ 'Node.js website') ${process.version} (${process.env.NODE_ENV})`,
                        inline: true,
                    }
                ])
                .setAuthor({
                    name: "© 2025 @Cata",
                    iconURL: message.client.user.displayAvatarURL(),
                    url: packageJSON.repository.url,
                })
                .withOkColor(message),
        ];

        if (process.env.npm_config_user_agent) {
            pages[1].addFields([
                {
                    name: "Node Package Manager",
                    value: `[npm](https://www.npmjs.com/ 'npm website') \`${process.env.npm_config_user_agent}\``,
                    inline: true,
                },
            ])
        }

        return sendPaginatedMessage(message, pages);
    }
}
