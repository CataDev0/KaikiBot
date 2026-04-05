import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "evolve",
    description: "Sacrifice 5 duplicates of a specific Oddity to evolve them into ONE random Oddity of the next rarity tier.",
    usage: ["<Oddity ID>"],
    preconditions: ["GuildOnly"],
    minorCategory: "Oddities"
})
export default class EvolveCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const oddityId = await args.pick("number").catch(() => null);

        if (!oddityId) {
            return message.reply("You need to provide the ID of the Oddity you want to evolve! Check your `inventory` to see your IDs.");
        }

        const sent = await message.reply("Sacrificing duplicates to the esoteric forces...");

        try {
            const newOddity = await this.client.gachaService.evolveOddity(BigInt(message.author.id), oddityId);

            const stars = "⭐".repeat(newOddity.Rarity);
            const genderEmote = newOddity.Type === "waifu" ? "🚺" : (newOddity.Type === "husbando" ? "🚹" : "❓");
            
            const isDuplicate = newOddity.isDuplicate;
            const rankTitle = newOddity.Rarity === 5 ? "🌟 MYTHIC EVOLUTION! 🌟\n✨ " : "✨ EVOLUTION SUCCESS! ✨\n";
            
            const affinityEmoji = newOddity.affinityData?.emoji || "✨";
            const affinityName = newOddity.affinityData?.id || newOddity.Affinity || "Unknown";
            const affinityDesc = newOddity.affinityData?.desc || "";

            const pwrDef = `**Power:** ⚔️ ${newOddity.Power} | **Defense:** 🛡️ ${newOddity.Defense}`;
            const dupeStr = isDuplicate ? "\n\n🔁 **Duplicate!** You ascended it." : "";
            const affStr = `\n\n**Affinity:** ${affinityEmoji} ${affinityName}\n*${affinityDesc}*`;
            
            const embedColor = Constants.MAGIC_NUMBERS.CMDS.GAMBLING.GACHA.RARITY_COLORS[newOddity.Rarity as keyof typeof Constants.MAGIC_NUMBERS.CMDS.GAMBLING.GACHA.RARITY_COLORS];

            const embed = new EmbedBuilder()
                .setTitle(`${rankTitle}${stars} | ${genderEmote} ${newOddity.Name}`)
                .setDescription(`From the ashes of your sacrifices, a new Oddity emerged!\n\n${pwrDef}${affStr}${dupeStr}`)
                .setImage(newOddity.ImageUrl)
                .setFooter({ text: `Card #${newOddity.Id} - Minted for ${message.author.username}` })
                .setColor(embedColor as any);

            return await sent.edit({ embeds: [embed], content: null });
        } catch (error) {
            this.client.logger.error("Oddity evolve failed", error);
            return await sent.edit(`❌ Evolution failed: ${(error as Error).message}`);
        }
    }
}
