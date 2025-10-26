import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "queue",
    aliases: ["q"],
    description: "Show the current music queue.",
    usage: [""],
    preconditions: ["OwnerOnly", "GuildOnly"],
    minorCategory: "Music"
})
export default class QueueCommand extends KaikiCommand {
    public async messageRun(message: Message): Promise<Message> {
        if (!this.client.musicService) return message.reply("Music service is not available.")

        const current = this.client.musicService.getCurrentTrack();
        const queue = this.client.musicService.getQueue();

        if (!current && queue.length === 0) {
            return message.reply("The queue is empty!");
        }

        const embed = new EmbedBuilder()
            .setTitle("🎵 Music Queue")
            .withOkColor(message);

        if (current) {
            embed.addFields({
                name: "Now Playing",
                value: `**${current.title}**\nRequested by: ${current.requestedBy}`,
            });
        }

        if (queue.length > 0) {
            const queueList = queue
                .slice(0, 10)
                .map((item, index) => `${index + 1}. **${item.title}** - ${item.requestedBy}`)
                .join("\n");

            embed.addFields({
                name: `Queue (${queue.length} track${queue.length > 1 ? "s" : ""})`,
                value: queueList + (queue.length > 10 ? `\n... and ${queue.length - 10} more` : ""),
            });
        }

        return message.reply({ embeds: [embed] });
    }
}
