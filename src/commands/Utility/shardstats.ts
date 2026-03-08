import { ApplyOptions } from "@sapphire/decorators";
import { Message, Status } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";

@ApplyOptions<KaikiCommandOptions>({
    name: "shardstats",
    aliases: ["shards"],
    usage: "",
    description: "Displays the states of all shards",
    preconditions: ["GuildOnly"],
    minorCategory: "Info",
})
export default class ShardStatisticsCommand extends KaikiCommand {
    public async messageRun(message: Message<true>) {
        const { ws } = message.client;

        const shardList = Array.from(ws.shards.values())
            .map((w) => `ID: [${w.id}] | Ping: ${w.ping}ms | Status: ${Status[w.status]}`)
            .join("\n");

        return message.reply({
            content: [
                await KaikiUtil.codeblock(`This guild is managed by shard: [${message.guild.shardId}]`, "xl"),
                await KaikiUtil.codeblock(shardList, "xl"),
            ].join("\n"),
        });
    }
}
