import { Command } from "discord-akairo";
import { Message } from "discord.js";
import KaikiInhibitor from "Kaiki/KaikiInhibitor";
import { blockedCategories } from "../lib/enums/blockedCategories";

export default class BlockModulesInhibitor extends KaikiInhibitor {
    constructor() {
        super("blockmodules", {
            reason: "blocked module",
        });
    }

    async exec(message: Message, command: Command): Promise<boolean> {

        if (message.guild) {

            if (command.id === "togglecategory") return false;

            const _blockedCategories = await this.client.orm.blockedCategories.findFirst({ where: { Guilds: { Id: BigInt(message.guildId!) } } });
            if (_blockedCategories) {
                return !!blockedCategories[_blockedCategories.CategoryTarget];
            }
            return false;
        }
        return false;
    }
}
