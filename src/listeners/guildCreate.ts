import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import * as colorette from "colorette";
import { Guild } from "discord.js";

@ApplyOptions<ListenerOptions>({
    event: Events.GuildCreate,
})
export default class GuildCreate extends Listener {
    public async run(guild: Guild) {
        const { client } = guild;

        client.logger.info(
            `\nBot was added to ${colorette.green(guild.name)} | Size: ${guild.memberCount} members!\n`
        );

        // Re-load dad-bot channel exclusions that were evicted on guildDelete
        const excludedChannels = await client.orm.dadBotChannels.findMany({
            where: { GuildId: BigInt(guild.id) },
        });

        for (const row of excludedChannels) {
            client.dadBotChannels.items.set(String(row.ChannelId), {
                ChannelId: String(row.ChannelId),
                GuildId: String(row.GuildId),
            });
        }

        // checkBirthdayOnAdd fetches members itself when Anniversary is enabled
        await client.anniversaryService.checkBirthdayOnAdd(guild);
    }
}
