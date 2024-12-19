import {
    EmbedBuilder,
    EmbedData,
    Message,
    MessageCreateOptions,
} from "discord.js";
import {
    Identifiers,
    MessageCommandDeniedPayload,
    UserError,
} from "@sapphire/framework";
import KaikiCommand from "../Kaiki/KaikiCommand";

type ErrorContext = {
	message: Message;
	command: KaikiCommand;
	commandContext: Record<string, unknown>;
};

function isArgsMissingError(identifier: string): identifier is Identifiers.ArgsMissing {
    return identifier === Identifiers.ArgsMissing;
}

export default async (
    error: UserError,
    payload: MessageCommandDeniedPayload
) => {
    const emb: EmbedData = {
        title: "Argument error",
    };

    if (isArgsMissingError(error.identifier)) {
        const errorContext = error.context as ErrorContext;
        const prefix = errorContext.commandContext.prefix;

        error.message = "This command requires more arguments";

        if (Array.isArray(errorContext.command.usage)) {
            emb.fields = errorContext.command.usage.map((usage, i) =>
                Object({
                    name: `Usage #${i + 1}`,
                    value: `\`${prefix}${errorContext.command.name} ${usage}\``,
                })
            );
        } else {
            emb.fields = [
                {
                    name: "Usage",
                    value: `\`${prefix}${errorContext.command.name} ${errorContext.command.usage}\``,
                },
            ];
        }
    }

    const messageOptions: MessageCreateOptions = {
        embeds: [
            new EmbedBuilder(emb)
                .setDescription(error.message)
                .withErrorColor(payload.message),
        ],
    };

    if (payload.message.interactionMetadata) {
        Object.assign(messageOptions, { ephemeral: true });
    }

    await payload.message.reply(messageOptions);
};
