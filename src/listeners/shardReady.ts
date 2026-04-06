import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import * as colorette from "colorette";
import { Snowflake } from "discord.js";

@ApplyOptions<ListenerOptions>({
    event: Events.ShardReady,
})
export default class ShardReady extends Listener {
    // Emitted when a shard turns ready.
    public async run(
        id: number,
        unavailableGuilds?: Set<Snowflake>
    ): Promise<void> {
        const arr = [`ShardReady | Shard: ${colorette.green(id)}`];
        if (unavailableGuilds?.size) {
            arr.push("Unavailable guilds:");
            unavailableGuilds.forEach((v1, v2) => {
                arr.push(`${v1}: ${v2}`);
            });
        }
        this.container.logger.info(arr.join("\n"));
    }
}
