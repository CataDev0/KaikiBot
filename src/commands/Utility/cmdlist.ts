import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import {
    ActionRowBuilder,
    Collection,
    ComponentType,
    EmbedBuilder,
    Message,
    SelectMenuBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
} from "discord.js";
import images from "../../data/images.json";
import ArgumentError from "../../lib/Errors/ArgumentError";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "commands",
    aliases: ["cmds", "cmdlist"],
    description: "Shows categories, or commands if provided with a category.",
    usage: ["", "admin"],
})
export default class CommandsList extends KaikiCommand {
    static ignoredCategories = ["default", "Etc"];

    public async messageRun(message: Message, args: Args) {
        const filteredCategories = this.store.categories.filter(
            (cat) => !CommandsList.ignoredCategories.includes(cat)
        );

        if (args.finished) {
            const timestamp = Date.now().toString();

            const component =
				new ActionRowBuilder<SelectMenuBuilder>().setComponents(
				    new StringSelectMenuBuilder()
				        .setCustomId(timestamp)
				        .setOptions(
				            filteredCategories.sort().map(
				                (cat) =>
				                    new StringSelectMenuOptionBuilder({
				                        value: cat,
				                        label: cat,
				                        description: cat,
				                    })
				            )
				        )
				);

            const embed = await this.categoriesEmbed(
                message,
                await this.client.fetchPrefix(message)
            );

            // Add every category as embed fields
            for (const cat of filteredCategories) {
                embed.addFields([
                    {
                        name: `${cat} [${this.store.filter((cmd) => cmd.category === cat).size}]`,
                        value: `${Constants.categories[cat] || "N/A"}`,
                        inline: true,
                    },
                ]);
            }

            const interactionMessage = await message.reply({
                embeds: [embed],
                components: [component],
            });

            return this.handleComponentReply(
                interactionMessage,
                message.author.id,
                timestamp,
                embed
            );
        }

        const category = await args.pick("category");

        // Return commands in the provided category
        if (category) {
            return this.categoryReply(message, category);
        }
    }

    private mapCommands = (commands: Collection<string, KaikiCommand>) =>
        commands
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((cmd) => {
                const arr = Array.from(cmd.aliases).filter(Boolean);
                arr.unshift(cmd.name);

                return arr.length === 1
                    ? `[\`${arr.join()}\`]`
                    : `[\`${arr
                        .sort(
                            (a, b) =>
                                b.length - a.length || a.localeCompare(b)
                        )
                        .join("`, `")}\`]`;
            })
            .join("\n");

    private categoryReply(message: Message, category: string) {
        const cmds = this.store.filter(
            (c) => c.category === category
        ) as  unknown as Collection<string, KaikiCommand>;

        const emb = new EmbedBuilder()
            .setTitle(`Commands in ${category}`)
            .setDescription(
                this.mapCommands(
                    cmds.filter((cmd) => cmd.minorCategory === undefined)
                ) || "Empty"
            )
            .withOkColor(message);

        const filtered = cmds.filter((cmd) => cmd.minorCategory !== undefined);

        [...new Set(filtered.map((value) => value.minorCategory))].forEach(
            (cmd) => {
                if (!cmd) return;

                emb.addFields([
                    {
                        name: cmd,
                        value:
							this.mapCommands(
							    filtered
							        .filter((c) => c.minorCategory === cmd)
							        .sort()
							) || "Empty",
                        inline: true,
                    },
                ]);
            }
        );

        return message.reply({
            embeds: [emb],
        });
    }

    private categoriesEmbed = async (
        message: Message,
        prefix: string,
        { name, version, repository } = this.client.package
    ) =>
        new EmbedBuilder({
            title: "Command categories",
            description: `\`${prefix}cmds <category>\` returns all commands in the category.`,
            author: {
                name: `${name} v${version}`,
                url: repository.url,
                iconURL: message.author.displayAvatarURL(),
            },
            thumbnail: {
                url: images.utility.commands.notebook,
            },
        }).withOkColor(message);

    private async handleComponentReply(
        message: Message,
        userId: string,
        timestamp: string,
        emb: EmbedBuilder
    ) {
        const promise = await message
            .awaitMessageComponent({
                time: 60000,
                componentType: ComponentType.StringSelect,
                filter: (i) => {
                    i.deferUpdate();
                    return i.customId === timestamp && i.user.id === userId;
                },
            })
            .catch(async () => {
                await message.edit({
                    components: [],
                });
            });

        if (promise) {
            const category = this.store.categories.find(
                (c) => c === promise.values[0]
            );

            if (!category)
                throw new ArgumentError("Provided category couldn't be found!");

            const cmds = this.store.filter(
                (c) => c.category === category
            ) as  unknown as Collection<string, KaikiCommand>;

            const filtered = cmds.filter(
                (cmd) => cmd.minorCategory !== undefined
            );

            emb.setTitle(category).setDescription(
                this.mapCommands(
                    cmds.filter((cmd) => cmd.minorCategory === undefined)
                ) || "Empty"
            );

            emb.setFields([]);

            [
                ...new Set(
                    filtered.map((value: KaikiCommand) => value.minorCategory)
                ),
            ].forEach((cmd) => {
                if (!cmd) return;

                emb.addFields([
                    {
                        name: cmd,
                        value:
							this.mapCommands(
							    filtered
							        .filter(
							            (c: KaikiCommand) =>
							                c.minorCategory === cmd
							        )
							        .sort()
							) || "Empty",
                        inline: true,
                    },
                ]);
            });

            await message.edit({
                embeds: [emb],
                components: [],
            });
        }
    }
}
