import {
    Events,
    Listener,
    ListenerOptions,
    MessageCommandDeniedPayload,
    UserError,
} from "@sapphire/framework";
import ArgumentErrorRun from "../lib/Errors/ArgumentErrorRun";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<ListenerOptions>({
    event: Events.MessageCommandError,
})
export default class MessageCommandError extends Listener {
    // Ran when precondition check blocks a command
    public async run(
        error: UserError,
        payload: MessageCommandDeniedPayload
    ): Promise<void> {
        await ArgumentErrorRun(error, payload);
    }
}
