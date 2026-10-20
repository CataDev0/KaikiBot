import {
    DiscordAPIError,
    DiscordjsErrorCodes,
    EmbedBuilder,
    EmbedData,
    Message,
    MessageCreateOptions,
    PermissionsBitField,
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

    // Handle DiscordAPIError 50013
    // Indicates Client is Missing Permissions
    // https://discord.com/developers/docs/topics/opcodes-and-status-codes#json
    // Usually occurs when bot does not have embed links permission or send messages permission in the channel
    if (error instanceof DiscordAPIError && error.code === 50013) {
        if (payload.message.channel.isTextBased() && payload.message.inGuild()) {
            const hasSendMessagesPermission = payload.message.channel
                .permissionsFor(payload.message.client.user!)
                ?.has(PermissionsBitField.Flags.SendMessages);

            const hasEmbedLinksPermission = payload.message.channel
                .permissionsFor(payload.message.client.user!)
                ?.has(PermissionsBitField.Flags.EmbedLinks);

            // Cannot send messages in the channel, so we cannot reply to the user
            if (hasSendMessagesPermission === false) {
                return;
            }
            else if (hasEmbedLinksPermission === false) {
                return payload.message.reply("Please enable `Embed Links` permission for me in the channel.");
            }
            else {
                // This should not happen, but just in case, we will log the error and return
                payload.message.client.logger.error(
                    "DiscordAPIError 50013 occurred, but bot has both SendMessages and EmbedLinks permissions in the channel. This should not happen."
                );
                return;
            }
        }
    }

    const messageOptions: MessageCreateOptions = {
        embeds: [
            new EmbedBuilder(emb)
                .setDescription(error.message || null)
                .withErrorColor(payload.message),
        ],
    };

    if (payload.message.interactionMetadata) {
        Object.assign(messageOptions, { ephemeral: true });
    }

    await payload.message.reply(messageOptions);
};
