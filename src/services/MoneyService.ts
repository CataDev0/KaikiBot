import { PrismaClient } from "@prisma/client";
import Constants from "../struct/Constants";

export class MoneyService {
    currencyName: string;
    currencySymbol: string;
    private orm: PrismaClient;
    constructor(connection: PrismaClient) {
        this.orm = connection;
        (async () => {
            const botSettings = await this.orm.botSettings.findFirst();

            if (!botSettings)
                throw new Error("Missing row in BotSettings table!");

            this.currencyName = botSettings.CurrencyName;
            this.currencySymbol = botSettings.CurrencySymbol;
        })();
    }

    async get(id: string): Promise<bigint> {
        const query = await this.orm.discordUsers.findFirst({
            select: { Amount: true },
            where: { UserId: BigInt(id) },
        });

        if (query) {
            return query.Amount;
        }
        await this.orm.discordUsers.create({ data: { UserId: BigInt(id) } });
        return Constants.MAGIC_NUMBERS.LIB.MONEY.MONEY_SERVICE.BIGINT_ZERO;
    }

    async add(id: string, amount: bigint, reason: string): Promise<bigint> {
        if (amount <= 0) {
            throw new Error("Amount must be greater than 0");
        }

        const bIntId = BigInt(id);

        this.lazyCreateCurrencyTransactions(bIntId, amount, reason);

        const query = await this.orm.discordUsers.upsert({
            where: { UserId: bIntId },
            update: { Amount: { increment: amount } },
            create: { UserId: bIntId, Amount: amount },
        });
        return query.Amount;
    }

    async tryTake(
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
            this.lazyCreateCurrencyTransactions(bIntId, -amount, reason);
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
            this.lazyCreateCurrencyTransactions(bIntId, amount, reason);
            await this.orm.discordUsers.create({
                data: { UserId: bIntId },
            });
        }
        return false;
    }

    lazyCreateCurrencyTransactions(id: bigint, amount: bigint, reason: string) {
        return setTimeout(async () => {
            await this.orm.currencyTransactions.create({
                data: {
                    UserId: id,
                    Amount: amount,
                    Reason: reason,
                },
            });
        }, 0);
    }
}
