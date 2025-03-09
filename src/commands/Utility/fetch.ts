import { ApplyOptions } from "@sapphire/decorators";
import {
    Args,
    MessageCommandContext,
    Resolvers,
    UserError,
} from "@sapphire/framework";
import { Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "fetch",
    aliases: ["fu"],
    description:
		"Fetches a discord user, shows relevant information. 30sec cooldown.",
    usage: ["<id>"],
    cooldownDelay: 30000,
})
export default class FetchUserCommand extends KaikiCommand {
    public async messageRun(
        message: Message,
        args: Args,
        ctx: MessageCommandContext
    ): Promise<Message | unknown> {
        args.save();

        const possibleUser = await args.pick("string");

        const result = await Resolvers.resolveUser(possibleUser);

        args.restore();

        if (result.isErr()) {
            throw new UserError({
                identifier: "fetchNoUserFound",
                message:
					"Provided argument doesn't seem to be a valid user ID.",
                context: ctx,
            });
        }

        const infoCmd = this.store.resolve("info");
        return infoCmd.messageRun!(message, args, ctx);
    }
}
