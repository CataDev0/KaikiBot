import { Message, MessageReaction } from "discord.js";
import KaikiCommand from "Kaiki/KaikiCommand";
import KaikiEmbeds from "../../lib/KaikiEmbeds";


export default class todoAddCommand extends KaikiCommand {
    constructor() {
        super("add", {
            args: [{
                id: "toAdd",
                type: "string",
                match: "rest",
                otherwise: (msg: Message) => ({ embeds: [KaikiEmbeds.genericArgumentError(msg)] }),
            }],
        });
    }

    public async exec(message: Message, { toAdd }: { toAdd: string}): Promise<MessageReaction> {

        this.client.orm.todos.create({
            data: {
                String: toAdd,
                DiscordUsers: {
                    connectOrCreate: {
                        create: {
                            UserId: BigInt(message.author.id),
                        },
                        where: {
                            UserId: BigInt(message.author.id),
                        },
                    },
                },
            },
        });
        return message.react("✅");
    }
}
