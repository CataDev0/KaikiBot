import { Args, Argument, Identifiers } from "@sapphire/framework";
import { Message } from "discord.js";
import Constants from "../../struct/Constants";

export enum GamblingCommands {
	br,
	betroll = 0,
	bf,
	betflip = 1,
	slot,
	slots = 2,
}

export default class KaikiArgumentsTypes {
    static entries = Object.entries(GamblingCommands) as [
		string,
		GamblingCommands,
	][];

    // These are only for specific use cases, whereas arguments in ../../arguments are more general.
    public static emoteImageArgument = Args.make<string>(
        async (parameter: string, context: Argument.Context<string>) => {
            if (!parameter) {
                return Args.error({
                    parameter,
                    argument: context.argument,
                });
            }

            if (context.message.attachments.size) {
                const attachment = context.message.attachments.first();

                if (attachment) {
                    return Args.ok(attachment.url);
                }

                return Args.error({
                    parameter,
                    argument: context.argument,
                });
            }

            const emoji = await context.args
                .pick("emoji")
                .catch(() => undefined);

            // TODO: TEST IF THIS WORKS FOR ALL EMOTES
            if (emoji) {
                return Args.ok(
                    `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`
                );
            }

            const url = await context.args.pick("url").catch(() => undefined);

            // TODO: TEST IF THIS WORKS AT ALL
            if (url) {
                return Args.ok(url.href);
            }

            return Args.error({
                parameter,
                argument: context.argument,
            });
        }
    );

    public static imageArgument = Args.make<string>(
        async (parameter: string, context: Argument.Context<string>) => {
            const { args } = context;
            const user = await args.pick("user").catch(() => undefined);
            if (user) return Args.ok(user.displayAvatarURL({ size: 1024, extension: "png" }));

            // Check for emoji
            const emoji = await args.pick("emoji").catch(() => undefined);
            if (emoji) {
                return Args.ok(`https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "png"}`);
            }

            const url = await args.pick("url").catch(() => undefined);
            if (url) return Args.ok(url.href);

            if (context.message.attachments.size) {
                const attachment = context.message.attachments.first();
                if (attachment?.contentType?.startsWith("image/")) {
                    return Args.ok(attachment.url);
                }
            }

            return Args.error({
                parameter,
                argument: context.argument,
                identifier: "Argument",
                message: "Please provide a member, image-url or attached image.",
            });
        }
    );

    static async checkImageArgument(message: Message, args: Args): Promise<string> {
        return args.pick(KaikiArgumentsTypes.imageArgument)
            .catch(async (err) => {
                if (err.identifier === Identifiers.ArgsMissing) {
                    const attachment = message.attachments.first();
                    if (attachment?.contentType?.startsWith("image/")) {
                        return attachment.url;
                    }
                    return message.member!.displayAvatarURL({ size: 512, extension: "png" });
                }
                throw err;
            });
    }

    public static gamblingCommandsArgument = Args.make<GamblingCommands>(
        async (
            parameter: string,
            context: Argument.Context<GamblingCommands>
        ) => {
            const argument = parameter.toLowerCase();
            const command = KaikiArgumentsTypes.entries.find(
                (entry) => entry[0] === argument
            );
            if (command) {
                return Args.ok(command[1]);
            }
            return Args.error({
                parameter,
                argument: context.argument,
                message:
					"The provided argument could not be resolved to a gambling command.",
            });
        }
    );

    static checkInt = (phrase: string) => {
        const int = parseInt(phrase);

        if (!int) return null;
        if (int < Constants.MAGIC_NUMBERS.LIB.KAIKI.KAIKI_ARGS.MIN_INT)
            return null;
        return int;
    };

    static getCurrency = async (message: Message) =>
        await message.client.money.get(message.author.id);
}
