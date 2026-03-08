import { Todos } from "@prisma/client";
import {
    ButtonInteraction,
    EmbedBuilder,
    LabelBuilder,
    Message,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js";
import Constants from "../../../struct/Constants";
import { Todo } from "../Todo";

export class ButtonAdd {
    private static todoModal = (currentTime: number) =>
        new ModalBuilder()
            .setTitle("Add a TODO item")
            .setCustomId(`${currentTime}AddModal`)
            .addLabelComponents(
                new LabelBuilder()
                    .setLabel("TODO")
                    .setTextInputComponent(
                        new TextInputBuilder()
                            .setStyle(TextInputStyle.Paragraph)
                            .setMaxLength(
                                Constants.MAGIC_NUMBERS.CMDS.UTILITY.TODO
                                    .INPUT_MAX_LENGTH
                            )
                            .setMinLength(2)
                            .setCustomId(`${currentTime}text1`)
                            .setRequired()
                    )
            );

    static Embed = (message?: Message) =>
        new EmbedBuilder()
            .setTitle("Todo")
            .setThumbnail(
                "https://cdn.discordapp.com/attachments/717045690022363229/726600392107884646/3391ce4715f3c814d6067911438e5bf7.png"
            )
            .withOkColor(message);

    static async add(
        buttonInteraction: ButtonInteraction,
        currentTime: number,
        todoArray: Todos[],
        sentMsg: Message
    ) {
        await buttonInteraction.showModal(this.todoModal(currentTime));

        const interaction = await buttonInteraction.awaitModalSubmit({
            time: 120000,
            filter: (i) => i.customId === `${currentTime}AddModal`,
        });

        const uId = BigInt(interaction.user.id);

        const entry = await buttonInteraction.client.orm.todos.create({
            data: {
                // Get input from modal
                String: interaction.fields
                    .getTextInputValue(`${currentTime}text1`)
                    .trim(),
                DiscordUsers: {
                    connectOrCreate: {
                        create: {
                            UserId: uId,
                        },
                        where: {
                            UserId: uId,
                        },
                    },
                },
            },
        });

        if (!interaction.deferred)
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // Make sure our local copy is up-to-date
        todoArray.push({
            String: entry.String,
            UserId: entry.UserId,
            Id: entry.Id,
        });

        const reminderArray = Todo.reminderArray(todoArray);
        const pages: EmbedBuilder[] = [];

        for (
            let index = 10, p = 0;
            p < reminderArray.length;
            index += 10, p += 10
        ) {
            pages.push(
                new EmbedBuilder(ButtonAdd.Embed(sentMsg).data).setDescription(
                    reminderArray.slice(p, index).join("\n")
                )
            );
        }

        const { row, rowTwo, currentTime: newTime } = Todo.createButtons();

        const [message] = await Promise.all([
            interaction.editReply({
                content: `Added entry \`${todoArray.length}\`.`,
                embeds: [pages.at(-1) || pages[0]],
                // Only show arrows if necessary
                components: todoArray.length > 10 ? [row, rowTwo] : [row],
            }),
            sentMsg.delete(),
        ]);

        // Handle interaction, after message was sent
        await Todo.handleFurtherInteractions(
            interaction,
            message,
            newTime,
            pages.length - 1,
            pages,
            todoArray
        );
    }

    public static async furtherAdd(
        buttonInteraction: ButtonInteraction,
        currentTime: number,
        todoArray: Todos[]
    ) {
        {
            await buttonInteraction.showModal(this.todoModal(currentTime));

            const interaction = await buttonInteraction.awaitModalSubmit({
                time: 120000,
                filter: (i) => i.customId === `${currentTime}AddModal`,
            });

            if (!interaction.deferred)
                await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const uId = BigInt(interaction.user.id);

            const entry = await buttonInteraction.client.orm.todos.create({
                data: {
                    // Get input from modal
                    String: interaction.fields
                        .getTextInputValue(`${currentTime}text1`)
                        .trim(),
                    DiscordUsers: {
                        connectOrCreate: {
                            create: {
                                UserId: uId,
                            },
                            where: {
                                UserId: uId,
                            },
                        },
                    },
                },
            });

            // Make sure our local copy is up-to-date
            todoArray.push({
                String: entry.String,
                UserId: entry.UserId,
                Id: entry.Id,
            });

            const reminderArray = Todo.reminderArray(todoArray);
            const pages: EmbedBuilder[] = [];

            for (
                let index = 10, p = 0;
                p < reminderArray.length;
                index += 10, p += 10
            ) {
                pages.push(
                    new EmbedBuilder(ButtonAdd.Embed().data).setDescription(
                        reminderArray.slice(p, index).join("\n")
                    )
                );
            }

            // Create new rows of buttons with a new unique time
            const { row, rowTwo, currentTime: newTime } = Todo.createButtons();

            const message = await interaction.editReply({
                content: `Added entry \`${todoArray.length}\`.`,
                embeds: [pages.at(-1) || pages[0]],
                // Only show arrows if necessary
                components: todoArray.length > 10 ? [row, rowTwo] : [row],
            });

            await Todo.handleFurtherInteractions(
                interaction,
                message,
                newTime,
                pages.length - 1,
                pages,
                todoArray
            );
        }
    }
}
