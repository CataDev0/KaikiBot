import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "showcase",
    aliases: ["viewoddity"],
    description: "Showcase a specific Oddity.",
    usage: ["<ID>"],
    preconditions: ["GuildOnly"],
    minorCategory: "Oddities"
})
export default class ShowcaseCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const oddityId = await args.pick("number").catch(() => null);

        if (!oddityId) {
            return message.reply("Please provide a valid Oddity ID to showcase! (e.g. `showcase 15`)");
        }

        const oddity = await this.client.orm.oddities.findUnique({
            where: { Id: oddityId }
        });

        if (!oddity) {
            return message.reply("No Oddity was found with that exact ID in Kaiki's ledger.");
        }

        const stars = "⭐".repeat(oddity.Rarity);
        const genderEmote = oddity.Type === "waifu" ? "🚺" : (oddity.Type === "husbando" ? "🚹" : "❓");
        const embed = new EmbedBuilder()
            .setTitle(`${stars} | ${genderEmote} ${oddity.Name} ${oddity.Count > 1 ? `(x${oddity.Count})` : ""}`)
            .setDescription(`**Owner:** <@${oddity.UserId}>\n**Type:** ${oddity.Type === "husbando" ? "Husbando" : (oddity.Type === "waifu" ? "Waifu" : "Unknown")}\n**Power:** ⚔️ ${oddity.Power}\n**Defense:** 🛡️ ${oddity.Defense}\n**Count:** 📦 ${oddity.Count}`)
            .setImage(oddity.ImageUrl)
            .setFooter({ text: `Oddity ID: ${oddity.Id} | Minted on ${oddity.CreatedAt.toLocaleDateString()}` })
            .withOkColor(message);

        return message.reply({ embeds: [embed] });
    }
}
