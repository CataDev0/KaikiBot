import process from "process";
import express, { Express } from "express";
import { container } from "@sapphire/pieces";
import * as Colorette from "colorette";
import KaikiSapphireClient from "../Kaiki/KaikiSapphireClient";
import { Guild } from "discord.js";
import { GETGuildBody, PUTDashboardResponse, POSTUserGuildsBody } from "kaikiwa-types";

// A class managing the Bot's webserver.
// It is intended to interact with a kaikibot.xyz dashboard
//
// It needs to send a POST req, with a specified token in the header under authorization
export class Webserver {
    private app: Express;
    private client: KaikiSapphireClient<true>;

    // Creates an express webserver and server user-data on the specified URL path
    public constructor(client: KaikiSapphireClient<true>) {
        if (!process.env.SELF_API_PORT) return;

        this.client = client;
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

        const responseObject = JSON.stringify(<POSTUserGuildsBody>{
            userData: userData,
            guildDb: guildsData,
        }, (_, value) => typeof value === "bigint" ? value.toString() : value);

        container.logger.info(`Webserver | Request successful: [${Colorette.greenBright(req.params.id)}]`);
        return res.status(200).send(responseObject);
    }

    private async GETGuild(req: express.Request, res: express.Response): Promise<express.Response<GETGuildBody>> {
        Webserver.checkValidParam(req, res);
        Webserver.verifyToken(req, res);

        const guild = container.client.guilds.cache.get(req.params.id);
        if (!guild) return res.sendStatus(404);

        const userId = req.query.userId;
        const guildId = BigInt(req.params.id);

        let dbGuild, userRoleData = null;
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
                userRoleData = { id: userRole.id, name: userRole.name, color: userRole.color, icon: userRole.icon };
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

        let ExcludeRole: { color: number; id: string; name: string } | null = null;
        if (dbGuild.ExcludeRole) {
            ExcludeRole = guild.roles.cache.get(String(dbGuild.ExcludeRole)) || null;
        }

        const roles = guild.roles.cache.map(({ color, id, name }) => ({ id, name, color }));
        const emojis = guild.emojis.cache.map(({ animated, id, name, url }) => ({ id, name, url, animated }));

        const channels = guild.channels.cache
            .filter(channel => channel.isTextBased())
            .map(channel => ({ id: channel.id, name: channel.name }));

        const guildBody = JSON.stringify(<GETGuildBody> {
            guild: {
                ...dbGuild,
                ExcludeRole,
                channels,
                emojis,
                roles
            },
            user: {
                userRole: userRoleData
            },
        }, (_, value) => typeof value === "bigint" ? value.toString() : value);

        return res.send(guildBody);
    }

    private async PUTGuildUpdate(req: express.Request, res: express.Response) {
        Webserver.checkValidParam(req, res);
        Webserver.verifyToken(req, res);

        if (!req.body) return res
            .sendStatus(400)
            .send("Missing request body");

        const { body }: { body: Partial<PUTDashboardResponse>} = req;
        const guild = this.client.guilds.cache.get(String(body.GuildId));
        const userRole = body.UserRole ? String(body.UserRole) : null;

        // Guild not found
        if (!guild) return res
            .sendStatus(404)
            .send("Guild not found");

        for (const key of Object.keys(body)) {
            const value = body[key as keyof PUTDashboardResponse];

            switch (value) {
            case "icon":
                await guild.setIcon(value);
                break;
            case "ExcludeRoleName":
                await this.SetExcludeRoleName(value, guild);
                break;
            case "name": {
                await guild.setName(value);
                break;
            }
            case "UserRoleColor":
                if (!userRole) break;
                await this.SetUserRoleColor(userRole, value, guild);
                break;
            case "UserRoleName":
                if (!userRole) break;
                await this.SetUserRoleName(userRole, value, guild);
                break;
            case "UserRoleIcon":
                if (!userRole) break;
                await this.SetUserRoleIcon(userRole, value, guild);
                break;
            // This will handle all non-special and non-guildDB parameters
            default:
                await this.client.guildsDb.set(guild.id, key, value);
                break;
            }
        }
        return res.sendStatus(200);
    }


    static checkValidParam(req: express.Request, res: express.Response) {
        if (Number.isNaN(Number(req.params.id))) {
            res.sendStatus(400);
            throw new Error("Missing request body");
        }
    }

    // Throws 401 unauthorized if token is wrong
    static verifyToken(req: express.Request, res: express.Response): void {
        if (req.headers.authorization !== process.env.SELF_API_TOKEN) {
            res.sendStatus(401);
            throw new Error("Unauthorized");
        }
    }

    private async SetExcludeRoleName(data: string | null, guild: Guild) {
        if (!data) return;
        return guild.roles.cache
            .get(this.client.guildsDb.get(guild.id, "ExcludeRole", null))
            ?.setName(data);
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
