import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import { DAPI } from "../../services/HentaiService";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";

@ApplyOptions<KaikiCommandOptions>({
    name: "safebooru",
    description: "Search for a random image on Safebooru. Separate tags with spaces.",
    usage: ["cat_girl", "touhou reimu"],
    typing: true,
    cooldownDelay: 3000,
})
export default class SafebooruCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const tags = await args.repeat("string").catch(() => undefined);

        const post = await this.client.hentaiService.makeRequest(
            tags || null,
            DAPI.Safebooru
        );

        if (!post)
            throw new UserError({
                message: "No posts received, please try again.",
                identifier: "NoSafebooruPost",
            });

        const emb = new EmbedBuilder()
            .setAuthor({ name: post.owner })
            .setDescription(
                KaikiUtil.trim(`**Tags**: ${post.tags}`, 2048)
            )
            .setImage(post.file_url)
            .withOkColor(message);

        if (post.source) {
            emb.addFields([
                {
                    name: "Source",
                    value: post.source.length > 1024
                        ? `[link](${post.source})`
                        : post.source,
                    inline: true,
                },
            ]);
        }

        return message.reply({ embeds: [emb] });
    }
}
