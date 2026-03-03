import { PrismaClient } from "@prisma/client";
import { container } from "@sapphire/framework";

export class MoneyService {
    public currencyName!: string;
    public currencySymbol!: string;
    private orm: PrismaClient;

    constructor(connection: PrismaClient) {
        this.orm = connection;
    }

    public async init() {
        const botSettings = await this.orm.botSettings.findFirst();
        if (!botSettings)
            throw new Error("Missing row in BotSettings table!");
        this.currencyName = botSettings.CurrencyName;
        this.currencySymbol = botSettings.CurrencySymbol;
        return this;
    }

    public async get(id: string): Promise<bigint> {
        const query = await this.orm.discordUsers.upsert({
            where: { UserId: BigInt(id) },
            create: {
                UserId: BigInt(id),
            },
            update: {},
            select: { Amount: true }
        });

        return query.Amount;
    }

    public async add(id: string, amount: bigint, reason: string): Promise<bigint> {
        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        const bIntId = BigInt(id);

        this.recordTransaction(bIntId, amount, reason);

        const query = await this.orm.discordUsers.upsert({
            where: { UserId: bIntId },
            update: { Amount: { increment: amount } },
            create: { UserId: bIntId, Amount: amount },
        });
        return query.Amount;
    }

    public async tryTake(
        id: string,
        amount: bigint,
        reason: string
    ): Promise<boolean> {
        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        const bIntId = BigInt(id);
        const currentAmount = await this.orm.discordUsers.findFirst({
            select: { Amount: true },
            where: { UserId: bIntId },
        });

        if (currentAmount && currentAmount.Amount >= amount) {
            this.recordTransaction(bIntId, -amount, reason);
            await this.orm.discordUsers.update({
                where: {
                    UserId: bIntId,
                },
                data: {
                    Amount: { decrement: amount },
                },
            });
            return true;
        } else if (!currentAmount) {
            // User row doesn't exist yet — create it, but don't record a
            // debit transaction since the take did not succeed.
            await this.orm.discordUsers.create({
                data: { UserId: bIntId },
            });
        }
        return false;
    }

    private recordTransaction(id: bigint, amount: bigint, reason: string): void {
        void this.orm.currencyTransactions.create({
            data: {
                UserId: id,
                Amount: amount,
                Reason: reason,
            },
        }).catch(e => container.client.logger.error(`Currency transaction failed: ${e}`));
    }
}
