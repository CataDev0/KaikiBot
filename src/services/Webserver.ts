import process from "process";
import express, { Express } from "express";
import { container } from "@sapphire/pieces";
import * as Colorette from "colorette";
import { Guild, HexColorString } from "discord.js";
import { GETGuildBody, PUTDashboardBody, POSTUserGuildsBody, POSTUserTodoAddBody , APIRole } from "kaikiwa-types";
import { JSONToMessageOptions } from "../lib/GreetHandler";
import { VoteBody } from "src/lib/Types/DiscordBotList";
import KaikiSapphireClient from "src/lib/Kaiki/KaikiSapphireClient";

// A class managing the Bot's webserver.
// It is intended to interact with a kaikibot dashboard

// Requires to send a POST req, with a specified token in the header under authorization
export class Webserver {
    private dashboard: Express;
    // DiscordBotList
    private dbl: Express;
    private DBL_API_PORT: number;
    private SELF_API_PORT: number ;
    private DBL_API_WEBHOOK_SECRET: string | undefined;

    // Creates express webservers
    // Serves user-data on the specified URL paths
    // Listens for DBL webhook
    public constructor() {
        this.SELF_API_PORT = process.env.SELF_API_PORT ? Number(process.env.SELF_API_PORT) : 3636;
        this.DBL_API_PORT = process.env.DBL_API_PORT ? Number(process.env.DBL_API_PORT) : 3635;
        this.DBL_API_WEBHOOK_SECRET = process.env.DBL_API_WEBHOOK_SECRET;

        this.dashboard = express().use(express.json())
        this.dbl = express().use(express.json())
        this.loadEndpoints()
            .then(() => {
                this.dashboard.listen(this.SELF_API_PORT)
                this.dbl.listen(this.DBL_API_PORT)
            });
        container.logger.info(`WebListener server is listening on ports: [${Colorette.greenBright(this.DBL_API_PORT)}, ${Colorette.greenBright(this.SELF_API_PORT)}]`);
    }

    private verifyTokenMiddleware(req: express.Request<{ id: string}>, res: express.Response, next: express.NextFunction) {
        Webserver.validateIdParam(req, res);
        Webserver.validateToken(req, res);
        Webserver.logRequest(req);
        next();
    }

    private async loadEndpoints() {
        const middleware = this.verifyTokenMiddleware;

        // Dashboard endpoints
        this.dashboard.get("/API/User/:id/guilds", middleware, this.GETGuilds);
        this.dashboard.delete("/API/User/:id/todo", middleware, this.DELUserTodoDelete);
        this.dashboard.post("/API/User/:id/todo", middleware, this.POSTUserTodoAdd);
        this.dashboard.get("/API/Guild/:id", middleware, this.GETGuild);
        this.dashboard.patch("/API/Guild/:id/settings", middleware, this.PATCHGuild);
        this.dashboard.get("/API/User/:id/todos", middleware, this.GETTodos);

        // DBL
        if (this.DBL_API_WEBHOOK_SECRET) {
            this.dbl.post("/API/Vote", this.POSTVote);
        }
    }


    // Handle DBL Votes
    private async POSTVote(req: express.Request, res: express.Response) {
        if (req.headers.authorization !== process.env.DBL_API_WEBHOOK_SECRET) return res.sendStatus(401);

        if (!Webserver.checkVoteBody(req.body)) return res.sendStatus(400);
        await (container.client as KaikiSapphireClient<true>).dblService.registerVote(req.body)
        return res.sendStatus(200);
    }

    // Make sure the body is correct
    private static checkVoteBody(body: any): body is VoteBody {
        return "id" in body && "username" in body;
    }

    private async GETGuilds(req: express.Request<{ id: string}>, res: express.Response): Promise<express.Response<POSTUserGuildsBody>> {

        const userId = req.params.id;
        const guildIds = req.query.ids;

        if (typeof guildIds !== "string") return res
            .status(400)
            .send("Missing required query properties (ids)");

        // Retrieve guild Ids from query 
        const guilds: bigint[] = guildIds.split(",").map(id => BigInt(id));

        // Filter out servers the bot is in, making sure to not show old guilds that might be in the DB.
        const guildsWithBot = guilds.filter(gId => container.client.guilds.cache.has(String(gId)))

        const [guildsData, userData] = await Promise.all([container.client.orm.guilds.findMany({
            select: {
                Id: true,
            },
            where: {
                Id: {
                    in: guildsWithBot
                }
            },
        }), container.client.orm.discordUsers.findUnique({
            select: {
                UserId: true,
                Amount: true,
                ClaimedDaily: true,
                DailyReminder: true,
            },
            where: {
                UserId: BigInt(userId as string)
            }
        })]);

        // Send 404 not found
        if (!userData) {
            container.logger.warn(`Webserver | Requested user was not found: [${Colorette.greenBright(req.params.id)}]`);
            return res.status(404).send("Requested user was not found");
        }

        const responseObject: POSTUserGuildsBody = {
            // Validate the types
            userData: {
                Amount: userData.Amount,
                ClaimedDaily: userData.ClaimedDaily,
                DailyReminder: userData.DailyReminder,
                UserId: userData.UserId
            },
            guildDb: guildsData,
        };

        return res.status(200).send(JSON.stringify(responseObject, (_, value) => typeof value === "bigint" ? value.toString() : value));
    }

    private static logRequest(req: express.Request<{ id: string}>) {
        container.logger.info(`Webserver | ${req.method} request @ ${req.route.path} [${Colorette.greenBright(req.params.id ? req.params.id : req.query.userId as string || "")}]`);
    }

    // Response to GET requests for guilds on the dashboard
    // Serves information, stats and data to be edited online
    private async GETGuild(req: express.Request<{ id: string}>, res: express.Response): Promise<express.Response<GETGuildBody>> {

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

            const userRole = guild.roles.cache.get(String(dbGuild?.GuildUsers.shift()?.UserRole));

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

    private async PATCHGuild(req: express.Request<{ id: string}>, res: express.Response) {

        if (!req.body) return res
            .sendStatus(400)
            .send("Missing request body");

        const { body }: { body: Partial<PUTDashboardBody> } = req;
        const guild = container.client.guilds.cache.get(String(req.params.id));
        let userRoleId = null;
        if (body.UserRole) {
            userRoleId = String(body.UserRole);
            // Remove so it wont be looped over
            delete body.UserRole;
        }

        // Guild not found
        if (!guild) return res
            .status(404)
            .send("Guild not found");

        const embedUpdates: Record<string, bigint | number | string | null> = {};

        for (const key of Object.keys(body)) {
            // All values seem to be string (coming from form input fields)
            const rawValue = body[key as keyof PUTDashboardBody] as string;
            if (!rawValue || !key) continue;

            let value;

            try {
                // if it's a snowflake, don't parse
                if (/^\d{17,20}$/.test(rawValue)) value = rawValue;
                // Parse everything else
                else value = JSON.parse(rawValue);
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
            case "name": 
                await guild.setName(value);
                break;
            case "UserRoleColor":
                if (!userRoleId) break;
                await Webserver.SetUserRoleColor(userRoleId, value, guild);
                break;
            case "UserRoleName":
                if (!userRoleId) break;
                await Webserver.SetRoleName(userRoleId, value, guild);
                break;
            case "UserRoleIcon":
                if (!userRoleId) break;
                await Webserver.SetUserRoleIcon(userRoleId, value, guild);
                break;
            case "WelcomeChannel":
            case "ByeChannel":
                embedUpdates[key] = value ? BigInt(value) : null;
                break;

            case "WelcomeTimeout":
            case "ByeTimeout":
                embedUpdates[key] = Number(value ?? 0);
                break;

            case "WelcomeMessage":
            case "ByeMessage":
                embedUpdates[key] = JSON.stringify(new JSONToMessageOptions(value));
                break;
                // This will handle all non-special and non-guildDB parameters
            default:
                await container.client.guildsDb.set(guild.id, key, value);
                break;
            }
        }

        // Batch update once
        if (Object.keys(embedUpdates).length > 0) {
            await container.client.orm.guilds.update({
                where: { Id: BigInt(req.params.id) },
                data: embedUpdates
            });
        }

        return res.sendStatus(200);
    }

    private async DELUserTodoDelete(req: express.Request, res: express.Response) {
        if (!req.query.ids) return res
            .status(400)
            .send("Missing request ids");

        const todoIdsBigIntArray = (req.query.ids! as string).split(",").map(id => BigInt(id))

        const { count } = await container.client.db.orm.todos.deleteMany({
            where: {
                Id: {
                    // Sent as string
                    in: todoIdsBigIntArray
                }
            }
        });

        if (todoIdsBigIntArray.length === count) {
            return res.sendStatus(200);
        }
        return res.status(500).send(`Not all items were deleted. Count: ${count}`)
    }

    private async POSTUserTodoAdd(req: express.Request<{ id: string}>, res: express.Response) {
        if (!req.body) return res
            .status(400)
            .send("Missing request body");

        const userId = req.params.id;
        const { body }: { body: POSTUserTodoAddBody } = req;
        const todoString = String(body.String);

        const todo = await container.client.db.orm.todos.create({
            data: {
                String: todoString,
                DiscordUsers: {
                    connect: {
                        UserId: BigInt(userId)
                    }
                }
            }
        });

        return res.send(JSON.stringify({ todo }, (_, value) => typeof value === "bigint" ? value.toString() : value));
    }

    private async GETTodos(req: express.Request<{ id: string}>, res: express.Response) {
        const userId = req.params.id;

        const todos = await container.client.db.orm.todos.findMany({
            where: {
                UserId: BigInt(userId)
            }
        });

        return res.send(JSON.stringify({ todos }, (_, value) => typeof value === "bigint" ? value.toString() : value));
    }

    static validateIdParam(req: express.Request, res: express.Response) {
        if (Number.isNaN(Number(req.params.id))) {
            res.sendStatus(400);
            throw new Error("Missing request guildId parameter");
        }
    }

    // Throws 401 unauthorized if token is wrong
    static validateToken(req: express.Request, res: express.Response): void {
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

    private static async SetUserRoleIcon(userRoleId: string, icon: string | null, guild: Guild) {
        if (!guild.features.includes("ROLE_ICONS")) return;
        return guild.roles.cache.get(userRoleId)
            ?.setIcon(icon);
    }

    private static async SetRoleName(userRoleId: string, name: string | null, guild: Guild) {
        if (!name) return;
        return guild.roles.cache.get(userRoleId)
            ?.setName(name);
    }

    private static async SetUserRoleColor(userRoleId: string, color: bigint | string | null, guild: Guild) {
        if (!color) return;
        return guild.roles.cache.get(userRoleId)
            ?.setColors({ primaryColor: color as HexColorString });
    }
}
