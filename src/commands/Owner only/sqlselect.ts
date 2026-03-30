import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { Message } from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "sqlselect",
    description:
                "Executes sql queries and returns the number of affected rows. Dangerous.",
    usage: ["SELECT * FROM DiscordUsers LIMIT 5"],
    preconditions: ["OwnerOnly"],
})
export default class SqlSelectCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const str = await args.rest("string");

        // Prisma equivalent returns records as array directly
        const res = await this.client.orm.$queryRawUnsafe<any[]>(str);

        // Convert BigInts to string for JSON serialization
        const serialized = JSON.stringify(
            res,
            (_, value) => typeof value === 'bigint' ? value.toString() : value,
            4
        );

        return message.reply(
            await KaikiUtil.codeblock(
                KaikiUtil.trim(
                    serialized,
                    Constants.MAGIC_NUMBERS.CMDS.OWNER_ONLY.SQL
                        .MESSAGE_LIMIT_JSON
                ),
                "json"
            )
        );
    }
}
