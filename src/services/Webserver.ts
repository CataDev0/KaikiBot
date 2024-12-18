import process from "process";
import express, { Express } from "express";
import { container } from "@sapphire/pieces";
import * as Colorette from "colorette";
import { GuildUsers, Guilds } from "@prisma/client";
import KaikiSapphireClient from "../lib/Kaiki/KaikiSapphireClient";


// A class managing the Bot's webserver.
// It is intended to interact with a kaikibot.xyz dashboard
//
// It needs to send a POST req, with a specified token in the body as JSON "{ token: secret_token_here }"
export class Webserver {
    app: Express;
    client: KaikiSapphireClient<true>;
    // Creates an express webserver and server user-data on the specified URL path

    public constructor(client: KaikiSapphireClient<true>) {
        if (!process.env.SELF_API_PORT) return;

        container.logger.info(`WebListener server is listening on port: ${Colorette.greenBright(process.env.SELF_API_PORT)}`);
        this.client = client;
        this.app = express();
        this.app.use(express.json());

        for (const [endPoint, value] of Object.entries(this.EndPoints)) {
            this.app.post(endPoint, value);
        }

        this.app.listen(process.env.SELF_API_PORT)
    }

    EndPoints = {
        "/API/UserCache/:id": async (req: express.Request, res: express.Response) => {
            Webserver.checkValidParam(req, res)
            Webserver.verifyToken(req, res)

            const requestedUser = container.client.users.cache.get(req.params.id);

            // Send 404 not found
            if (!requestedUser) return res.sendStatus(404);

            const responseObject = {
                user: requestedUser,
                data: await container.client.orm.guildUsers.findMany({
                    where: {
                        UserId: BigInt(req.params.id),
                    },
                    include: {
                        Guilds: true,
                    }
                }),
                guilds: [{}],
            }

            responseObject.guilds = container.client.guilds.cache
                .filter(guild => guild.members.cache.has(requestedUser.id))
                .map(guild => {
                    const maybeUserRole = String(responseObject.data.find(gs => String(gs.GuildId) === guild.id)?.UserRole)
                    return {
                        id: guild.id,
                        name: guild.name,
                        userPerms: guild.members.cache.get(requestedUser.id)?.permissions,
                        guildChannels: guild.channels.cache.filter(channel => channel.isTextBased),
                        userRole: guild.roles.cache.has(maybeUserRole) ? guild.roles.cache.get(maybeUserRole) : null
                    }
                });

            return res.send(responseObject);
        },
        "/API/Guild/:id": async (req: express.Request, res: express.Response) => {
            Webserver.checkValidParam(req, res);
            const body = Webserver.verifyToken(req, res);

            const { data }: { data: StupidType } = body;
            const guildId = String(data.GuildId);

            for (const key of Object.keys(data)) {
                const typedKey: keyof StupidType = key as keyof StupidType;
                switch (typedKey) {
                case "Prefix":
                case "Anniversary":
                case "DadBot":
                case "ErrorColor":
                case "OkColor":
                case "WelcomeChannel":
                case "ByeChannel":
                case "WelcomeMessage":
                case "ByeMessage":
                case "WelcomeTimeout":
                case "ByeTimeout":
                case "StickyRoles":
                    await this.client.guildsDb.set(guildId, typedKey, data[typedKey]);
                    break;
                    // TODO
                    // Make fields for UserRole name, color, icon
                case "UserRole":
                    break;
                case "icon":
                    this.client.guilds.cache.get(String(guildId))?.setIcon(data[typedKey])
                    break;
                case "ExcludeRole":
                    // TODO
                    // Set type of ExcludeRole to string
                    // Or make it another field
                    await this.client.guilds.cache.get(guildId)
                        ?.roles.cache.get(this.client.guildsDb.get(guildId, "ExcludeRole", null))
                        ?.setName(data[typedKey])
                    break;
                case "name": {
                    this.client.guilds.cache.get(String(guildId))?.setName(data[typedKey])
                    break;
                }
                default:
                    break;
                }
            }
        }
    }

    static checkValidParam(req: express.Request, res: express.Response) {
        if (Number.isNaN(Number(req.params.id))) return res.sendStatus(400);
    }

    static verifyToken(req: express.Request, res: express.Response) {
        const { body } = req;
        // Verify token
        if (!body.token || body.token !== process.env.SELF_API_TOKEN) {
            return res.sendStatus(401);
        }
        return body;
    }
}

type StupidType = Omit<Guilds, "Id" | "CreatedAt"> & GuildUsers & {
        ExcludeRole: string;
        name: string;
        icon: string
    }
