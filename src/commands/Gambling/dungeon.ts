import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { Oddities } from "@prisma/client";

@ApplyOptions<KaikiCommandOptions>({
    name: "dungeon",
    description: "Enter the Oddity Dungeon and risk your Yen to fight powerful Bosses for huge payouts!",
    usage: ["<Your Card ID> <Floor: 1, 2, or 3>"],
    preconditions: ["GuildOnly"],
    minorCategory: "Oddities"
})
export default class DungeonCommand extends KaikiCommand {
    public async messageRun(message: Message<true>, args: Args): Promise<Message> {
        const myCardId = await args.pick("number").catch(() => null);
        const floorStr = await args.pick("number").catch(() => null);

        if (!myCardId || !floorStr || ![1,2,3].includes(floorStr)) {
            return message.reply("You must specify your Card ID and the Dungeon Floor! Example: `dungeon 123 1`\n\n🏰 **Dungeon Floors:**\n`Floor 1`: 100 Entry Fee (Win 300)\n`Floor 2`: 300 Entry Fee (Win 900)\n`Floor 3`: 1000 Entry Fee (Win 3000 & Steal the Boss Card!)");
        }
        
        let entryFee = 0;
        let reward = 0;
        let bossRarity = 1;
        let diffMultiplier = 1.0;

        if (floorStr === 1) {
            entryFee = 100;
            reward = 300;
            bossRarity = 2; // Uncommon Boss
            diffMultiplier = 1.1; 
        } else if (floorStr === 2) {
            entryFee = 300;
            reward = 900;
            bossRarity = 4; // Epic Boss
            diffMultiplier = 1.35; 
        } else if (floorStr === 3) {
            entryFee = 1000;
            reward = 3000;
            bossRarity = 5; // Mythic Boss
            diffMultiplier = 1.8; // 80% stats boost! Good Luck!
        }
        
        const hasEnough = await this.client.money.tryTake(message.author.id, BigInt(entryFee), `Dungeon Floor ${floorStr} Entry Fee`);
        if (!hasEnough) {
            return message.reply(`You do not have enough money to enter Floor ${floorStr}! You need **${entryFee} ${this.client.money.currencySymbol}**.`);
        }

        const myCard = await this.client.orm.oddities.findFirst({
            where: { Id: myCardId, UserId: BigInt(message.author.id) }
        });

        if (!myCard) {
            await this.client.money.add(message.author.id, BigInt(entryFee), "Refund: Dungeon Card ID invalid");
            return message.reply("You do not own an Oddity with that ID! Your entry fee was refunded.");
        }
        
        const sent = await message.reply(`🏰 Paying **${entryFee} ${this.client.money.currencySymbol}** to enter **Floor ${floorStr}**...`);
        
        // Generate the Boss via GachaService
        const bossWrapper = await this.client.gachaService.rollOddity(BigInt(this.client.user!.id), "random");
        
        // Wait, GachaService rollOddity saves it to the DB physically with rolling randomness, which is fine, 
        // we can let the bot own it in the database and simply boost it in memory for the fight!
        // We will mock the boss stats for this specific instance.
        
        // Force the boss to have the targeted floor rarity stats for the fight:
        const powerBase = Math.floor(Math.random() * 100 * bossRarity) + (50 * bossRarity);
        const defenseBase = Math.floor(Math.random() * 100 * bossRarity) + (40 * bossRarity);
        
        const bossName = `Floor ${floorStr} Boss: ${bossWrapper.Name}`;
        
        const bossCardParams: Oddities = {
            ...bossWrapper,
            Name: bossName,
            Rarity: bossRarity,
            Power: Math.floor(powerBase * diffMultiplier),
            Defense: Math.floor(defenseBase * diffMultiplier),
        };

        const battleResult = this.client.battleService!.simulateDuel(
            BigInt(message.author.id), myCard,
            BigInt(this.client.user!.id), bossCardParams
        );

        const challengerWon = battleResult.winner === BigInt(message.author.id);

        const logString = battleResult.log.join("\n");

        const embed = new EmbedBuilder()
            .setTitle(`🏰 Dungeon Floor ${floorStr}: ${message.author.username} VS The Boss 🏰`)
            .setDescription(`${logString}\n\n${challengerWon ? "🏆 **CHALLENGER CLEARED THE FLOOR!** 🏆" : "☠️ **THE BOSS WON!** ☠️"}`)
            .setColor(challengerWon ? "#00ff00" : "#ff0000")
            .setImage(bossCardParams.ImageUrl);

        if (challengerWon) {
            let winText = `Congratulations <@${message.author.id}>! You conquered Floor ${floorStr} and earned **${reward} ${this.client.money.currencyName}**!`;
            await this.client.money.add(message.author.id, BigInt(reward), `Cleared Dungeon Floor ${floorStr}`);
            
            // Floor 3 Reward -> Transfer ownership of the Bot's card!
            if (floorStr === 3) {
                // Actually upgrade the card's rarity and pass it in the DB to the player permanently
                await this.client.orm.oddities.update({
                    where: { Id: bossWrapper.Id },
                    data: { UserId: BigInt(message.author.id), Rarity: 5, Power: bossCardParams.Power, Defense: bossCardParams.Defense }
                });
                winText += "\n\n🎁 **MYTHIC REWARD!** You captured the Floor 3 Boss! It has been added to your inventory!";
            }
            return sent.edit({ embeds: [embed], content: winText });
        } else {
            // Delete the boss from db so the bot doesn't accumulate 10,000 junks
            await this.client.orm.oddities.delete({ where: { Id: bossWrapper.Id } }).catch(() => null);
            return sent.edit({ embeds: [embed], content: `☠️ You were defeated on Floor ${floorStr}. Your entry fee was lost to the dungeon.` });
        }
    }
}
