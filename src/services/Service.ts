import { PrismaClient } from "@prisma/client";
import KaikiSapphireClient from "../lib/Kaiki/KaikiSapphireClient";
import { container } from "@sapphire/framework";

export class Service {
    protected constructor(_container = container) {
        container.logger.info(`${this.constructor.name} | Service initiated`)
    }
}

export abstract class ClientService extends Service {
    constructor(protected readonly client: KaikiSapphireClient<true>) {
        super()
    }
}

export abstract class ORMService extends Service {
    constructor(protected readonly orm: PrismaClient) {
        super()
    }
}

export abstract class QualifiedService extends ClientService {
    constructor(
        client: KaikiSapphireClient<true>,
        protected readonly orm: PrismaClient,
    ) {
        super(client);
    }
}