import { exec } from "child_process";
import * as process from "process";
import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { Message, AttachmentBuilder } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "neofetch",
    aliases: ["neo", "fastfetch"],
    description:
		"Displays neofetch/fastfetch ascii art. Provide argument '--list' to get a list of all supported distros.",
    usage: ["", "opensuse", "--list"],
    cooldownDelay: 2000,
    typing: true,
    flags: ["list"],
})
export default class NeofetchCommand extends KaikiCommand {

    public static usingFastFetch = true;

    private static neofetchArgument = Args.make<string>((parameter) => {
        const sanitized = parameter.toLowerCase().replace(/[^a-z0-9_.-]/g, "");
        if (!sanitized) {
            return Args.ok("");
        }
        return Args.ok(sanitized);
    });

    public async messageRun(message: Message, args: Args) {
        const list = args.getFlags("list");

        const os = await args
            .rest(NeofetchCommand.neofetchArgument)
            .catch(() => undefined);

        if (list) {
            if (!NeofetchCommand.usingFastFetch) {
                return message.reply({
                    content: "Listing supported distros is only natively supported with fastfetch. Neofetch does not have a built-in list command."
                });
            }

            const listCmd = "fastfetch --list-logos | sed 's/\x1B\\[[0-9;?]*[a-zA-Z]//g'";

            exec(listCmd, async (error, stdout, stderr) => {
                if (error || stderr) {
                    this.container.logger.error(error);
                }

                const cleanStdout = stdout.replace(Constants.NeoFetchRegExp, "").trim() || "No logos found or error occurred.";

                const attachment = new AttachmentBuilder(Buffer.from(cleanStdout), { name: "logos.txt" });

                return message.reply({
                    content: "Here is the list of available ascii distros in fastfetch:",
                    files: [attachment]
                });
            });
        } else {
            const { platform } = process;

            let cmd = `neofetch -L --ascii_distro ${os} | sed 's/\x1B\\[[0-9;?]*[a-zA-Z]//g'`;

            if (!os && platform !== "win32") {
                cmd = "neofetch -L | sed 's/\x1B\\[[0-9;\\?]*[a-zA-Z]//g'";
            }

            if (NeofetchCommand.usingFastFetch) {
                cmd = `fastfetch --config external/fastfetch.jsonc ${os ? `-l ${os}` : ""}`;
            }

            exec(cmd, async (error, stdout, stderr) => {
                if (error || stderr) {
                    return this.container.logger.error(error);
                }
                
                const formattedOutput = stdout
                    .replace(/```/g, "\u0300`\u0300`\u0300`\u0300")
                    .replace(Constants.NeoFetchRegExp, "");

                return message.reply(
                    await KaikiUtil.codeblock("\u00AD" + formattedOutput)
                );
            });
        }
    }
}
