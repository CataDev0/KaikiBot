import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import Common from "../../lib/Anime/Common";
import AnilistGraphQL from "../../lib/APIs/AnilistGraphQL";
import Jikan from "../../lib/APIs/Jikan";
import AnimeData from "../../lib/Interfaces/Common/AnimeData";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "anime",
    description: "Shows the first result of a query to Anilist",
    usage: "Tsukimonogatari",
    typing: true,
})
export default class AnimeCommand extends KaikiCommand {
    public async messageRun(message: Message<true>, args: Args) {
        const anime = await args.rest("string");

        const url = "https://graphql.anilist.co",
            options = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    query: AnilistGraphQL.aniQuery,
                    variables: {
                        search: anime,
                        page: 1,
                        perPage: 1,
                        type: "ANIME",
                    },
                }),
            };

        const res = await fetch(url, options).catch(() => null);
        let json: AnimeData | null = null;
        if (res && res.ok) {
            json = await AnilistGraphQL.handleResponse(res).catch(() => null);
        }

        if (!json || !json.data?.Page?.media?.length) {
            try {
                // Fallback to Jikan
                const jikanData = await Jikan.fetchAnime(anime);
                return message.reply({ embeds: Jikan.buildAnimeEmbed(jikanData, message) });
            } catch (err) {
                return AnilistGraphQL.handleError(message, err);
            }
        }

        const {
            coverImage,
            title,
            episodes,
            description,
            format,
            status,
            studios,
            startDate,
            genres,
            endDate,
            siteUrl,
        } = json.data.Page.media[0];

        const started = Common.formatDate(startDate);
        const airedText = Object.values(endDate).some(Boolean) ? `${started} to ${Common.formatDate(endDate)}` : started;

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
                        { name: "Format", value: format, inline: true },
                        {
                            name: "Episodes",
                            value: String(episodes || "N/A"),
                            inline: true,
                        },
                        { name: "Aired", value: airedText, inline: true },
                        { name: "Status", value: status, inline: true },
                        {
                            name: "Genres",
                            value: genres.join(", "),
                            inline: true,
                        },
                        {
                            name: "Studio(s)",
                            value: studios.nodes
                                .map((n) => n.name)
                                .join(", "),
                            inline: true,
                        },
                    ])
                    .withOkColor(message),
            ],
        });
    }
}
