import { Listener } from "@sapphire/framework";
import { Events } from "discord.js";
import KaikiSapphireClient from "./KaikiSapphireClient";

export default class KaikiListener extends Listener {
    client: KaikiSapphireClient<true>;

    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, { ...options, event: Events.ClientReady, once: undefined });
        this.client = this.container.client as KaikiSapphireClient<true>;
    }

    run(...args: any): any {
        return undefined;
    }
}
