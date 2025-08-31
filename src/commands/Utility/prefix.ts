import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { Args, UserError } from "@sapphire/framework";
import ConfigCommand from "../Server settings/config";

@ApplyOptions<KaikiCommandOptions>({
    name: "prefix",
    usage: ["", "!"],
    description: "View current prefix.",
})
export default class InviteCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {

        if (!args.finished) {
            if (!message.inGuild()) throw new UserError({
                message: "Cannot set prefix outside of a guild",
                identifier: "SetPrefixNotInGuild"
            })

            return (message.client.stores.get("commands").get("config") as ConfigCommand).prefixRun(message, args);
        }
        return message.reply({
            embeds: [
                new EmbedBuilder({
                    title: "Current prefix",
                    description: <string>await this.container.client.fetchPrefix(message),
                }).withOkColor(message),
            ],
        });
    }
}
