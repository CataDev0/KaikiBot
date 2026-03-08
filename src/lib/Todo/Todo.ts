import { Todos } from "@prisma/client";
import Constants from "../../struct/Constants";
import KaikiUtil from "../KaikiUtil";
import {
    APIUser,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    Message,
    ModalSubmitInteraction,
    User,
    InteractionResponse,
    MessageReaction,
} from "discord.js";
import { ButtonAdd } from "./Buttons/Add";
import { ButtonRemove } from "./Buttons/Remove";

export class Todo {
    public static reminderArray(todoArray: Todos[]) {
        return todoArray.map(
            (todo, i) =>
                `${i + 1}. ${KaikiUtil.trim(todo.String.split(/\r?\n/).join(" "), Constants.MAGIC_NUMBERS.CMDS.UTILITY.TODO.INPUT_MAX_LENGTH)}`
        );
    }

    public static createButtons() {
        // Create a unique number.
        const currentTime = Math.round(Date.now() * Math.random());

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${currentTime}Add`)
                    .setEmoji("➕")
                    .setStyle(ButtonStyle.Success)
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${currentTime}Remove`)
                    .setEmoji("➖")
                    .setStyle(ButtonStyle.Danger)
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${currentTime}Clear`)
                    .setEmoji("⬛")
                    .setStyle(ButtonStyle.Danger)
            );

        const rowTwo = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${currentTime}Backward`)
                    .setEmoji("⬅")
                    .setStyle(ButtonStyle.Secondary)
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`${currentTime}Forward`)
                    .setEmoji("➡")
                    .setStyle(ButtonStyle.Secondary)
            );

        return { row, rowTwo, currentTime };
    }

    public static handleInitialInteraction(
        sentMsg: Message,
        author: User | APIUser,
        currentTime: number,
        page: number,
        pages: EmbedBuilder[],
        todoArray: Todos[],
        react: () => Promise<MessageReaction>
    ) {
        const buttonIdentityStrings =
			Todo.createButtonIdentityStrings(currentTime);

        const messageComponentCollector =
			sentMsg.createMessageComponentCollector({
			    filter: (i) =>
			        Object.values(buttonIdentityStrings).includes(i.customId) &&
					author.id === i.user.id,
			    time: 120000,
			});

        messageComponentCollector.on(
            "collect",
            async (buttonInteraction: ButtonInteraction) => {
                switch (buttonInteraction.customId) {
                case buttonIdentityStrings.add:
                    messageComponentCollector.stop();
                    await Promise.all([
                        ButtonAdd.add(
                            buttonInteraction,
                            currentTime,
                            todoArray,
                            sentMsg
                        ),
                        react(),
                    ]);
                    break;

                case buttonIdentityStrings.remove:
                    messageComponentCollector.stop();
                    await Promise.all([
                        ButtonRemove.Remove(
                            buttonInteraction,
                            currentTime,
                            todoArray
                        ),
                        react(),
                    ]);
                    break;

                case buttonIdentityStrings.forward:
                    await buttonInteraction.deferUpdate();
                    page = page + 1 < pages.length ? ++page : 0;
                    await updateMsg();
                    break;

                case buttonIdentityStrings.backward:
                    await buttonInteraction.deferUpdate();
                    page = page > 0 ? --page : pages.length - 1;
                    await updateMsg();
                    break;

                case buttonIdentityStrings.clear:
                    await sentMsg.edit({
                        components: [],
                    });
                    messageComponentCollector.stop();
                    break;

                default:
                    break;
                }
            }
        );

        messageComponentCollector.once("end", async () => {
            await sentMsg.edit({
                components: [],
            });
            messageComponentCollector.stop();
        });

        async function updateMsg() {
            await sentMsg.edit({
                embeds: [pages[page]],
            });
        }
    }

    public static async handleFurtherInteractions(
        interaction: ModalSubmitInteraction,
        message: Message | InteractionResponse,
        currentTime: number,
        page: number,
        pages: EmbedBuilder[],
        todoArray: Todos[]
    ) {
        const buttonIdentityStrings =
			Todo.createButtonIdentityStrings(currentTime);

        const messageComponentCollector =
			message.createMessageComponentCollector({
			    filter: (i) =>
			        Object.values(buttonIdentityStrings).includes(i.customId) &&
					interaction.user.id === i.user.id,
			    time: 120000,
			});

        messageComponentCollector.on(
            "collect",
            async (buttonInteraction: ButtonInteraction) => {
                switch (buttonInteraction.customId) {
                case buttonIdentityStrings.add:
                    messageComponentCollector.stop();
                    await ButtonAdd.furtherAdd(
                        buttonInteraction,
                        currentTime,
                        todoArray
                    );
                    break;

                case buttonIdentityStrings.remove:
                    messageComponentCollector.stop();
                    await ButtonRemove.Remove(
                        buttonInteraction,
                        currentTime,
                        todoArray
                    );
                    break;

                case buttonIdentityStrings.forward:
                    await buttonInteraction.deferUpdate();
                    page = page + 1 < pages.length ? ++page : 0;
                    await updateMsg();
                    break;

                case buttonIdentityStrings.backward:
                    await buttonInteraction.deferUpdate();
                    page = page > 0 ? --page : pages.length - 1;
                    await updateMsg();
                    break;

                case buttonIdentityStrings.clear:
                    await interaction.editReply({
                        components: [],
                    });
                    messageComponentCollector.stop();
                    break;

                default:
                    break;
                }
            }
        );

        messageComponentCollector.once("end", async () => {
            await interaction.editReply({
                components: [],
            });
            messageComponentCollector.stop();
        });

        async function updateMsg() {
            await interaction.editReply({
                embeds: [pages[page]],
            });
        }
    }

    static createButtonIdentityStrings(currentTime: number) {
        return {
            add: `${currentTime}Add`,
            remove: `${currentTime}Remove`,
            forward: `${currentTime}Forward`,
            backward: `${currentTime}Backward`,
            clear: `${currentTime}Clear`,
        };
    }
}
