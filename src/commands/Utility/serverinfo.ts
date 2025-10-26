import { time } from "@discordjs/builders";
import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { ChannelType, EmbedBuilder, GuildFeature, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "serverinfo",
    aliases: ["sinfo"],
    usage: ["", "1233109312930920391023", "CoolServerName"],
    description: "Shows information about the current server.",
    minorCategory: "Info",
})
export default class ServerInfoCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const guild = message.inGuild()
            ? await args.pick("guild").catch(() => message.guild)
            : await args.pick("guild");

        const emb = new EmbedBuilder({
            thumbnail: {
                url: <string>guild.iconURL({ extension: "png", size: 2048 }),
            },
            title: `${guild.name} [${guild.id}]`,
            author: { name: "Server info" },
            fields: [
                {
                    name: "Owner",
                    value:
						message.client.users.cache.get(guild.ownerId)
						    ?.username ?? guild.ownerId,
                    inline: true,
                },
                {
                    name: "Created At",
                    value: time(guild.createdAt),
                    inline: true,
                },
                {
                    name: "Members",
                    value: String(guild.memberCount),
                    inline: true,
                },
                {
                    name: "Roles",
                    value: String(guild.roles.cache.size),
                    inline: true,
                },
                {
                    name: "Emotes",
                    value: String(guild.emojis.cache.size),
                    inline: true,
                },
                {
                    name: "MFA level",
                    value: String(guild.mfaLevel),
                    inline: true,
                },
                {
                    name: "Channels",
                    value: `Text: **${guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildText).size}**
Voice: **${guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildVoice).size}**
News: **${guild.channels.cache.filter((channel) => channel.type === ChannelType.GuildAnnouncement).size}**`,
                    inline: true,
                },
                {
                    name: "Maximum video-channel users",
                    value: String(guild.maxVideoChannelUsers),
                    inline: false,
                },
            ],
        });

        return message.reply({ embeds: [emb.withOkColor(message)] });
    }
}
