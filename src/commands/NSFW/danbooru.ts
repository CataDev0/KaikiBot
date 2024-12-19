import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import { DAPI } from "../../services/HentaiService";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";

@ApplyOptions<KaikiCommandOptions>({
    name: "danbooru",
    description: "Search for random images on Danbooru image board",
    usage: ["thighs wet_skin"],
    typing: true,
    nsfw: true,
})
export default class EAPICommand extends KaikiCommand {
    private videoExtensions = [".mp4", ".webm", ".ts", ".mkv"];

    public async messageRun(message: Message, args: Args): Promise<Message> {
        let content: string;

        const tags = await args.repeat("string").catch(() => undefined);

        const post = await this.client.hentaiService.makeRequest(
            tags || null,
            DAPI.Danbooru
        );

        if (!post)
            throw new UserError({
                message: "No posts received, please try again.",
                identifier: "NoHentaiPost",
            });

        const imageURL = post.file_url || post.large_file_url || null;

        const emb = new EmbedBuilder()
            .setAuthor({ name: post.tag_string_artist || "*Artist missing*" })
            .setDescription(
                KaikiUtil.trim(`**Tags**: ${post.tag_string_general}`, 2048)
            )
            .setImage(imageURL)
            .withOkColor(message);

        if (post.tag_string_character) {
            emb.addFields([
                {
                    name: "Character(s)",
                    value: post.tag_string_character,
                    inline: true,
                },
            ]);
        }

        const isVideo = this.videoExtensions.some((extension) =>
            post.file_url?.endsWith(extension)
        );

        if (isVideo) content = post.file_url!;

        return message.reply({ embeds: [emb] }).then(async () => {
            return new Promise((resolve) => {
                if (content)
                    setTimeout(
                        () =>
                            resolve(message.reply({ content: content })),
                        1500
                    );
            });
        });
    }
}
