import { execFile } from "child_process";
import { randomUUID } from "crypto";
import { writeFile, readFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";
import { ApplyOptions } from "@sapphire/decorators";
import { Args, UserError } from "@sapphire/framework";
import {
    Attachment,
    AttachmentBuilder,
    EmbedBuilder,
    Message,
    User,
} from "discord.js";
import sharp from "sharp";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";

const execFileAsync = promisify(execFile);

@ApplyOptions<KaikiCommandOptions>({
    name: "magicwarp",
    aliases: ["liquidrescale", "lqr", "warp"],
    description: "Liquid-rescales (magic warps) a given image using ImageMagick.",
    usage: ["@dreb", "https://example.com/image.png"],
    typing: true,
})
export default class MagicWarpCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const argument = await args.pick("user")
            .catch(() => args.pick("url"))
            .catch(() => {
                const attachment = message.attachments.first();
                if (attachment?.contentType?.startsWith("image/")) {
                    if (attachment.size > Constants.MAGIC_NUMBERS.CMDS.FUN.MAGIC_WARP.MAX_FILE_SIZE) {
                        throw new UserError({
                            identifier: "FileTooLarge",
                            message: `Image must be under ${Constants.MAGIC_NUMBERS.CMDS.FUN.MAGIC_WARP.MAX_FILE_SIZE / 1024 / 1024} MB.`,
                        });
                    }
                    return attachment;
                }

                if (args.finished) {
                    return message.author;
                }

                throw new UserError({
                    identifier: "Argument",
                    message: "Please provide a member, image-url or attached image.",
                });
            });

        let url: string;

        if (argument instanceof User) {
            url = argument.displayAvatarURL({ size: 256, extension: "png" });
        }
        else if (argument instanceof URL) {
            url = argument.toString();
        }
        else {
            url = (argument as Attachment).url;
        }

        const imageBuffer = await (await fetch(url)).arrayBuffer();

        if (imageBuffer.byteLength > Constants.MAGIC_NUMBERS.CMDS.FUN.MAGIC_WARP.MAX_FILE_SIZE) {
            throw new UserError({
                identifier: "FileTooLarge",
                message: `Image must be under ${Constants.MAGIC_NUMBERS.CMDS.FUN.MAGIC_WARP.MAX_FILE_SIZE / 1024 / 1024} MB.`,
            });
        }

        const { width = 0, height = 0 } = await sharp(imageBuffer).metadata();
        if (width > Constants.MAGIC_NUMBERS.CMDS.FUN.MAGIC_WARP.MAX_DIMENSION || height > Constants.MAGIC_NUMBERS.CMDS.FUN.MAGIC_WARP.MAX_DIMENSION) {
            throw new UserError({
                identifier: "ImageTooLarge",
                message: `Image dimensions must not exceed ${Constants.MAGIC_NUMBERS.CMDS.FUN.MAGIC_WARP.MAX_DIMENSION}px.`,
            });
        }

        // For portrait images, only collapse width seams (already dramatic).
        // For square/landscape images also collapse height seams so the effect is equally visible.
        const aspectRatio = height > 0 ? width / height : 1;
        const rescaleParam = aspectRatio < 0.67
            ? "50x100%!"   // clear portrait – horizontal seam removal is enough
            : "50x50%!";   // square or landscape – warp both axes

        const id = randomUUID();
        const tmpIn = join(tmpdir(), `magicwarp-in-${id}.png`);
        const tmpOut = join(tmpdir(), `magicwarp-out-${id}.png`);

        // Normalize to PNG first so ImageMagick doesn't have to guess the format
        const pngBuffer = await sharp(imageBuffer).png().toBuffer();

        try {
            await writeFile(tmpIn, pngBuffer);
            await execFileAsync("convert", [
                tmpIn,
                "-liquid-rescale", rescaleParam,
                tmpOut,
            ]);
            const outBuffer = await readFile(tmpOut);

            const attachment = new AttachmentBuilder(outBuffer, {
                name: "magicwarp.png",
            });

            const embed = new EmbedBuilder({
                title: "Magic warped...",
                image: { url: "attachment://magicwarp.png" },
            }).withOkColor(message);

            return message.reply({ files: [attachment], embeds: [embed] });
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            if (msg.includes("lqr") || msg.includes("delegate")) {
                throw new UserError({
                    identifier: "MissingDelegate",
                    message: "ImageMagick on this host was not compiled with LQR (liquid-rescale) support.",
                });
            }
            throw err;
        }
        finally {
            await unlink(tmpIn).catch(() => null);
            await unlink(tmpOut).catch(() => null);
        }
    }
}
