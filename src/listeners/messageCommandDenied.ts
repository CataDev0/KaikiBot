import { ApplyOptions } from "@sapphire/decorators";
import {
    Events,
    Listener,
    ListenerOptions,
    MessageCommandDeniedPayload, PreconditionError,
    UserError
} from "@sapphire/framework";
import { EmbedBuilder, MessageCreateOptions } from "discord.js";
import * as colorette from "colorette";

@ApplyOptions<ListenerOptions>({
    event: Events.MessageCommandDenied,
})
export default class MessageCommandDenied extends Listener {
    // Ran when precondition check blocks a command

    public async run(
        error: UserError | PreconditionError,
        payload: MessageCommandDeniedPayload
    ): Promise<void> {

        // Do not log stack trace of normal precondition commands
        // They are not errors
        if (error.identifier.toLowerCase().startsWith("precondition")) {
            this.container.logger.error(
                `        ${error.name} | Cmd: ${colorette.greenBright(payload.command.name)} | User: ${colorette.greenBright(payload.message.author.username)} [${colorette.greenBright(payload.message.author.id)}] |  ${error.message}`
            );
        }

        // Some commands might throw real errors, we log the stack here.
        else {
            this.container.logger.error(
                `        ${error.name} | Cmd: ${colorette.greenBright(payload.command.name)} | User: ${colorette.greenBright(payload.message.author.username)} [${colorette.greenBright(payload.message.author.id)}] | GID/CID: ${colorette.greenBright(payload.message.guildId || payload.message.channelId)} | ${error.message} ${error.identifier} ${error.stack}`
            );
        }

        const messageOptions: MessageCreateOptions = {
            embeds: [
                new EmbedBuilder({
                    title: error.name,
                    description: error.message,
                    footer: { text: error.identifier },
                }).withErrorColor(payload.message),
            ],
        };

        if (payload.message.interactionMetadata) {
            Object.assign(messageOptions, { ephemeral: true });
        }

        await payload.message.reply(messageOptions);
    }
}
