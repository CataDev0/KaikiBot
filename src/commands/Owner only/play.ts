import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "play",
    description: "Play music from YouTube or other sources using yt-dlp.",
    usage: ["<url or search query>", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"],
    preconditions: ["OwnerOnly", "GuildOnly"],
    minorCategory: "Music"
})
export default class PlayCommand extends KaikiCommand {
    public async messageRun(message: Message<true>, args: Args): Promise<Message> {
        if (!this.client.musicService) return message.reply("Music service is not available.")

        const voiceChannel = message.member!.voice.channel;
        if (!voiceChannel) {
            return message.reply("You need to be in a voice channel to play music!");
        }

        const query = await args.rest("string").catch(() => null);
        if (!query) {
            return message.reply("Please provide a URL or search query.");
        }

        try {
            await this.client.musicService.join(voiceChannel);

            const url = query.startsWith("http") ? query : `ytsearch:${query}`;

            const result = await this.client.musicService.play(
                url,
                message.author.tag
            );

            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🎵 Jukebox")
                        .setDescription(result)
                        .withOkColor(message),
                ],
            });
        } catch (error) {
            this.client.logger.error(error);
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("❌ Error")
                        .setDescription("Failed to play music. Make sure the URL is valid.")
                        .withErrorColor(message),
                ],
            });
        }
    }
}
