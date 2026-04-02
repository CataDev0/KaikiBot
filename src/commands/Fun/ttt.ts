import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ComponentType,
    EmbedBuilder,
    Message,
} from "discord.js";

import TicTacToe from "../../lib/Games/TTT";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiEmbeds from "../../lib/Kaiki/KaikiEmbeds";

@ApplyOptions<KaikiCommandOptions>({
    name: "tictactoe",
    aliases: ["ttt"],
    description:
		"Starts a TicTacToe game, where you play against an @mentioned person.",
    usage: ["@Dreb"],
    preconditions: ["GuildOnly"],
    minorCategory: "Games"
})
export default class TicTacToeCommand extends KaikiCommand {
    public async messageRun(message: Message<true>, args: Args) {
        const playerTwo = await args.rest("member");

        if (!message.member) return;

        if (playerTwo.id === message.member.id || playerTwo.user.bot) {
            return message.reply({
                embeds: [
                    await KaikiEmbeds.errorMessage(
                        message,
                        "You can't play against yourself or a bot!"
                    ),
                ],
            });
        }

        const acceptMessage = await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        `Do you wanna participate in a game of Tic-Tac-Toe against ${message.author.username}?`
                    )
                    .setFooter({ text: "Timeout in 20 seconds" })
                    .withOkColor(message),
            ],
            isInteraction: true,
            components: [
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder()
                            .setCustomId("1")
                            .setLabel("Yes")
                            .setStyle(1),
                        new ButtonBuilder()
                            .setCustomId("2")
                            .setLabel("No")
                            .setStyle(4),
                    ],
                }),
            ],
        });

        const interaction = await acceptMessage
            .awaitMessageComponent({
                filter: (m) => {
                    m.deferUpdate();
                    return m.user.id === playerTwo.id;
                },
                componentType: ComponentType.Button,
                time: 20000,
            }).catch(() => {
                const emb = acceptMessage.embeds[0];
                acceptMessage.edit({
                    embeds: [
                        EmbedBuilder.from(emb)
                            .setDescription(`~~${emb.description}~~`)
                            .setFooter({ text: "Timed out!" })
                            .withErrorColor(message),
                    ],
                    components: [],
                });
            });

        if (interaction && interaction.customId === "1") {

            new TicTacToe(message.member,
                playerTwo,
                message
            );
            await acceptMessage.delete();
        } else {
            await Promise.all([
                message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                `${playerTwo.user.username} has declined your Tic-Tac-Toe challenge`
                            )
                            .withErrorColor(message),
                    ],
                }),
                acceptMessage.delete(),
            ]);
        }
    }
}
