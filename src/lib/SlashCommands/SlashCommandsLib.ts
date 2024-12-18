import { Command } from "@sapphire/framework";
import {
    ChatInputApplicationCommandData,
    EmbedBuilder,
    Guild,
    InteractionContextType,
    Message,
} from "discord.js";
import KaikiEmbeds from "../Kaiki/KaikiEmbeds";
import KaikiSapphireClient from "../Kaiki/KaikiSapphireClient";

export default class SlashCommandsLib {
    static excludeData: ChatInputApplicationCommandData = {
        contexts: [InteractionContextType.Guild],
        name: "exclude",
        description:
			"Excludes you from being targeted by dad-bot. Execute command again to reverse this action.",
    };

    public static async getDbRole(
        guild: Guild,
        client: KaikiSapphireClient<true>
    ) {
        const db = await client.db.getOrCreateGuild(guild.id);
        return guild.roles.cache.get(String(db.ExcludeRole));
    }

    public static async excludeCommand(
        messageOrInteraction:
			| Message<true>
			| Command.ChatInputCommandInteraction<"cached">
    ) {
        const { guild } = messageOrInteraction;

        const embeds = [];
        let excludedRole = await SlashCommandsLib.getDbRole(
            guild,
			messageOrInteraction.client as KaikiSapphireClient<true>
        );

        if (!excludedRole) {
            excludedRole = await guild.roles.create({
                name: process.env.DADBOT_DEFAULT_ROLENAME,
                reason: "Initiate default dad-bot exclusion role.",
            });

            await guild.client.db.orm.guilds.update({
                where: {
                    Id: BigInt(guild.id),
                },
                data: {
                    ExcludeRole: BigInt(excludedRole?.id),
                },
            });

            await guild.client.guildsDb.set(
                guild.id,
                "ExcludeRole",
                excludedRole.id
            );

            embeds.push(
                new EmbedBuilder({
                    title: "Creating dad-bot role!",
                    description:
						"There doesn't seem to be a default dad-bot role in this server. Creating one...",
                    footer: { text: "Beep boop..." },
                }).withErrorColor(guild)
            );
        }

        if (!messageOrInteraction.member?.hasExcludedRole()) {
            await messageOrInteraction.member?.roles.add(excludedRole);
            embeds.push(
                KaikiEmbeds.addedRoleEmbed(excludedRole.name).withOkColor(guild)
            );
            return messageOrInteraction.reply({ embeds: embeds });
        } else {
            await messageOrInteraction.member.roles.remove(excludedRole);
            embeds.push(
                KaikiEmbeds.removedRoleEmbed(excludedRole.name).withOkColor(
                    guild
                )
            );
            return messageOrInteraction.reply({ embeds: embeds });
        }
    }
}
