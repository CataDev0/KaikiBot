import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions, ListenerErrorPayload } from "@sapphire/framework";

@ApplyOptions<ListenerOptions>({
    event: Events.ListenerError,
})
export default class ListenerErrorEvent extends Listener {
    public run(error: Error, payload: ListenerErrorPayload): void {
        this.container.logger.error(`[Listener Error] ${payload.piece.name}`, error);
    }
}