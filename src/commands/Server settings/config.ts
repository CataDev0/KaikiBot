import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { Message } from "discord.js";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { KaikiSubCommandOptions } from "../../lib/Interfaces/Kaiki/KaikiSubCommandOptions";
import Config from "../../lib/ServerConfig/Config";

@ApplyOptions<KaikiSubCommandOptions>({
    name: "config",
    aliases: ["configure", "conf"],
    description:
		"Configure or display guild specific settings.\nYou can use any of the following\n`'1', 'true', '+', 't', 'yes', 'y'` to enable configs or \n`'0', 'false', '-', 'f', 'no', 'n'` to disable them.",
    usage: [
        "",
        "dadbot enable",
        "anniversary enable",
        "prefix !",
        "okcolor <hex>",
        "errorcolor <hex>",
    ],
    requiredUserPermissions: ["ManageMessages"],
    preconditions: ["GuildOnly"],
    subcommands: [
        {
            name: "show",
            messageRun: "defaultMessageRun",
            default: true,
        },
        // Dadbot
        {
            name: "dadbot",
            messageRun: "dadbotRun",
        },
        {
            name: "dad",
            messageRun: "dadbotRun",
        },
        // Anniversaryroles
        {
            name: "anniversary",
            messageRun: "anniversaryRun",
        },
        {
            name: "anniversaryroles",
            messageRun: "anniversaryRun",
        },
        {
            name: "roles",
            messageRun: "anniversaryRun",
        },
        // Prefix
        {
            name: "prefix",
            messageRun: "prefixRun",
        },
        // okColor
        {
            name: "okcolor",
            messageRun: "okcolorRun",
        },
        // errorColor
        {
            name: "errorcolor",
            messageRun: "errorcolorRun",
        },
    ],
})
export default class ConfigCommand extends Subcommand {
    public async defaultMessageRun(message: Message<true>) {
        return await Config.messageRun(message);
    }

    public dadbotRun(message: Message<true>, args: Args) {
        return Config.dadbotRun(message, args);
    }

    public async anniversaryRun(
        message: Message<true>,
        args: Args
    ): Promise<Message<true>> {
        return Config.anniversaryRun(message, args);
    }

    public async prefixRun(message: Message<true>, args: Args) {
        return Config.prefixRun(message, args);
    }

    public async okcolorRun(message: Message<true>, args: Args) {
        return Config.okcolorRun(message, args);
    }

    public async errorcolorRun(message: Message<true>, args: Args) {
        return Config.errorcolorRun(message, args);
    }
}
