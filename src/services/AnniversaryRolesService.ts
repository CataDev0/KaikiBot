import { PrismaClient } from "@prisma/client";
import { Guild, GuildMember, PermissionsBitField, Role } from "discord.js";
import Constants from "../struct/Constants";
import KaikiSapphireClient from "../lib/Kaiki/KaikiSapphireClient";

export default class AnniversaryRolesService {
    readonly client: KaikiSapphireClient<true>;
    readonly orm: PrismaClient;
    private creationdayUsers: string[] = [];
    private anniversaryUsers: string[] = [];

    constructor(client: KaikiSapphireClient<true>) {
        this.client = client;
        this.orm = client.orm;

        void this.birthdayService();
    }

    async birthdayService(): Promise<void> {
        const enabledGuilds = await this.getEnabledGuilds();
        await this.handleAnniversaryGuilds(enabledGuilds);
        this.anniversaryUsers = [];
        this.creationdayUsers = [];
    }

    private static getCurrentDate() {
        const date = new Date();
        const month = date.getMonth();
        const day = date.getDate();
        return { month, day };
    }

    async checkBirthdayOnAdd(guild: Guild): Promise<void> {
        const guildDb = await this.client.db.getOrCreateGuild(BigInt(guild.id));

        this.client.logger.info(
            `AnniversaryRolesService | Checking newly added guild ${guild.name} [${guild.id}]`
        );

        if (guildDb.Anniversary) {
            try {
                if (
                    guild.members.me?.permissions.has(
                        PermissionsBitField.Flags.ManageRoles
                    )
                ) {
                    const [anniversaryRoleCreated, anniversaryRoleJoin] = <Role[]>await this.handleGuildRoles(guild);
                    // Get roles from the result of checking if guild has the roles at all / after creating them.
                    await Promise.all(
                        guild.members.cache.map(async (member) => {
                            if (!member.user.bot) {
                                // Don't assign special roles to bots.
                                await this.memberCheckAnniversary(
                                    member,
                                    anniversaryRoleCreated,
                                    anniversaryRoleJoin
                                );
                            }
                        })
                    );
                } else {
                    return this.client.logger.warn(
                        `AnniversaryRolesService | ${guild.name} [${guild.id}] - can't add anniversary roles due to missing permissions: 'MANAGE_ROLES'`
                    );
                }
            } catch (err) {
                this.client.logger.error(err);
            } finally {
                this.client.logger.info(
                    `AnniversaryRolesService | Finished checking ${guild.name} [${guild.id}] - Anniversary is enabled`
                );
            }
        } else {
            this.client.logger.info(
                `AnniversaryRolesService | Finished checking ${guild.name} [${guild.id}] - Anniversary is disabled`
            );
        }
    }

    private async ensureRoleExists(guild: Guild, roleName: string): Promise<Role> {
        const role: Role | undefined = guild.roles.cache.find((r) => r.name === roleName)
        if (role) return role;

        return guild.roles.create({
            name: roleName,
            reason: "Role didn't exist yet"
        });
    }

    async handleGuildRoles(guild: Guild): Promise<Role[]> {

        // Ensure both required roles exist
        const [anniversaryRoleJoin, anniversaryRoleCreated] = await Promise.all([
            this.ensureRoleExists(guild, Constants.anniversaryStrings.ROLE_JOIN),
            this.ensureRoleExists(guild, Constants.anniversaryStrings.ROLE_CREATED)
        ]);

        return [anniversaryRoleCreated, anniversaryRoleJoin];
    }

    async checkAnniversaryMember(member: GuildMember): Promise<void> {
        if (member.user.bot) return;

        const { guild } = member,
            guildDb = await this.client.db.getOrCreateGuild(BigInt(guild.id));

        if (!guildDb.Anniversary) return;

        try {
            if (guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
                // Get roles from the result of checking if guild has the roles at all / after creating them.
                const [anniversaryRoleCreated, anniversaryRoleJoin] = await this.handleGuildRoles(guild);

                await this.memberCheckAnniversary(
                    member,
                    anniversaryRoleCreated,
                    anniversaryRoleJoin
                );
            }
        } catch (err) {
            this.client.logger.error(err);
        } finally {
            this.client.logger.info(
                `AnniversaryRolesService | Checked user ${member.user.username} in ${guild.name} [${guild.id}]`
            );
        }
    }

    private async memberCheckAnniversary(
        member: GuildMember,
        anniversaryRoleCreated: Role | undefined,
        anniversaryRoleJoin: Role | undefined
    ) {
        // Don't add/remove roles if roles weren't properly fetched.
        if (!anniversaryRoleCreated || !anniversaryRoleJoin) return;

        const date = AnniversaryRolesService.getCurrentDate();

        if (this.checkCakeDay(member, date)) {
            this.creationdayUsers.push(member.user.id);
            if (!member.roles.cache.has(anniversaryRoleCreated.id)) {
                await member.roles.add(anniversaryRoleCreated);
            }
        }

        if (this.checkJoinedAt(member, date)) {
            this.anniversaryUsers.push(member.user.id);
            if (!member.roles.cache.has(anniversaryRoleJoin.id)) {
                return member.roles.add(anniversaryRoleJoin);
            }
        }

        if (!this.creationdayUsers.includes(member.user.id)) {

            if (member.roles.cache.has(anniversaryRoleCreated.id)) {
                await member.roles.remove(
                    anniversaryRoleCreated.id,
                    anniversaryRoleJoin.id
                );
            }

            if (member.roles.cache.has(anniversaryRoleJoin.id)) {
                await member.roles.remove(anniversaryRoleJoin.id);
            }
        }
    }

    private checkCakeDay(member: GuildMember, { day, month }: { month: number; day: number; }) {
        return member.user.createdAt.getMonth() === month && member.user.createdAt.getDate() === day;
    }

    private checkJoinedAt(member: GuildMember, { day, month }: { month: number; day: number; }) {
        return member.joinedAt?.getMonth() === month && member.joinedAt.getFullYear() !== new Date().getFullYear() && member.joinedAt?.getDate() === day;
    }

    private async getEnabledGuilds() {
        const dbRes = await this.orm.guilds.findMany({
            where: {
                Anniversary: true,
            },
        });
        return dbRes
            .map((s) => this.client.guilds.cache.get(String(s.Id)))
            .filter((g): g is Guild => !!g);
    }

    private async handleAnniversaryGuilds(enabledGuilds: Guild[]) {
        await Promise.all(enabledGuilds.map(async (guild) => {

            // Check if perms.
            if (!guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageRoles)) return;

            const [anniversaryRoleCreated, anniversaryRoleJoin] = await this.handleGuildRoles(guild);

            await Promise.all(
                guild.members.cache.map(async (member) => {
                    // Don't assign special roles to bots.
                    if (member.user.bot) return;

                    await this.memberCheckAnniversary(
                        member,
                        anniversaryRoleCreated,
                        anniversaryRoleJoin
                    );
                })
            );
        }));
    }
}
