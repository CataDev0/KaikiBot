import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import type KaikiSapphireClient from "../lib/Kaiki/KaikiSapphireClient";

@ApplyOptions<ListenerOptions>({
    event: Events.ShardResume,
})
export default class ShardResume extends Listener {
    // Emitted when a shard resumes successfully.
    public async run(): Promise<void> {
        await (this.container.client as KaikiSapphireClient<true>).setPresence();
    }
}
