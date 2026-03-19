import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

interface AnimechanQuote {
    anime: string;
    character: string;
    quote: string;
    error?: string;
}

@ApplyOptions<KaikiCommandOptions>({
    name: "animequote",
    aliases: ["aq", "animequotes"],
    description: "Get a random anime quote, or search for a specific anime's quotes via animechan.io",
    usage: ["", "Tsukimonogatari"],
    typing: true,
})
export default class AnimeQuoteCommand extends KaikiCommand {
    public async messageRun(message: Message<true>, args: Args) {
        
        const anime = await args.rest("string").catch(() => undefined);

        const url = anime
            ? `https://api.animechan.io/v1/quotes/anime?title=${encodeURIComponent(anime)}`
            : "https://api.animechan.io/v1/quotes/random";

        let quoteData: AnimechanQuote;

        try {
            const res = await fetch(url);
            
            if (!res.ok) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("Error")
                            .setDescription(`Failed to fetch quote. No quotes found or the API might be down.\nStatus: ${res.status} ${res.statusText}`)
                            .withErrorColor(message),
                    ],
                });
            }

            const data = await res.json();
            
            // Search by Anime returns an array
            // Random quote returns a single object
            if (Array.isArray(data)) {
                // Pick a random quote from the array
                quoteData = data[Math.floor(Math.random() * data.length)];
            } else {
                quoteData = data as AnimechanQuote;
            }

        } catch (error) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error")
                        .setDescription(`An error occurred while fetching the quote: ${error}`)
                        .withErrorColor(message),
                ],
            });
        }

        if (quoteData.error) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`API Error: ${quoteData.error}`)
                        .withErrorColor(message),
                ],
            });
        }

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle(quoteData.anime)
                    .setDescription(`"${quoteData.quote}"\n\n— *${quoteData.character}*`)
                    .withOkColor(message),
            ],
        });
    }
}
