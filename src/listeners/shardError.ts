import { Listener } from "discord-akairo";
import logger from "loglevel";
import chalk from "chalk";


export default class ShardErrorListener extends Listener {
	constructor() {
		super("shardError", {
			event: "shardError",
			emitter: "client",
		});
	}
	// Emitted whenever a shard's WebSocket encounters a connection error.

	public async exec(error: Error, id: number): Promise<void> {

		logger.error(`shardError | Shard: ${chalk.redBright(id)} \n${error.stack ? error.stack : error}`);

	}
}
