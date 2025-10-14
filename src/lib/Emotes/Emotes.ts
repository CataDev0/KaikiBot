import { BufferResolvable, Message } from "discord.js";
import sharp from "sharp";
import Constants from "../../struct/Constants";
import { Emote } from "../../arguments/kaikiEmote";

export default class Emotes {

    // Resizes images, including gifs - returns them in buffer format
    static async resizeImage(
        buffer: ArrayBuffer | BufferResolvable,
        emote: Emote | string): Promise<Buffer> {

        const sharpFile = sharp(buffer, { animated: (typeof emote !== "string" ? emote.url : emote).endsWith("gif") });

        return sharpFile
            .resize(
                Constants.MAGIC_NUMBERS.CMDS.EMOTES.MAX_WIDTH_HEIGHT,
                Constants.MAGIC_NUMBERS.CMDS.EMOTES.MAX_WIDTH_HEIGHT,
                {
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 0 },
                }
            )
            .toBuffer();
    }

    // Takes a URL, returns an arrayBuffer
    static async fetchEmote(url: string | URL) {
        const file = await fetch(url);

        if ((file.ok || file.body) && file.headers.get("content-type")?.includes("image")) {
            return file.arrayBuffer();
        }
        return Promise.reject();
    }

    static async countEmotes(message: Message): Promise<void> {
        if (!message.guild) return;

        const { guild } = message,
            emotes = message.content.match(/<?(a)?:.+?:\d+>/g);

        if (!emotes) return;

        const ids = emotes.toString().match(/\d+/g);

        if (!ids) return;

        const request = ids
            .map((item) => {
                const emote = guild.emojis.cache.get(item);

                if (emote) {
                    return message.client.orm.emojiStats.upsert({
                        where: {
                            EmojiId: BigInt(emote.id),
                        },
                        create: {
                            EmojiId: BigInt(emote.id),
                            Count: BigInt(1),
                            GuildId: BigInt(guild.id),
                        },
                        update: {
                            Count: {
                                increment: 1n,
                            },
                        },
                    });
                }
            })
            .filter(<T>(n?: T): n is T => Boolean(n));

        await message.client.orm.$transaction(request);
    }
}
