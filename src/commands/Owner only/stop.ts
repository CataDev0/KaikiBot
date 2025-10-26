import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "stop",
    description: "Stop the music and clear the queue.",
    usage: [""],
    preconditions: ["OwnerOnly"],
    minorCategory: "Music"
})
export default class StopCommand extends KaikiCommand {
    public async messageRun(message: Message): Promise<Message> {
        if (!this.client.musicService) return message.reply("Music service is not available.")

        if (!this.client.musicService.isConnected()) {
            return message.reply("I'm not playing any music!");
        }

        this.client.musicService.disconnect();

        return message.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle("⏹️ Music Stopped")
                    .setDescription("Stopped playing music and left the voice channel.")
                    .withOkColor(message),
            ],
        });
    }
}
