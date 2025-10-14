import { ApplyOptions } from "@sapphire/decorators";
import { Args, EmojiObject, UserError } from "@sapphire/framework";
import { GuildEmoji, Message } from "discord.js";
import Emotes from "../../lib/Emotes/Emotes";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import KaikiUtil from "../../lib/KaikiUtil";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "addemote",
    aliases: ["ae"],
    description:
        "Adds an emote from an image link or attached image, with an optional name. Or steal another servers emote.",
    usage: ["image-link Emotename", ":CoolEmote:"],
    requiredUserPermissions: ["ManageEmojisAndStickers"],
    requiredClientPermissions: ["ManageEmojisAndStickers"],
    preconditions: ["GuildOnly"],
    typing: true,
})
export default class AddEmoteCommand extends KaikiCommand {
    private usrErr = new UserError({ message: "Provide valid emotes or URLs", identifier: "NoProvidedArgs" });
    public async messageRun(message: Message, args: Args) {

        // Create custom type for url
        // that returns an actual URL
        const emote = await args.pick("emoji")
            .catch(() => args.pick("url"))
            .catch(() => {
                throw this.usrErr;
            })

        let emojiName = "";
        // Only if emote is EmoteObj
        if ("name" in emote && emote.name) {
            if ("id" in emote && !emote.id) throw this.usrErr;
            emojiName = emote.name;
        }

        let name = await args.rest("string").catch(() => emojiName
            || message.attachments.first()?.name);

        if (!name) throw new UserError({
            identifier: "NoNameProvided",
            message: "No name was provided"
        });

        const emojiUrl = AddEmoteCommand.isURL(emote) ? emote : `https://cdn.discordapp.com/emojis/${emote.id}.${emote.animated ? "gif" : "png"}`;

        name = KaikiUtil.trim(
            name,
            Constants.MAGIC_NUMBERS.CMDS.EMOTES.ADD_EMOTE.NAME_MAX_LENGTH
        ).replace(/ /g, "_");

        const buffer = await Emotes.fetchEmote(emojiUrl);
        const fileSize = buffer.byteLength;

        // Added if size is ok
        if (fileSize <= Constants.MAGIC_NUMBERS.CMDS.EMOTES.MAX_FILESIZE) {
            const result = await message.guild?.emojis.create({
                attachment: Buffer.from(buffer),
                name,
            });
            return AddEmoteCommand.sendMessage(result, message);
        } else {
            const resizedBuffer = await Emotes.resizeImage(buffer, emote.toString());
            const result = await message.guild?.emojis.create({
                attachment: Buffer.from(resizedBuffer),
                name,
            });
            return AddEmoteCommand.sendMessage(result, message);
        }
    }

    static sendMessage(result: GuildEmoji | undefined, message: Message) {
        if (result) {
            return message.reply(`Successfully uploaded **${result.name}** ${result}.`)
        }
        throw new UserError({
            identifier: "UnableUploadGuildEmoji",
            message: "Emote image was unable to be uploaded!"
        })
    }

    private static isURL(emoji: URL | EmojiObject): emoji is URL {
        return emoji instanceof URL;
    }
}
