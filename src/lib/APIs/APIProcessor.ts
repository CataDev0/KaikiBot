import { EmbedBuilder, GuildMember, Message } from "discord.js";
import InteractionsImageData from "../Interfaces/Common/InteractionsImageData";
import KaikiUtil from "../KaikiUtil";

export default class APIProcessor {
    static async processImageAPIRequest(
        message: Message,
        site: string,
        data: InteractionsImageData,
        jsonProperty: string | string[],
        mention?: GuildMember | null
    ) {
        const { color } = data;

        const image = await APIProcessor.processFetchRequest(
            site,
            jsonProperty
        );

        const embed = new EmbedBuilder({
            image: { url: image },
            footer: {
                icon_url: message.author.displayAvatarURL(),
                text: message.author.username,
            },
        }).setColor(color);

        if (mention && data.action) {
            embed.setDescription(
                `${message.author.username} ${data.action} ${mention.user.username} ${data.append ?? ""}`
            );
        } else if (data.action && data.appendable) {
            embed.setDescription(
                `${message.author.username} ${data.action} ${data.append ?? ""}`
            );
        }

        return embed;
    }

    private static async processFetchRequest(
        site: RequestInfo,
        jsonProperty: string | string[]
    ): Promise<string> {
        const response = await fetch(site, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "User-Agent": "KaikiBot (Catadev, https://kaikibot.xyz)",
            },
        });
        KaikiUtil.checkResponse(response);
        return KaikiUtil.json(response, jsonProperty);
    }
}
