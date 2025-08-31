import { EmbedBuilder, Guild, Message } from "discord.js";

export default class KaikiEmbeds {
    static errorMessage = async (
        message: Message | Guild,
        msg: string
    ): Promise<EmbedBuilder> =>
        new EmbedBuilder({
            title: "Error",
            description: msg,
        }).withErrorColor(message);

    static addedRoleEmbed = (roleName: string): EmbedBuilder =>
        new EmbedBuilder({
            title: "Excluded",
            description: `Added role \`${roleName}\`.\nType the command again to remove.`,
        });

    static removedRoleEmbed = (roleName: string): EmbedBuilder =>
        new EmbedBuilder({
            title: "Included",
            description: `Removed role \`${roleName}\`.\nType the command again to add it back.`,
        });

    static embedFail = async (
        message: Message,
        text = "You do not have a role!"
    ) => {
        return new EmbedBuilder().setDescription(text).withErrorColor(message);
    };
}
