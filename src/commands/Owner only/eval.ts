import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "eval",
    description: "",
    usage: "2+2",
    preconditions: ["OwnerOnly"],
    quotes: [],
})
export default class EvalCommand extends KaikiCommand {
    private clean = (text: string) => {
        if (this.client.token) {
            text = text.replace(new RegExp(this.client.token, "gi"), "[REDACTED_TOKEN]");
        }
        return text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));
    };

    public async messageRun(
        message: Message,
        args: Args
    ): Promise<Message | Message[]> {
        const code = await args.rest("string");

        try {
            let evaled = await eval("(async () => " + code + ")()");

            evaled = (await import("util")).inspect(evaled);
            return message.reply({
                content: await KaikiUtil.codeblock(
                    KaikiUtil.trim(
                        this.clean(evaled.toString()),
                        Constants.MAGIC_NUMBERS.CMDS.OWNER_ONLY.EVAL.MAX_STRING
                    ),
                    "js"
                ),
            });
        } catch (err) {
            return message.reply(
                `\`ERROR\` ${await KaikiUtil.codeblock(KaikiUtil.trim(this.clean(err.toString()), Constants.MAGIC_NUMBERS.CMDS.OWNER_ONLY.EVAL.MAX_ERROR_STRING), "xl")}`
            );
        }
    }
}
