import { ApplyOptions } from "@sapphire/decorators";
import { PreconditionEntryResolvable } from "@sapphire/framework";
import {
    AttachmentBuilder,
    EmbedBuilder,
    Message,
    PermissionsBitField,
    PermissionsString,
} from "discord.js";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import Constants from "../../struct/Constants";
import process from "process";

@ApplyOptions<KaikiCommandOptions>({
    name: "gencmdlist",
    aliases: ["gencmdlst", "gencmds"],
    usage: "",
    description:
		"Uploads a JSON file containing all commands. Supports uploading to a specific endpoint.",
    preconditions: ["OwnerOnly"],
})
export default class GenCmdListCommand extends KaikiCommand {
    public async messageRun(message: Message) {
        const list = this.generateCommmandlist();
        const stringifiedList = JSON.stringify(list, (key, value) =>
            typeof value === "bigint" ? value.toString() : value,
        4);
        
        if (!process.env.CMDLIST_URL || !process.env.SELF_API_TOKEN) {
            return message.reply({
                files: [
                    new AttachmentBuilder(
                        Buffer.from(stringifiedList, "utf-8"),
                        { name: "cmdlist.json" }
                    ),
                ],
            });
        }

        const pendingMsg = await message.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription("Uploading commandslist...")
                    .setColor(Constants.kaikiOrange),
            ],
        });

        const uri = new URL(process.env.CMDLIST_URL);

        const res = await fetch(uri, {
            method: "POST",
            body: JSON.stringify({
                token: process.env.SELF_API_TOKEN,
                list: list,
            }),
            headers: {
                "content-type": "application/json",
            },
        });

        if (res.status === 201) {
            await pendingMsg.edit({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("Successfully uploaded commands")
                        .withOkColor(message),
                ],
                files: [
                    new AttachmentBuilder(Buffer.from(stringifiedList, "utf-8"), {
                        name: "cmdlist.json",
                    }),
                ],
            });
        }
    }

    private generateCommmandlist() {
        const commands = Array.from(this.store.values());
        const { categories } = this.store;

        return categories.map((category) => {
            return [
                category,
                (commands as KaikiCommand[])
                    .filter((command) => command.category === category)
                    .map((command: KaikiCommand) =>
                        new GeneratedCommand(command)),
            ];
        })
    }
}

class GeneratedCommand {
    id: string;
    aliases: string[];
    channel?: string | undefined | PreconditionEntryResolvable;
    ownerOnly?: boolean;
    usage?: string | string[];
    userPermissions?: PermissionsString[];
    description?: string;

    constructor(command: KaikiCommand) {
        this.id = command.name;
        this.aliases = Array.from(command.aliases);
        this.channel = command.options.preconditions?.includes("GuildOnly")
            ? command.options.preconditions[
                command.options.preconditions.indexOf("GuildOnly")
            ]
            : undefined;
        this.ownerOnly = !!command.options.preconditions?.includes("OwnerOnly");
        this.usage = command.usage;
        this.userPermissions = new PermissionsBitField(
            command.options.requiredUserPermissions
        ).toArray();
        this.description = command.description;
    }
}
