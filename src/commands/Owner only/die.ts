import process from "process";
import { ApplyOptions } from "@sapphire/decorators";
import {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder, GuildMember,
    InteractionCollector,
    Message,
    Snowflake,
} from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { Args } from "@sapphire/framework";
import fs from "fs/promises";
import { GuildMemberCache } from "../../lib/Cache/KaikiCache";

@ApplyOptions<KaikiCommandOptions>({
    name: "die",
    aliases: ["shutdown", "kill"],
    usage: "",
    description: "Shuts down bot.",
    preconditions: ["OwnerOnly"],
    flags: ["y", "yes"],
})
export default class KillBotProcess extends KaikiCommand {
    public async messageRun(message: Message, args: Args) {
        if (args.getFlags("y", "yes")) {
            return this.shutdown(message);
        }

        const deleteMsg = await message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setDescription("Do you *really* want to shut me down?")
                    .withOkColor(message),
            ],
            isInteraction: true,
            components: [
                new ActionRowBuilder<ButtonBuilder>({
                    components: [
                        new ButtonBuilder()
                            .setCustomId("1")
                            .setLabel("Click to kill")
                            .setStyle(4),
                    ],
                }),
            ],
        });

        const buttonListener = new InteractionCollector(message.client, {
            message: deleteMsg,
            time: 20000,
            filter: (m) => m.user.id === message.author.id,
        });

        buttonListener.once("collect", async (mci) => {
            if (mci.isButton()) {
                await mci.reply({
                    ephemeral: true,
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: "Dying",
                                iconURL:
									message.client.user?.displayAvatarURL(),
                            })
                            .addFields([
                                {
                                    name: "Shutting down",
                                    value: "See you later",
                                    inline: false,
                                },
                            ])
                            .withOkColor(message),
                    ],
                });
            }

            await deleteMsg
                .delete()
                .then(async () => await this.shutdown(message));
        });

        buttonListener.once("end", async () => {
            await deleteMsg.delete();
            await message.delete();
        });
    }

    private async shutdown(message: Message): Promise<void> {

        const guildMemberCache: GuildMemberCache = {};

        for (const [, v] of message.client.guilds.cache) {
            guildMemberCache[v.id] = v.members.cache
        }

        await Promise.all([
            message.react("✅"),
            fs.writeFile(`./members-${Date.now()}.cache`, JSON.stringify(guildMemberCache))
        ]);

        this.container.logger.warn("Shutting down");
        // Disconnects the client connection
        this.client.destroy().then(() => process.exit(0));
        // Exits process with SIGINT
    }
}
