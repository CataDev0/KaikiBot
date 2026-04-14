import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ButtonInteraction } from "discord.js";
import { Command } from "@sapphire/framework";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import SnakesAndLaddersGame from "../../lib/Games/SnakesAndLadders/SnakesAndLaddersGame";

const LOBBY_TIMEOUT_MS = 60_000;
const GAME_TIMEOUT_MS = 60_000;

export default class SnakesAndLaddersCommand extends KaikiCommand {
    constructor(context: Command.LoaderContext) {
        super(context, {
            name: "snakesandladders",
            aliases: ["sal", "snl"],
            description: "Play a game of Snakes and Ladders! Other users can join the lobby.",
            usage: "snakesandladders",
            minorCategory: "Games",
        });
    }

    async messageRun(message: Message<true>) {
        const players: { id: string; username: string }[] = [
            { id: message.author.id, username: message.author.username }
        ];

        const buildLobbyEmbed = () => {
            return new EmbedBuilder()
                .setTitle("🎲 Snakes and Ladders Lobby")
                .setDescription(`Host: ${message.author}\n\n**Players Joined (${players.length}/6):**\n${players.map((p, i) => `${["🔴", "🔵", "🟡", "🟢", "🟣", "🟤"][i]} ${p.username}`).join("\n")}`)
                .setColor("Yellow")
                .setFooter({ text: "Game starts automatically in 60 seconds if enough players join!" });
        };

        const lobbyRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId("sal_join").setLabel("Join Game").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("sal_start").setLabel("Start Game").setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId("sal_play_bot").setLabel("Play vs Bot").setStyle(ButtonStyle.Secondary),
        );

        const lobbyMsg = await message.channel.send({ embeds: [buildLobbyEmbed()], components: [lobbyRow] });

        const lobbyCollector = lobbyMsg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: LOBBY_TIMEOUT_MS,
        });

        await new Promise<void>((resolve) => {
            lobbyCollector.on("collect", async (i: ButtonInteraction) => {
                if (i.customId === "sal_join") {
                    if (players.some(p => p.id === i.user.id)) {
                        await i.reply({ content: "You have already joined the game!", ephemeral: true });
                        return;
                    }
                    players.push({ id: i.user.id, username: i.user.username });
                    await i.update({ embeds: [buildLobbyEmbed()] });

                    if (players.length >= 6) {
                        lobbyCollector.stop("max_players");
                    }
                } else if (i.customId === "sal_start") {
                    if (i.user.id !== message.author.id) {
                        await i.reply({ content: "Only the host can start the game early!", ephemeral: true });
                        return;
                    }
                    if (players.length < 2) {
                        await i.reply({ content: "Need at least 2 players to start the game!", ephemeral: true });
                        return;
                    }
                    await i.update({ components: [] });
                    lobbyCollector.stop("host_start");
                } else if (i.customId === "sal_play_bot") {
                    if (i.user.id !== message.author.id) {
                        await i.reply({ content: "Only the host can start a bot game!", ephemeral: true });
                        return;
                    }
                    if (players.length > 1) {
                        await i.reply({ content: "Cannot play against bot when other players have joined!", ephemeral: true });
                        return;
                    }
                    players.push({ id: message.client.user.id, username: message.client.user.username });
                    await i.update({ components: [] });
                    lobbyCollector.stop("play_bot");
                }
            });

            lobbyCollector.on("end", async (_, reason) => {
                if (reason === "time") {
                    if (players.length < 2) {
                        await lobbyMsg.edit({
                            embeds: [new EmbedBuilder().setTitle("🎲 Snakes and Ladders Lobby").setDescription("❌ Game cancelled (not enough players joined).").setColor("Red")],
                            components: [],
                        });
                    } else {
                        await lobbyMsg.edit({ components: [] });
                    }
                }
                resolve();
            });
        });

        if (players.length < 2) return;

        // Start game
        const game = new SnakesAndLaddersGame(players);

        const buildEmbed = (description?: string) => {
            const board = game.buildBoard();
            const standings = game.players.map((p, i) => `${game.PLAYER_SYMBOLS[i] ?? "⚪"} **${p.username}**: Square ${p.position}`).join("\n");
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

        const executeTurn = async (i?: ButtonInteraction) => {
            const current = game.currentPlayer;
            const { roll, event, winner } = game.takeTurn();
            const playerName = winner ? winner.username : current.username;

            let description = `**${playerName}** rolled a **${roll}**!`;
            if (event) description += `\n${event}`;

            if (winner) {
                collector.stop("winner");
                const payload = {
                    embeds: [buildEmbed(`${description}\n\n🏆 **${winner.username} wins!**`).setColor("Gold")],
                    components: [],
                };
                if (i) await i.update(payload);
                else await gameMsg.edit(payload);
                return;
            }

            description += `\n\nIt's **${game.currentPlayer.username}**'s turn!`;
            const isBotTurn = game.currentPlayer.id === message.client.user.id;

            const payload = {
                embeds: [buildEmbed(description)],
                components: isBotTurn ? [] : [rollRow()],
            };

            if (i) await i.update(payload);
            else await gameMsg.edit(payload);

            if (isBotTurn) {
                setTimeout(() => {
                    if (!collector.ended) executeTurn();
                }, 2000);
            } else {
                collector.resetTimer();
            }
        };

        collector.on("collect", async (i: ButtonInteraction) => {
            if (i.user.id !== game.currentPlayer.id) {
                await i.reply({ content: "⏳ It's not your turn!", ephemeral: true });
                return;
            }
            await executeTurn(i);
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