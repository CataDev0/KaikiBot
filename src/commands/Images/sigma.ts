import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder, Message } from "discord.js";
import Constants from "../../struct/Constants";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

@ApplyOptions<KaikiCommandOptions>({
    name: "sigma",
    description: "Spawn a sigma male picture",
    usage: [""],
    typing: true,
})
export default class Sigma extends KaikiCommand {
    private readonly sigmaImages = [
        "https://your-cdn-here.com/sigma1.png",
        "https://your-cdn-here.com/sigma2.png",
    ];

    public async messageRun(message: Message): Promise<Message> {
        // Randomly select an image
        const randomImage = this.sigmaImages[Math.floor(Math.random() * this.sigmaImages.length)];

        const embed = new EmbedBuilder({
            image: { url: randomImage },
            footer: {
                icon_url: message.author.displayAvatarURL(),
                text: message.author.username,
            },
        }).setColor(Constants.hexColorTable.gold);

        return message.reply({ embeds: [embed] });
    }
}
