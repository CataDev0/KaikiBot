import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import { DAPI } from "../../services/HentaiService";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";

@ApplyOptions<KaikiCommandOptions>({
    name: "e621",
    description: "e621 :hahaa:",
    usage: ["dragon flying"],
    typing: true,
    nsfw: true,
})
export default class EAPICommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const tags = await args.pick("string").catch(() => undefined);

        const post = await this.client.hentaiService.makeRequest(
            tags ? tags?.split("+").map((tag) => tag.replace(" ", "_")) : null,
            DAPI.E621
        );

        const emb = new EmbedBuilder()
            .setAuthor({ name: post.tags.artist.join(", ") || "N/A" })
            .setDescription(
                KaikiUtil.trim(`**Tags**: ${post.tags.general.join(",")}`, 2048)
            )
            .setImage(
                post.file.url ||
					post.preview.url ||
					post.sample.url ||
					post.sources[0]
            )
            .withOkColor(message);

        if (post.tags.character.length) {
            emb.addFields([
                {
                    name: "Character(s)",
                    value: post.tags.character.join(", "),
                    inline: true,
                },
            ]);
        }

        return message.reply({ embeds: [emb] });
    }
}
