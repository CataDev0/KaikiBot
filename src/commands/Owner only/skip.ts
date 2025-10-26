import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "skip",
    aliases: ["s"],
    description: "Skip the current track.",
    usage: [""],
    preconditions: ["OwnerOnly", "GuildOnly"],
    minorCategory: "Music"
})
export default class SkipCommand extends KaikiCommand {
    public async messageRun(message: Message): Promise<Message> {
        if (!this.client.musicService) return message.reply("Music service is not available.")

        if (!this.client.musicService.isConnected()) {
            return message.reply("I'm not playing any music!");
        }

        const skipped = this.client.musicService.skip();

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("⏭️ Skipped")
                    .setDescription(skipped ? "Skipped to the next track." : "Stopped playing (no more tracks in queue).")
                    .withOkColor(message),
            ],
        });
    }
}
