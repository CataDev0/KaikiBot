import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import * as colorette from "colorette";
import { Guild } from "discord.js";

@ApplyOptions<ListenerOptions>({
    event: Events.GuildDelete,
})
export default class GuildDelete extends Listener {
    public async run(guild: Guild) {
        const { client } = guild;

        client.logger.info(
            `\nBot was removed from ${colorette.red(guild.name)} [${guild.id}]\n`
        );

        // Evict per-guild memory entries so they don't accumulate over the bot's lifetime. 
        // DB rows are kept so settings survive a re-join;
        // getOrCreateGuild re-syncs guildsDb and guildCreate reloads dadBotChannels.
        client.guildsDb.items.delete(guild.id);
        client.cache.emoteReactCache.delete(guild.id);

        for (const [channelId, data] of client.dadBotChannels.items) {
            if (String((data as { GuildId?: unknown }).GuildId) === guild.id) {
                client.dadBotChannels.items.delete(channelId);
            }
        }
    }
}
