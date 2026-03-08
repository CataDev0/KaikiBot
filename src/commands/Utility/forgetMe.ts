import { ApplyOptions } from "@sapphire/decorators";
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder,
    Message,
} from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "forgetme",
    usage: "",
    description: "Deletes all information about you in the database",
})
export default class ForgetMeCommand extends KaikiCommand {
    public async messageRun(message: Message): Promise<void> {
        const deleteMsg = await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        "Are you *sure* you want to delete all your entries in the database?"
                    )
                    .withOkColor(message),
            ],
            components: [
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder()
                            .setCustomId("forget_confirm")
                            .setLabel("Yes")
                            .setEmoji("⚠️")
                            .setStyle(ButtonStyle.Danger),
                        new ButtonBuilder()
                            .setCustomId("forget_cancel")
                            .setLabel("No")
                            .setEmoji("❌")
                            .setStyle(ButtonStyle.Secondary),
                    ],
                }),
            ],
        });

        try {
            const i = await deleteMsg.awaitMessageComponent({
                filter: (m) => m.user.id === message.author.id,
                time: 20000,
                componentType: ComponentType.Button,
            });

            if (i.customId === "forget_confirm") {
                try {
                    const user = await this.client.orm.discordUsers.findUnique({
                        where: {
                            UserId: BigInt(message.author.id),
                        },
                        select: {
                            Amount: true,
                            _count: {
                                select: {
                                    Todos: true,
                                    GuildUsers: true,
                                },
                            },
                        },
                    });

                    if (!user) {
                        throw new Error("User not found");
                    }

                    await this.client.orm.discordUsers.delete({
                        where: {
                            UserId: BigInt(message.author.id),
                        },
                    });

                    await i.update({
                        components: [],
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("Deleted data")
                                .setDescription(
                                    "All data stored about you has been deleted!"
                                )
                                .addFields([
                                    {
                                        name: "Cleared user-data",
                                        value: `${
                                            user._count.Todos +
                                            user._count.GuildUsers
                                        } entries deleted`,
                                    },
                                    {
                                        name: "Cleared money-data",
                                        value: `${user.Amount} currency deleted`,
                                    },
                                ])
                                .withOkColor(message),
                        ],
                    });
                } catch {
                    await i.update({
                        components: [],
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    "No data found in the database to delete."
                                )
                                .withErrorColor(message),
                        ],
                    });
                }
            } else {
                await i.update({
                    components: [],
                    embeds: [
                        new EmbedBuilder()
                            .setDescription("Deletion cancelled.")
                            .withOkColor(message),
                    ],
                });
            }
        } catch {
            await deleteMsg.delete();
        }
    }
}
