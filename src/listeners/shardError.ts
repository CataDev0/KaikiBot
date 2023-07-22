import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import chalk from "chalk";

@ApplyOptions<ListenerOptions>({
    event: Events.ShardError,
})
export default class ShardError extends Listener {

    // Emitted whenever a shard's WebSocket encounters a connection error.
    public async run(error: Error, id: number): Promise<void> {
        this.container.logger.error(`shardError | Shard: ${chalk.redBright(id)} \n${error.stack || error}`);
    }
}
