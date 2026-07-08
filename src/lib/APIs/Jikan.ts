import { EmbedBuilder, Message } from "discord.js";
import Common from "../Anime/Common";

export default class Jikan {
    static async fetchAnime(search: string) {
        const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(search)}&limit=1`);
        if (!res.ok) throw new Error("Jikan API error");
        const json = await res.json();
        if (!json.data || json.data.length === 0) throw new Error("No data found");
        return json.data[0];
    }

    static async fetchManga(search: string) {
        const res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(search)}&limit=1`);
        if (!res.ok) throw new Error("Jikan API error");
        const json = await res.json();
        if (!json.data || json.data.length === 0) throw new Error("No data found");
        return json.data[0];
    }

    static buildAnimeEmbed(data: any, message: Message) {
        const title = {
            english: data.title_english || data.title_japanese || "",
            romaji: data.title || "",
        };
        const coverImage = {
            large: data.images?.webp?.large_image_url || data.images?.jpg?.large_image_url || "",
            color: "#2f3136"
        };
        const startDate = data.aired?.prop?.from || { day: null, month: null, year: null };
        const endDate = data.aired?.prop?.to || { day: null, month: null, year: null };
        const started = Common.formatDate(startDate);
        const airedText = Object.values(endDate).some(Boolean) ? `${started} to ${Common.formatDate(endDate)}` : started;

        const genres = data.genres?.map((g: any) => g.name) || [];
        const studios = data.studios?.map((s: any) => s.name) || [];

        return [
            Common.createEmbed(coverImage, title, data.url, data.synopsis, message),
            new EmbedBuilder()
                .addFields([
                    { name: "Format", value: data.type || "N/A", inline: true },
                    {
                        name: "Episodes",
                        value: String(data.episodes || "N/A"),
                        inline: true,
                    },
                    { name: "Aired", value: airedText, inline: true },
                    { name: "Status", value: data.status || "N/A", inline: true },
                    {
                        name: "Genres",
                        value: genres.length ? genres.join(", ") : "N/A",
                        inline: true,
                    },
                    {
                        name: "Studio(s)",
                        value: studios.length ? studios.join(", ") : "N/A",
                        inline: true,
                    },
                ])
                .withOkColor(message),
        ];
    }

    static buildMangaEmbed(data: any, message: Message) {
        const title = {
            english: data.title_english || data.title_japanese || "",
            romaji: data.title || "",
        };
        const coverImage = {
            large: data.images?.webp?.large_image_url || data.images?.jpg?.large_image_url || "",
            color: "#2f3136"
        };
        const startDate = data.published?.prop?.from || { day: null, month: null, year: null };
        const endDate = data.published?.prop?.to || { day: null, month: null, year: null };
        const started = Common.formatDate(startDate);
        const publishedText = Object.values(endDate).some(Boolean) ? `${started} to ${Common.formatDate(endDate)}` : started;

        const genres = data.genres?.map((g: any) => g.name) || [];

        return [
            Common.createEmbed(coverImage, title, data.url, data.synopsis, message),
            new EmbedBuilder()
                .addFields([
                    { name: "Format", value: data.type || "N/A", inline: true },
                    {
                        name: "Chapters",
                        value: String(data.chapters || "N/A"),
                        inline: true,
                    },
                    { name: "Published", value: publishedText, inline: true },
                    { name: "Status", value: data.status || "N/A", inline: true },
                    {
                        name: "Genres",
                        value: genres.length ? genres.join(", ") : "N/A",
                        inline: true,
                    }
                ])
                .withOkColor(message),
        ];
    }
}
