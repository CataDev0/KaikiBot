import * as buffer from "buffer";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import { AttachmentBuilder, GuildMember, Message } from "discord.js";

import sharp from "sharp";
import Images from "../../data/images.json";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";

@ApplyOptions<KaikiCommandOptions>({
    name: "simp",
    usage: "@dreb",
    description: "Expose your friend as a disgusting simp!",
    preconditions: ["GuildOnly"],
    minorCategory: "Image Manipulation",
})
export default class SimpCommand extends KaikiCommand {
    private backgroundUrl = Images.fun.commands.simp;

    private async background() {
        return KaikiUtil.loadImage(this.backgroundUrl);
    }

    public async messageRun(message: Message, args: Args) {
        const member = <GuildMember>await args.pick("member").catch(() => {
            if (args.finished) {
                return message.member;
            }
            throw new UserError({
                identifier: "InvalidMemberProvided",
                message: "Couldn't find a server member with that name.",
            });
        });

        const avatar = await (
            await fetch(
                member.displayAvatarURL({
                    size: 128,
                    extension: "jpg",
                })
            )
        ).arrayBuffer();

        const textOverlay = `<svg height="100" width="500">
                                <style>
                                    .userText {
                                        font-family: sans-serif;
                                        font-size: 42px;
                                        text-anchor: middle;
                                        fill: white;
                                    }
                                </style>
  <text x="250" y="50" class="userText"> ${member.user.username} </text>
</svg>`;

        const sharpAvatar = await sharp(avatar)
            .resize({ height: 205, width: 205 })
            .extend({
                top: 2,
                bottom: 2,
                left: 2,
                right: 2,
                background: "black",
            })
            .toBuffer();

        const picture = sharp(await this.background()).composite([
            {
                input: sharpAvatar,
                left: 570,
                top: 120,
            },
            {
                input: buffer.Buffer.from(textOverlay),
                left: 425,
                top: 335,
            },
        ]);

        const attachment = new AttachmentBuilder(picture, { name: "simp.jpg" });
        await message.reply({
            content: `Haha, you're a simp!! ${member}!`,
            files: [attachment],
            allowedMentions: {
                users: [],
            },
        });
    }
}
