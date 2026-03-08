import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import { DAPI } from "../../services/HentaiService";
import { Extension } from "../../lib/Interfaces/Common/E261APIData";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";

@ApplyOptions<KaikiCommandOptions>({
    name: "e621",
    description: "Search for a random image on e621. Separate tags with spaces.",
    usage: ["dragon flying"],
    typing: true,
    nsfw: true,
    cooldownDelay: 3000,
})
export default class E621Command extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const tagArgs = await args.repeat("string").catch(() => undefined);
        const tags = tagArgs?.map((t) => t.replace(/ /g, "_")) ?? null;

        const post = await this.client.hentaiService.makeRequest(
            tags,
            DAPI.E621
        );

        if (!post)
            throw new UserError({
                message: "No posts received, please try again.",
                identifier: "NoHentaiPost",
            });

        const isVideo = post.file.ext === Extension.Webm;

        // For videos, use sample/preview as the embed thumbnail; send the direct URL as content for Discord's video player
        const imageURL = isVideo
            ? post.sample.url || post.preview.url || null
            : post.file.url || post.preview.url || post.sample.url || post.sources[0] || null;

        const emb = new EmbedBuilder()
            .setAuthor({
                name:
                    post.tags.artist.length
                        ? post.tags.artist.join(", ")
                        : "*Artist missing*",
            })
            .setDescription(
                KaikiUtil.trim(
                    `**Tags**: ${post.tags.general.join(", ")}`,
                    2048
                )
            )
            .setImage(imageURL)
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

        if (post.tags.species.length) {
            emb.addFields([
                {
                    name: "Species",
                    value: post.tags.species.join(", "),
                    inline: true,
                },
            ]);
        }

        if (post.description) {
            emb.addFields([
                {
                    name: "Description",
                    value: KaikiUtil.trim(post.description, 1024),
                    inline: false,
                },
            ]);
        }

        const reply = await message.reply({
            content: isVideo && post.file.url ? post.file.url : undefined,
            embeds: [emb],
        });

        return reply;
    }
}
