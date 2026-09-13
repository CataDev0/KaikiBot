import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "ship",
    description: "Calculates the compatibility between two users.",
    usage: ["@user1", "@user1 @user2"],
    preconditions: ["GuildOnly"],
})
export default class ShipCommand extends KaikiCommand {
    public async messageRun(message: Message<true>, args: Args): Promise<Message> {
        let user1 = message.author;
        let user2 = await args.pick("user").catch(() => null);

        if (!user2) {
            // Member cache may have been swept - fall back to the bot itself
            user2 = message.guild.members.cache.random()?.user
                ?? message.guild.members.me?.user
                ?? message.author;
        } else {
            // Check for a second user
            const possibleUser3 = await args.pick("user").catch(() => null);
            if (possibleUser3) {
                user1 = user2;
                user2 = possibleUser3;
            }
        }

        if (!user2) {
            throw new Error("Could not find a user to ship with!");
        }

        // Generate a consistent "random" number based on IDs
        const combined = BigInt(user1.id) + BigInt(user2.id);
        const score = Number(combined % 101n); 
        // Note: % 101 gives 0-100 inclusive. 

        let description = "";

        if (score === 0) description = ShipCommand.SCORES[0][1];
        const tier = ShipCommand.SCORES.find(([max]) => score < max);
        description = tier ? tier[1] : "💖 Perfect!"; 

        const embed = new EmbedBuilder()
            .setTitle("❤️ Shipping ❤️")
            .setDescription(`**${user1.username}** x **${user2.username}**\n\nCompatibility: **${score}%**\n${description}`)
            .withOkColor(message);

        return message.reply({ embeds: [embed] });
    }

    private static readonly SCORES: [number, string][] = [
        [0, "🔻 Abysmal..."],
        [20, "⬛ Awful."],
        [40, "🟥 Bad."],
        [60, "🟨 Average."],
        [80, "🟦 Good."],
        [100, "🟩 Great!"],
        [Infinity, "💖 Perfect!"],
    ];
}
