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

function hasIdentifier<T extends string>(error: UserError, identifier: T): error is UserError & { identifier: T, context: ErrorContext } {
    return error.identifier === identifier;
}

const IdentifierEntries = Object.freeze({
    "argsMissing": argsMissingErrorRun,
    "APIProcessorError": apiProcessorErrorRun,
});

function argsMissingErrorRun(error: UserError & { identifier: Identifiers.ArgsMissing, context: ErrorContext }, payload: MessageCommandDeniedPayload) {
    const errorContext = error.context;
    const prefix = errorContext.commandContext.prefix;
    const emb: EmbedData = {};

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
    return emb;
}

function apiProcessorErrorRun(error: UserError & { identifier: "APIProcessorError", context: ErrorContext }, payload: MessageCommandDeniedPayload) {
    payload.message.client.logger.error(
        `        ${error.name} | Cmd: ${payload.command.name} | User: ${payload.message.author.username} [${payload.message.author.id}] | GID/CID: ${payload.message.guildId || payload.message.channelId} | ${error.message} ${error.identifier} ${error.stack}`
    );
    return { "description": "Failed to fetch the image from the API. Please try again later." } as EmbedData;
}

export default async (
    error: UserError,
    payload: MessageCommandDeniedPayload
) => {
    let emb: EmbedData = {
        title: "Error",
    };

    if (error instanceof UserError) {
        // Handle UserError cases
        emb.title = "User Error";

        const functionToRun = IdentifierEntries[error.identifier as keyof typeof IdentifierEntries];
        if (functionToRun) {
            const result = functionToRun(error as any, payload);
            Object.assign(emb, result);
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
                return payload.message.reply("I need `Embed Links` permission in the channel in order to display embeds.");
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
                .setDescription(emb.description || error.message || null)
                .withErrorColor(payload.message),
        ],
    };

    if (payload.message.interactionMetadata) {
        Object.assign(messageOptions, { ephemeral: true });
    }

    await payload.message.reply(messageOptions);
};
