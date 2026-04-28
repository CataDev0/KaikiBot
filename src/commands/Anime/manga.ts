import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import Common from "../../lib/Anime/Common";
import AnilistGraphQL from "../../lib/APIs/AnilistGraphQL";
import Jikan from "../../lib/APIs/Jikan";
import MangaData from "../../lib/Interfaces/Common/MangaData";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "manga",
    aliases: [""],
    description: "Shows the first result of a query to Anilist",
    usage: "Tsukimonogatari",
    typing: true,
})
export default class MangaCommand extends KaikiCommand {
    public async messageRun(
        message: Message<true>,
        args: Args
    ): Promise<Message | void> {
        const manga = await args.rest("string");

        const url = "https://graphql.anilist.co",
            options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    query: AnilistGraphQL.mangaQuery,
                    variables: {
                        search: manga,
                        page: 1,
                        perPage: 1,
                        type: "MANGA",
                    },
                }),
            };

        const res = await fetch(url, options).catch(() => null);
        let json: MangaData | null = null;
        
        if (res && res.ok) {
            json = await AnilistGraphQL.handleResponse(res).catch(() => null);
        }

        if (!json || !json.data?.Page?.media?.length) {
            try {
                // Fallback to Jikan
                const jikanData = await Jikan.fetchManga(manga);
                return message.reply({ embeds: Jikan.buildMangaEmbed(jikanData, message) });
            } catch (err) {
                return AnilistGraphQL.handleError(message, err);
            }
        }

        const {
            coverImage,
            title,
            chapters,
            description,
            status,
            startDate,
            genres,
            endDate,
            siteUrl,
        } = json.data.Page.media[0];

        const started = Common.formatDate(startDate);
        const airedText = Object.values(endDate).some(Boolean) ? started : Common.formatDate(endDate);

        return message.reply({
            embeds: [
                Common.createEmbed(
                    coverImage,
                    title,
                    siteUrl,
                    description,
                    message
                ),
                new EmbedBuilder()
                    .addFields([
                        {
                            name: "Chapters",
                            value: String(chapters ?? "N/A"),
                            inline: true,
                        },
                        {
                            name: "Release period",
                            value: airedText,
                            inline: true,
                        },
                        { name: "Status", value: status, inline: true },
                        {
                            name: "Genres",
                            value: genres.join(", "),
                            inline: false,
                        },
                    ])
                    .withOkColor(message),
            ],
        });
    }
}
