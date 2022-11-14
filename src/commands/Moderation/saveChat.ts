import { Collection, Message, MessageReaction, PermissionsBitField } from "discord.js";
import fs from "fs";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

import KaikiEmbeds from "../../lib/KaikiEmbeds";

export default class SaveChatCommand extends KaikiCommand {
    constructor() {
        super("savechat", {
            aliases: ["savechat"],
            description: "Saves a number of messages, and sends it to you.",
            usage: "100",
            userPermissions: PermissionsBitField.Flags.ManageMessages,
            channel: "guild",
            args: [
                {
                    id: "amount",
                    type: "integer",
                    otherwise: (msg: Message) => ({ embeds: [KaikiEmbeds.genericArgumentError(msg)] }),
                },
            ],
        });
    }

    public async exec(message: Message, { amount }: { amount: number }): Promise<MessageReaction> {

        if (amount > 100) amount = 100;

        const collection = await message.channel.messages.fetch({ limit: amount, before: message.id });

        const attachment = Buffer.from((collection as Collection<string, Message<boolean>>).map((m: Message<true | false>) => {
            return `${m.createdAt.toTimeString().slice(0, 8)} ${m.createdAt.toDateString()} - ${m.author.tag}: ${m.content} ${(m.attachments ? m.attachments.map(a => a.url).join("\n") : "")}`;
        })
            .reverse()
            .join("\n"));

        const filename = `${Date.now()}.txt`;

        fs.writeFileSync(filename, attachment);

        await message.member?.send({
            files: [filename],
        });

        fs.rmSync(filename);

        return message.react("✅");
    }
}
