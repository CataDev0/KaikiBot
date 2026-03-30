import { ApplyOptions } from "@sapphire/decorators";
import { Events, Listener, ListenerOptions } from "@sapphire/framework";
import { GuildMember } from "discord.js";
import GreetHandler from "../lib/GreetHandler";

@ApplyOptions<ListenerOptions>({
    event: Events.GuildMemberRemove,
})
export default class GuildMemberRemoved extends Listener {
    public async run(member: GuildMember): Promise<void> {
        const greetHandler = new GreetHandler(member);

        const guildId = BigInt(member.guild.id);
        const memberId = BigInt(member.id);

        const { client } = this.container;

        const leaveRoles = member.roles.cache.filter((role) => role.id !== member.guild.id).map((role) => {
            return client.orm.leaveRoles.create({
                data: {
                    RoleId: BigInt(role.id),
                    GuildUsers: {
                        connectOrCreate: {
                            create: {
                                UserId: memberId,
                                GuildId: guildId,
                            },
                            where: {
                                UserId_GuildId: {
                                    UserId: memberId,
                                    GuildId: guildId,
                                },
                            },
                        },
                    },
                },
            });
        });

        await Promise.all([
            client.orm.$transaction(leaveRoles),
            greetHandler.handleGoodbyeMessage(),
        ]);
    }
}
