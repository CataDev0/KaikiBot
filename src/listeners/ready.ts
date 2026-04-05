import { ApplyOptions } from "@sapphire/decorators";
import { Events, ListenerOptions } from "@sapphire/framework";
import KaikiListener from "../lib/Kaiki/KaikiListener";

@ApplyOptions<ListenerOptions>({
    event: Events.ClientReady,
    once: true,
})
export default class Ready extends KaikiListener {
    public async run(): Promise<void> {
        this.container.client
            .initializeServices()
            .then(() =>
                this.container.logger.info(
                    "Services | Initiated successfully"
                )
            );
    }
}
