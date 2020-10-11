import { Listener } from "discord-akairo";

export default class InvalidatedListener extends Listener {
	constructor() {
		super("invalidated", {
			event: "invalidated",
			emitter: "client",
		});
	}
	// Emitted when the client's session becomes invalidated.

	public async exec(): Promise<never> {

		console.error("🟥 Session has become invalidated. Shutting down client.");

		return process.exit(1);

	}
}
