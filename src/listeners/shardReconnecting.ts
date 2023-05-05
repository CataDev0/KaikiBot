import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import chalk from "chalk";

@ApplyOptions<ListenerOptions>({
    event: "shardReconnecting",
})
export default class ShardReconnecting extends Listener {

    // Emitted when a shard is attempting to reconnect or re-identify.
    public async run(id: number): Promise<void> {

        this.container.logger.info(`shardReconnecting | Shard: ${chalk.green(id)}`);
    }
}
