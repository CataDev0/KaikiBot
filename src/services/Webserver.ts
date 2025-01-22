import process from "process";
import express, { Express } from "express";
import { container } from "@sapphire/pieces";
import * as Colorette from "colorette";
import { Guild, HexColorString } from "discord.js";
import { GETGuildBody, PUTDashboardResponse, POSTUserGuildsBody } from "kaikiwa-types";
import { APIRole } from "../../KaikiWA-Types";

// A class managing the Bot's webserver.
// It is intended to interact with a kaikibot dashboard

// Requires to send a POST req, with a specified token in the header under authorization
export class Webserver {
    private app: Express;

    // Creates an express webserver and serves user-data on the specified URL path
    public constructor() {
        if (!process.env.SELF_API_PORT) return;

        this.app = express();
        this.app.use(express.json());
        this.loadEndPoints()
            .then(() => this.app.listen(process.env.SELF_API_PORT))
        container.logger.info(`WebListener server is listening on port: ${Colorette.greenBright(process.env.SELF_API_PORT)}`);
    }

    private async loadEndPoints() {
        // Hacky way to wait for guilds to load
        await new Promise(resolve => setTimeout(resolve, 5000));

        this.app.post("/API/User/:id", this.POSTUserGuilds)
        this.app.get("/API/Guild/:id", this.GETGuild)
        // Patch potentially?
        this.app.post("/API/Guild/:id", this.PUTGuildUpdate)
    }

    private async POSTUserGuilds(req: express.Request, res: express.Response): Promise<express.Response<POSTUserGuildsBody>> {
        Webserver.checkValidParam(req, res);
        Webserver.verifyToken(req, res);
        Webserver.logRequest(req);

        const guilds: bigint[] = req.body;

        const [guildsData, userData] = await Promise.all([container.client.orm.guilds.findMany({
            select: {
                Id: true,
            },
            where: {
                Id: {
                    in: guilds
                }
            },
        }), container.client.orm.discordUsers.findUnique({
            select: {
                UserId: true,
                Amount: true,
                ClaimedDaily: true,
                DailyReminder: true
            },
            where: {
                UserId: BigInt(req.params.id)
            }
        })]);

        // Send 404 not found
        if (!userData) {
            container.logger.warn(`Webserver | Requested user was not found: [${Colorette.greenBright(req.params.id)}]`);
            return res.sendStatus(404);
        }

        const responseObject: POSTUserGuildsBody = {
            userData: userData,
            guildDb: guildsData,
        };

        return res.status(200).send(JSON.stringify(responseObject, (_, value) => typeof value === "bigint" ? value.toString() : value));
    }

    private static logRequest(req: express.Request) {
        container.logger.info(`Webserver | ${req.method} request @ ${req.route.path} [${Colorette.greenBright(req.params.id)}]`);
    }

    // Response to GET requests for guilds on the dashboard
    // Serves information, stats and data to be edited online
    private async GETGuild(req: express.Request, res: express.Response): Promise<express.Response<GETGuildBody>> {
        Webserver.checkValidParam(req, res);
        Webserver.verifyToken(req, res);
        Webserver.logRequest(req);

        const guild = container.client.guilds.cache.get(req.params.id);
        if (!guild) return res.sendStatus(404);

        const userId = req.query.userId;
        const guildId = BigInt(req.params.id);

        let dbGuild, userRoleData: APIRole | null = null;
        if (userId) {
            dbGuild = await container.client.orm.guilds.findUnique({
                where: {
                    Id: guildId
                },
                include: {
                    GuildUsers: {
                        where: {
                            UserId: BigInt(userId as string)
                        }
                    }
                }
            });

            const userRole = guild.roles.cache.get(String(dbGuild?.GuildUsers.shift()));

            if (userRole) {
                userRoleData = {
                    id: userRole.id,
                    name: userRole.name,
                    color: userRole.color,
                    icon: userRole.icon
                };
            }
        }
        else {
            dbGuild = await container.client.orm.guilds.findUnique({
                where: {
                    Id: guildId
                }
            });
        }

        if (!dbGuild) return res.sendStatus(404);

        let ExcludeRole: APIRole | null = null;

        // Try to find role if there is one in the db
        if (dbGuild.ExcludeRole) {
            const role = guild.roles.cache.get(String(dbGuild.ExcludeRole));

            if (role)
                ExcludeRole = {
                    id: role.id,
                    name: role.name,
                    color: role.color,
                    icon: role.icon
                };
        }

        const roles = guild.roles.cache.map(({ color, id, name, icon }) => ({ id, name, color, icon }));
        const emojis = guild.emojis.cache.map(({ animated, id, name, url }) => ({ id, name, url, animated }));

        const channels = guild.channels.cache
            .filter(channel => channel.isTextBased())
            .map(channel => ({ id: channel.id, name: channel.name }));

        const statsCount = {
            text: channels.length,
            voice: guild.channels.cache.filter(chan => chan.isVoiceBased()).size,
            members: guild.approximateMemberCount || guild.memberCount,
            bots: guild.members.cache.filter(memb => memb.user.bot).size,
        };

        const guildBody: GETGuildBody = {
            guild: {
                ...dbGuild,
                ExcludeRole,
                channels,
                emojis,
                roles,
                statsCount
            },
            user: {
                userRole: userRoleData
            },
        };

        return res.send(JSON.stringify(guildBody, (_, value) => typeof value === "bigint" ? value.toString() : value));
    }

    private async PUTGuildUpdate(req: express.Request, res: express.Response) {
        Webserver.checkValidParam(req, res);
        Webserver.verifyToken(req, res);
        Webserver.logRequest(req);

        if (!req.body) return res
            .sendStatus(400)
            .send("Missing request body");

        const { body }: { body: Partial<PUTDashboardResponse>} = req;
        const guild = container.client.guilds.cache.get(String(req.params.id));
        const userRole = body.UserRole ? String(body.UserRole) : null;

        // Guild not found
        if (!guild) return res
            .sendStatus(404)
            .send("Guild not found");

        for (const key of Object.keys(body)) {
            // All values seem to be string (coming from form input fields)
            const rawValue = body[key as keyof PUTDashboardResponse] as string;
            if (!rawValue || !key) continue;


            let value;

            try {
                value = JSON.parse(rawValue);
            }
            catch {
                value = rawValue;
            }

            switch (key) {
            case "icon":
                await guild.setIcon(value);
                break;
            case "excluderolename":
                await Webserver.SetExcludeRoleName(value, guild);
                break;
            case "excluderolecolor":
                await Webserver.SetExcludeRoleColor(value, guild);
                break;
            case "name": {
                await guild.setName(value);
                break;
            }
            case "userrolecolor":
                if (!userRole) break;
                await this.SetUserRoleColor(userRole, value, guild);
                break;
            case "userrolename":
                if (!userRole) break;
                await this.SetUserRoleName(userRole, value, guild);
                break;
            case "userroleicon":
                if (!userRole) break;
                await this.SetUserRoleIcon(userRole, value, guild);
                break;
                // This will handle all non-special and non-guildDB parameters
            default:
                await container.client.guildsDb.set(guild.id, key, value);
                break;
            }
        }
        return res.sendStatus(200);
    }


    static checkValidParam(req: express.Request, res: express.Response) {
        if (Number.isNaN(Number(req.params.id))) {
            res.sendStatus(400);
            throw new Error("Missing request guildId parameter");
        }
    }

    // Throws 401 unauthorized if token is wrong
    static verifyToken(req: express.Request, res: express.Response): void {
        if (req.headers.authorization !== process.env.SELF_API_TOKEN) {
            res.sendStatus(401);
            throw new Error("Unauthorized");
        }
    }

    private static async SetExcludeRoleName(data: string | null, guild: Guild) {
        if (!data) return;
        return guild.roles.cache
            .get(container.client.guildsDb.get(guild.id, "ExcludeRole", null))
            ?.setName(data);
    }

    private static async SetExcludeRoleColor(data: string | null, guild: Guild) {
        if (!data) return;
        return guild.roles.cache
            .get(container.client.guildsDb.get(guild.id, "ExcludeRole", null))
            ?.setColor(data as HexColorString);
    }

    private async SetUserRoleIcon(userRoleId: string, icon: string | null, guild: Guild) {
        if (!guild.features.includes("ROLE_ICONS")) return;
        return guild.roles.cache.get(userRoleId)
            ?.setIcon(icon);
    }

    private async SetUserRoleName(userRoleId: string, name: string | null, guild: Guild) {
        if (!name) return;
        return guild.roles.cache.get(userRoleId)
            ?.setName(name);
    }

    private async SetUserRoleColor(userRoleId: string, color: bigint | string | null, guild: Guild) {
        if (!color) return;

        return guild.roles.cache.get(userRoleId)
        //  This bigint is small enough to be accurate when converted
            ?.setColor(Number(color));
    }
}
