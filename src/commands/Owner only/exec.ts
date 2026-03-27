import { exec } from "child_process";
import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "exec",
    usage: "ls",
    description: "Use with caution",
    preconditions: ["OwnerOnly"],
    typing: true,
})
export default class ExecCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args) {
        const command = await args.rest("string");

        return exec(command, async (e, stdout) => {
            if (e) {
                return message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setAuthor({
                                name: "Command errored",
                                iconURL:
									message.client.user?.displayAvatarURL(),
                            })
                            .setDescription(
                                await KaikiUtil.codeblock(
                                    KaikiUtil.trim(
                                        String(e ?? "Unknown error").replace(new RegExp(this.client.token, "gi"), "[REDACTED_TOKEN]"),
                                        Constants.MAGIC_NUMBERS.CMDS.OWNER_ONLY
                                            .EVAL.MAX_STRING
                                    )
                                )
                            )
                            .withErrorColor(message),
                    ],
                });
            }

            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setAuthor({
                            name: "Executed command",
                            iconURL: message.client.user?.displayAvatarURL(),
                        })
                        .setDescription(
                            await KaikiUtil.codeblock(
                                KaikiUtil.trim(
                                    String(stdout ?? "Command executed").replace(new RegExp(this.client.token, "gi"), "[REDACTED_TOKEN]"),
                                    Constants.MAGIC_NUMBERS.CMDS.OWNER_ONLY.EVAL
                                        .MAX_STRING
                                )
                            )
                        )
                        .withOkColor(message),
                ],
            });
        });
    }
}
