import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "duel",
    description: "Challenge another user to an Oddity duel with an optional wager!",
    usage: ["@user <Your Card ID> [Wager]"],
    preconditions: ["GuildOnly"],
    minorCategory: "Oddities"
})
export default class DuelCommand extends KaikiCommand {
    public async messageRun(message: Message<true>, args: Args): Promise<Message> {
        const targetMember = await args.pick("member").catch(() => null);
        const myCardId = await args.pick("number").catch(() => null);
        const wagerStr = await args.pick("integer").catch(() => 0);
        
        const wager = Math.min(Math.max(wagerStr, 0), 1000000000); // cap max wager

        if (!targetMember || !myCardId) {
            return message.reply("You must specify a user to duel and your Card ID! Example: `duel @user 123 500`");
        }

        if (targetMember.user.bot) {
            return message.reply("You cannot duel a bot! Use the `dungeon` command for PvE.");
        }

        if (targetMember.id === message.author.id) {
            return message.reply("You cannot duel yourself.");
        }

        const myCard = await this.client.orm.oddities.findFirst({
            where: { Id: myCardId, UserId: BigInt(message.author.id) }
        });

        if (!myCard) {
            return message.reply("You do not own an Oddity with that ID!");
        }

        if (wager > 0) {
            const hasEnough = await this.client.money.get(message.author.id) >= BigInt(wager);
            if (!hasEnough) {
                return message.reply(`You do not have enough money to wager **${wager}**!`);
            }
            
            const oppHasEnough = await this.client.money.get(targetMember.id) >= BigInt(wager);
            if (!oppHasEnough) {
                return message.reply(`**${targetMember.user.username}** does not have enough money to match your wager of **${wager}**!`);
            }
        }

        const wagerText = wager > 0 ? `\n💰 **Wager: ${wager} ${this.client.money.currencySymbol}**` : "";
        await message.channel.send(`⚔️ <@${targetMember.id}>! **${message.author.username}** has challenged you to an Oddity duel!${wagerText}\nThey have locked in **${myCard.Name}** (⭐${myCard.Rarity}).\n\nTo accept, type the **ID** of the Oddity you want to use within 60 seconds!`);

        try {
            const collected = await message.channel.awaitMessages({
                filter: (m) => m.author.id === targetMember.id && !isNaN(parseInt(m.content.trim())),
                max: 1,
                time: 60000,
                errors: ["time"]
            });

            const reply = collected.first();
            if (!reply) throw new Error("Timeout");

            const opponentCardId = parseInt(reply.content.trim());
            
            const opponentCard = await this.client.orm.oddities.findFirst({
                where: { Id: opponentCardId, UserId: BigInt(targetMember.id) }
            });

            if (!opponentCard) {
                return message.channel.send(`<@${targetMember.id}>, you do not own an Oddity with ID ${opponentCardId}! Duel cancelled.`);
            }

            const battleResult = this.client.battleService!.simulateDuel(
                BigInt(message.author.id), myCard,
                BigInt(targetMember.id), opponentCard
            );

            const winnerUser = battleResult.winner === BigInt(message.author.id) ? message.author : targetMember.user;
            const loserUser = battleResult.winner === BigInt(message.author.id) ? targetMember.user : message.author;

            const logString = battleResult.log.join("\n");

            const embed = new EmbedBuilder()
                .setTitle(`⚔️ Duel: ${message.author.username} VS ${targetMember.user.username} ⚔️`)
                .setDescription(`${logString}\n\n🏆 **WINNER:** <@${winnerUser.id}>! 🏆`)
                .setColor("#ff0000");

            // Wager payouts
            if (wager > 0) {
                await this.client.money.tryTake(loserUser.id, BigInt(wager), "Lost Oddity Duel Wager");
                await this.client.money.add(winnerUser.id, BigInt(wager), "Won Oddity Duel Wager");
            }

            const winStr = wager > 0 ? `Congratulations <@${winnerUser.id}>! You won the wager of ${wager} ${this.client.money.currencyName}.` : `Congratulations <@${winnerUser.id}>!`;
            return message.channel.send({ embeds: [embed], content: winStr });

        } catch {
            return message.channel.send(`The duel challenge to <@${targetMember.id}> expired or was invalid.`);
        }
    }
}
