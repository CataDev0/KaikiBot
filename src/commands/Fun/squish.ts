import { GuildMember, Message, MessageEmbed, MessageAttachment } from "discord.js";
import sharp from "sharp";
import fetch from "node-fetch";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand.js";


export default class SquishCommand extends KaikiCommand {
    constructor() {
        super("squish", {
            aliases: ["squish"],
            description: "Squishes given member's avatar",
            usage: "@dreb",
            args: [
                {
                    id: "member",
                    type: "member",
                    default: (message: Message) => message.member,
                },
            ],
        });
    }
    public async exec(message: Message, { member }: { member: GuildMember}): Promise<Message> {

        const avatar = await (await fetch(member.displayAvatarURL({
            dynamic: true,
            size: 256,
            format: "jpg",
        }))).buffer();

        const picture = sharp(avatar)
            .resize(64, 256)
            .webp();

        const attachment: MessageAttachment = new MessageAttachment(await picture.toBuffer(), "Squished.jpg");
        const embed = new MessageEmbed({
            title: "Squished avatar...",
            image: { url: "attachment://Squished.jpg" },
            color: member.displayColor,
        });

        return message.channel.send({ files: [attachment], embeds: [embed] });
    }
}
