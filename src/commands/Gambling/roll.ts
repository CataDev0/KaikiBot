import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "roll",
    aliases: ["pull"],
    description: "Spend your hard earned currency to roll a random Oddity. You can specify 'waifu' (w), 'husbando' (h), or 'random' (r).",
    usage: ["", "waifu", "husbando", "w", "h", "random", "r"],
    preconditions: ["GuildOnly"],
    minorCategory: "Oddities"
})
export default class RollCommand extends KaikiCommand {
    private rollingMessages = [
        "Exploring the Snake Shrine",
        "Searching an abandoned cram school",
        "Rummaging through a suspiciously heavy briefcase",
        "Looking for a lost snail",
        "Checking rumors about a weightless Oddity",
        "Dodging a very angry bee",
        "Consulting the ledger of fakes",
        "Selling charms around middle schools",
        "Spreading rumors out of a Mister Donut",
        "Searching for interesting Oddities around the city",
        "Catching a plane to another part of the country"
    ];
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const type = await args.pick("gachaType").catch(() => "random" as const);

        const ROLL_COST = Constants.MAGIC_NUMBERS.CMDS.GAMBLING.GACHA.ROLL_COST;

        // Check if user has enough money
        const hasEnough = await this.client.money.tryTake(message.author.id, ROLL_COST, "Bought a fake Oddity");
        if (!hasEnough) {
            return message.reply(`You need at least **${ROLL_COST}** ${this.client.money.currencyName} ${this.client.money.currencySymbol} to buy a fake Oddity from Kaiki!`);
        }

        // Rolling message
        const sent = await message.reply(this.rollingMessages[Math.floor(Math.random() * this.rollingMessages.length)] + "...");

        try {
            // Roll
            const oddity = await this.client.gachaService.rollOddity(BigInt(message.author.id), type);

            // Display the pull to the user
            const stars = "⭐".repeat(oddity.Rarity);
            const genderEmote = oddity.Type === "waifu" ? "🚺" : (oddity.Type === "husbando" ? "🚹" : "❓");
            
            const isDuplicate = oddity.isDuplicate;
            const rankTitle = oddity.Rarity === 5 ? "🌟 MYTHIC PULL! 🌟\n✨ " : (oddity.Rarity === 4 ? "✨ EPIC PULL! ✨\n" : "");
            
            const affinityEmoji = oddity.affinityData?.emoji || "✨";
            const affinityName = oddity.affinityData?.id || oddity.Affinity || "Unknown";
            const affinityDesc = oddity.affinityData?.desc || "";

            const pwrDef = `**Power:** ⚔️ ${oddity.Power} | **Defense:** 🛡️ ${oddity.Defense}`;
            const dupeStr = isDuplicate ? `\n\n🔁 **Duplicate!** (Ascension +5% stats). You now have **${oddity.Count}** of these!` : "";
            const affStr = `\n\n**Affinity:** ${affinityEmoji} ${affinityName}\n*${affinityDesc}*`;
            
            const embedColor = Constants.MAGIC_NUMBERS.CMDS.GAMBLING.GACHA.RARITY_COLORS[oddity.Rarity as keyof typeof Constants.MAGIC_NUMBERS.CMDS.GAMBLING.GACHA.RARITY_COLORS];
            
            const embed = new EmbedBuilder()
                .setTitle(`${rankTitle}${stars} | ${genderEmote} ${oddity.Name}`)
                .setDescription(`${pwrDef}${affStr}${dupeStr}`)
                .setImage(oddity.ImageUrl)
                .setFooter({ text: `Card #${oddity.Id} - Minted for ${message.author.username}` })
                .setColor(embedColor as any);

            return await sent.edit({ embeds: [embed], content: null });
        } catch (error) {
            // Refund the user if it failed
            await this.client.money.add(message.author.id, ROLL_COST, "Refund: Oddity search failed");
            this.client.logger.error("Oddity error", error);
            return await sent.edit("❌ Something went wrong while searching the market. You've been refunded.");
        }
    }
}
