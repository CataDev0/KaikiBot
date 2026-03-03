import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ButtonInteraction } from "discord.js";
import { Command } from "@sapphire/framework";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import SnakesAndLaddersGame from "../../lib/Games/SnakesAndLadders/SnakesAndLaddersGame";

const GAME_TIMEOUT_MS = 60_000;

export default class SnakesAndLaddersCommand extends KaikiCommand {
    constructor(context: Command.LoaderContext) {
        super(context, {
            name: "snakesandladders",
            aliases: ["sal", "snl"],
            description: "Play a game of Snakes and Ladders with another user!",
            usage: "snakesandladders @opponent",
            minorCategory: "Games",
        });
    }

    async messageRun(message: Message<true>) {
        const opponent = message.mentions.users.first();

        if (!opponent || opponent.bot || opponent.id === message.author.id) {
            return message.channel.send("❌ Please mention a valid user to play against. Usage: `snakesandladders @opponent`");
        }

        // Invite prompt
        const inviteEmbed = new EmbedBuilder()
            .setTitle("🎲 Snakes and Ladders")
            .setDescription(`${opponent}, you have been challenged by ${message.author} to a game of **Snakes and Ladders**!\nDo you accept?`)
            .setColor("Yellow");

        const inviteRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId("sal_accept").setLabel("Accept").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("sal_decline").setLabel("Decline").setStyle(ButtonStyle.Danger),
        );

        const inviteMsg = await message.channel.send({ embeds: [inviteEmbed], components: [inviteRow] });

        let inviteInteraction: ButtonInteraction;
        try {
            inviteInteraction = await inviteMsg.awaitMessageComponent({
                componentType: ComponentType.Button,
                filter: i => i.user.id === opponent.id,
                time: 30_000,
            });
        } catch {
            await inviteMsg.edit({ embeds: [inviteEmbed.setDescription("❌ Challenge timed out.").setColor("Red")], components: [] });
            return;
        }

        if (inviteInteraction.customId === "sal_decline") {
            await inviteInteraction.update({ embeds: [inviteEmbed.setDescription(`❌ ${opponent.username} declined the challenge.`).setColor("Red")], components: [] });
            return;
        }

        await inviteInteraction.update({ components: [] });

        // Start game
        const game = new SnakesAndLaddersGame([
            { id: message.author.id, username: message.author.username },
            { id: opponent.id, username: opponent.username },
        ]);

        const buildEmbed = (description?: string) => {
            const board = game.buildBoard();
            const standings = game.players.map(p => `**${p.username}**: Square ${p.position}`).join("\n");
            return new EmbedBuilder()
                .setTitle("🎲 Snakes and Ladders")
                .setDescription(description ?? "")
                .addFields(
                    { name: "📊 Positions", value: standings },
                    { name: "🗺️ Board", value: `\`\`\`\n${board}\n\`\`\`` },
                )
                .setColor("Blue")
                .setFooter({ text: "🐍 Snakes: 17→7, 54→34, 62→19, 64→60, 87→24, 93→73, 95→75, 99→78 | 🪜 Ladders: 1→38, 4→14, 9→31, 20→38, 28→84, 40→59, 51→67, 63→81, 71→91" });
        };

        const rollRow = () =>
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder().setCustomId("sal_roll").setLabel("🎲 Roll Dice").setStyle(ButtonStyle.Primary),
            );

        const gameMsg = await message.channel.send({
            embeds: [buildEmbed(`It's **${game.currentPlayer.username}**'s turn! Roll the dice.`)],
            components: [rollRow()],
        });

        const collector = gameMsg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: GAME_TIMEOUT_MS,
        });

        collector.on("collect", async (i: ButtonInteraction) => {
            if (i.user.id !== game.currentPlayer.id) {
                await i.reply({ content: "⏳ It's not your turn!", ephemeral: true });
                return;
            }

            const { roll, event, winner } = game.takeTurn();
            const playerName = winner ? winner.username : game.players.find(p => p.id === i.user.id)!.username;

            let description = `**${playerName}** rolled a **${roll}**!`;
            if (event) description += `\n${event}`;

            if (winner) {
                collector.stop("winner");
                await i.update({
                    embeds: [buildEmbed(`${description}\n\n🏆 **${winner.username} wins!**`).setColor("Gold")],
                    components: [],
                });
                return;
            }

            description += `\n\nIt's **${game.currentPlayer.username}**'s turn!`;
            await i.update({
                embeds: [buildEmbed(description)],
                components: [rollRow()],
            });

            collector.resetTimer();
        });

        collector.on("end", async (_, reason) => {
            if (reason !== "winner") {
                await gameMsg.edit({
                    embeds: [buildEmbed("⌛ Game timed out due to inactivity.").setColor("Grey")],
                    components: [],
                });
            }
        });
    }
}