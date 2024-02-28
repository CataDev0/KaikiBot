import { Todos } from "@prisma/client";
import {
    ActionRowBuilder,
    ButtonInteraction,
    EmbedBuilder,
    Message,
    ModalActionRowComponentBuilder,
    ModalBuilder,
    TextInputBuilder,
} from "discord.js";
import Constants from "../../../struct/Constants";
import { Todo } from "../Todo";

export class ButtonAdd {
    private static todoModal = (currentTime: number) =>
        new ModalBuilder()
            .setTitle("Add a TODO item")
            .setCustomId(`${currentTime}AddModal`)
            .addComponents(
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                    new TextInputBuilder()
                        .setStyle(2)
                        .setMaxLength(
                            Constants.MAGIC_NUMBERS.CMDS.UTILITY.TODO
                                .INPUT_MAX_LENGTH
                        )
                        .setMinLength(2)
                        .setLabel("TODO")
                        .setCustomId(`${currentTime}text1`)
                        .setRequired()
                )
            );

    private static Embed = (message: Message) =>
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
            await interaction.deferReply({ ephemeral: true });

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

        const [msg] = await Promise.all([
            interaction.editReply({
                content: `Added entry \`${todoArray.length}\`.`,
                embeds: [pages.at(-1) || pages[0]],
                // Only show arrows if necessary
                components: todoArray.length > 10 ? [row, rowTwo] : [row],
                options: { fetchReply: true },
            }),
            sentMsg.delete(),
        ]);

        if (!buttonInteraction.member) return;

        Todo.handleInteraction(
            msg,
            buttonInteraction.member.user,
            newTime,
            pages.length - 1,
            pages,
            todoArray
        );
    }
}
