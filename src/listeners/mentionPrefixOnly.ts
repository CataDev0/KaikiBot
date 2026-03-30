import { Listener } from "@sapphire/framework";
import { EmbedBuilder, Message } from "discord.js";
import Constants from "../struct/Constants";

export class MentionPrefixOnly extends Listener {
    public async run(msg: Message) {
        if (msg.author.bot || msg.system) return;

        const embed = msg.reply({
            embeds: [
                new EmbedBuilder({
                    title: `Hi ${msg.author.username}, what's up?`,
                    description: `If you need help, type \`${await this.container.client.fetchPrefix(msg)}help\`.`,
                }).withOkColor(msg),
            ],
        });

        return setTimeout(
            async () => (await embed).delete(),
            Constants.MAGIC_NUMBERS.CMDS.ETC.BOT_MENTION.DELETE_TIMEOUT
        ).unref();
    }
}
