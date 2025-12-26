import { ApplyOptions } from "@sapphire/decorators";
import { Args } from "@sapphire/framework";
import { AttachmentBuilder, EmbedBuilder, Message } from "discord.js";
import { MinecraftServerUtil } from "../../lib/Minecraft/MinecraftServerUtil";
import { MinecraftServerStatusResponse } from "../../lib/Interfaces/Common/MinecraftServer";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";

const cache = new Map<string, MinecraftServerStatusResponse>();

@ApplyOptions<KaikiCommandOptions>({
    name: "mcping",
    aliases: ["mcp"],
    description: "Ping a minecraft server address to see if it is online",
    usage: "2b2t.org",
    typing: true,
    minorCategory: "Info",
})
export default class MinecraftPingCommand extends KaikiCommand {
    public async messageRun(message: Message, args: Args): Promise<Message> {
        const term = await args.pick("string");

        if (cache.has(term)) {
            const result = cache.get(term)!;
            return this.sendSuccess(message, term, result);
        }

        try {
            const [host, port] = term.split(":");
            const result = await MinecraftServerUtil.getStatus(host, port ? parseInt(port) : undefined);

            cache.set(term, result);
            // Cache for 1 min
            setTimeout(() => cache.delete(term), 60000); 

            return this.sendSuccess(message, term, result);
        } catch (error) {
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("Error connecting to the server")
                        .setDescription("No ping returned. Server is either offline or the address is incorrect")
                        .withErrorColor(message),
                ],
            });
        }
    }

    private getMotd(description: MinecraftServerStatusResponse["description"]): string {
        if (typeof description === "string") {
            return description;
        } else if (typeof description === "object" && description.text) {
            let motd = description.text;
            if (description.extra) {
                motd += description.extra.map(e => e.text).join("");
            }
            return motd;
        }
        return "N/A";
    }

    private async sendSuccess(message: Message, term: string, result: MinecraftServerStatusResponse) {
        const attachment = result.favicon
            ? new AttachmentBuilder(
                Buffer.from(result.favicon.slice(result.favicon.indexOf(",") + 1), "base64"), { name: "icon.png" }
            )
            : undefined;

        const embed = new EmbedBuilder()
            .setTitle("Ping! Server is online")
            .setDescription(term)
            .addFields([
                {
                    name: "Version",
                    value: result.version.name,
                    inline: true,
                },
                {
                    name: "MOTD",
                    value: this.getMotd(result.description),
                    inline: true,
                },
                {
                    name: "Players",
                    value: `${result.players.online}/${result.players.max}`,
                    inline: true,
                },
            ])
            .withOkColor(message);

        if (attachment) {
            embed.setImage("attachment://icon.png");
            return message.reply({
                files: [attachment],
                embeds: [embed],
            });
        } else {
            return message.reply({ embeds: [embed] });
        }
    }
}
