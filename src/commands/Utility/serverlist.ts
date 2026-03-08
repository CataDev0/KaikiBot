import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { sendPaginatedMessage } from "discord-js-button-pagination-ts";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "serverlist",
    aliases: ["listservers", "servers"],
    description: "Lists all servers the bot is in. 15 servers per page.",
    usage: ["", "7"],
    preconditions: ["OwnerOnly"],
    requiredClientPermissions: ["SendMessages"],
})
export default class ServerList extends KaikiCommand {
    public async messageRun(message: Message, args: Args) {
        const startPage = await args.pick("number").catch(() => 0);

        const { GUILDS_PER_PAGE } =
			Constants.MAGIC_NUMBERS.CMDS.UTILITY.SERVER_LIST;
        const pages = [];
        const guilds = [...this.client.guilds.cache.values()];
        const totalPages = Math.ceil(guilds.length / GUILDS_PER_PAGE);
        const embed = new EmbedBuilder()
            .setTitle(`Total Servers: ${guilds.length}`)
            .withOkColor(message);

        for (
            let from = 0, to = GUILDS_PER_PAGE, page = 1;
            from < guilds.length;
            from += GUILDS_PER_PAGE, to += GUILDS_PER_PAGE, page++
        ) {
            const currentPageGuilds = guilds.slice(from, to);

            const emb = EmbedBuilder.from(embed)
                .setFooter({ text: `Page ${page}/${totalPages}` });

            currentPageGuilds.forEach((guild) => {
                emb.addFields({
                    name: guild.name,
                    value: `ID: ${guild.id}\nMembers: ${guild.memberCount}\nShard: ${guild.shardId}`,
                    inline: true,
                });
            });

            pages.push(emb);
        }

        return sendPaginatedMessage(message, pages, {
            owner: message.author,
            startPage,
        });
    }
}
