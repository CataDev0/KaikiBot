import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "inventory",
    aliases: ["inv", "oddities"],
    description: "View your collected Oddities.",
    usage: [""],
    preconditions: ["GuildOnly"],
    minorCategory: "Oddities"
})
export default class InventoryCommand extends KaikiCommand {
    public async messageRun(message: Message): Promise<Message> {
        const oddities = await this.client.orm.oddities.findMany({
            where: { UserId: BigInt(message.author.id) },
            orderBy: [{ Rarity: "desc" }, { Power: "desc" }],
            take: 15
        });

        if (!oddities.length) {
            return message.reply("You don't own any Oddities yet! Try pulling some with the `roll` command.");
        }

        const embed = new EmbedBuilder()
            .setTitle(`💼 ${message.author.username}'s Oddity Inventory`)
            .withOkColor(message);

        const description = oddities.map(o => {
            const genderEmote = o.Type === "waifu" ? "🚺" : (o.Type === "husbando" ? "🚹" : "❓");
            const canEvolve = o.Count >= 5 && o.Rarity < 5;
            const evolveFlair = canEvolve ? `\n> ✨ **Evolution available!** (Use \`evolve ${o.Id}\`)` : "";
            
            return `**ID:** \`${o.Id}\` | ${"⭐".repeat(o.Rarity)} | ${genderEmote} **${o.Name}**${o.Count > 1 ? ` *(x${o.Count})*` : ""}${evolveFlair}`;
        }).join("\n");
        embed.setDescription(`${description}\n\n*Showing your top 15 rarest Oddities. Use \`showcase <ID>\` to view one!*`);

        return message.reply({ embeds: [embed] });
    }
}
