import { PrefixSupplier } from "discord-akairo";
import { Guild, Message, MessageEmbed, Permissions } from "discord.js";

import GreetHandler, { JSONToMessageOptions } from "../../lib/GreetHandler";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

export default class ByeMessageCommand extends KaikiCommand {
    constructor() {
        super("goodbyemessage", {
            aliases: ["goodbyemessage", "goodbyemsg", "byemsg"],
            userPermissions: Permissions.FLAGS.MANAGE_GUILD,
            channel: "guild",
            args: [{
                id: "msg",
                type: (message, phrase) => {
                    try {
                        return JSON.parse(message.content.substring(message.content.indexOf(phrase)));
                    }
                    catch {
                        return undefined;
                    }
                },
                otherwise: (m) => GreetHandler.JSONErrorMessage(m),
            }],
        });
    }

    public async exec(message: Message, { msg }: { msg: unknown | JSONToMessageOptions }): Promise<Message> {

        const json = new JSONToMessageOptions(msg);
        if (!json) return message.channel.send(GreetHandler.JSONErrorMessage(message));

        const guildID = (message.guild as Guild).id;

        const db = await this.client.orm.guilds.update({
            where: { Id: BigInt(guildID) },
            data: { ByeMessage: JSON.stringify(json) },
        });

        const prefix = (this.handler.prefix as PrefixSupplier)(message);
        const embed = [new MessageEmbed()
            .setDescription(`New bye message has been set!\n\nTest what the message looks like by typing \`${prefix}byetest\``)
            .withOkColor(message)];

        if (!db.ByeChannel) {
            embed.push(new MessageEmbed()
                .setDescription(`Enable \`goodbye\` messages by typing \`${prefix}goodbye\`.`)
                .withOkColor(message),
            );
        }

        return message.channel.send({
            embeds: embed,
        });
    }
}
