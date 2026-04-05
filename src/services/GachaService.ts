import { PrismaClient } from "@prisma/client";
import KaikiUtil from "../lib/KaikiUtil";
import Constants from "../struct/Constants";

export class GachaService {
    constructor(private orm: PrismaClient) {}

    public async rollOddity(userId: bigint, preferType: "waifu" | "husbando" | "random" = "random") {
        const CONSTS = Constants.MAGIC_NUMBERS.CMDS.GAMBLING.GACHA;

        // Roll for Rarity (1-100)
        const chance = Math.floor(Math.random() * 100) + 1;
        let rarity = 1;
        if (chance >= CONSTS.RARITY_THRESHOLDS.MYTHIC) rarity = 5;      
        else if (chance >= CONSTS.RARITY_THRESHOLDS.EPIC) rarity = 4;   
        else if (chance >= CONSTS.RARITY_THRESHOLDS.RARE) rarity = 3;   
        else if (chance >= CONSTS.RARITY_THRESHOLDS.UNCOMMON) rarity = 2; 

        return this._generateOddity(userId, preferType, rarity);
    }
    
    public async evolveOddity(userId: bigint, fromOddityId: number) {
        // Fetch the oddity they are trying to evolve
        const baseOddity = await this.orm.oddities.findFirst({
            where: { Id: fromOddityId, UserId: userId }
        });
        
        if (!baseOddity) {
            throw new Error("Oddity not found.");
        }
        
        // 5 cards needed
        if (baseOddity.Count < 5) {
            throw new Error("You need at least 5 duplicates to evolve this Oddity.");
        }
        if (baseOddity.Rarity >= 5) {
            throw new Error("Oddity is already Max Rarity (Mythic).");
        }
        
        // Decrement by 5
        if (baseOddity.Count === 5) {
            await this.orm.oddities.delete({ where: { Id: baseOddity.Id } });
        } else {
            await this.orm.oddities.update({
                where: { Id: baseOddity.Id },
                data: { Count: { decrement: 5 } }
            });
        }
        
        // Roll a new one, strictly 1 rarity higher
        const targetRarity = baseOddity.Rarity + 1;
        return this._generateOddity(userId, baseOddity.Type as "waifu" | "husbando" | "random", targetRarity);
    }

    private async _generateOddity(userId: bigint, preferType: "waifu" | "husbando" | "random", forcedRarity: number) {
        const CONSTS = Constants.MAGIC_NUMBERS.CMDS.GAMBLING.GACHA;

        // Determine actual target if random
        const targetType = preferType === "random" 
            ? (Math.random() < 0.5 ? "waifu" : "husbando") 
            : preferType;

        const rarity = forcedRarity;

        // Generate Stats based on Rarity multiplier
        const power = Math.floor(Math.random() * 100 * rarity) + (50 * rarity);
        const defense = Math.floor(Math.random() * 100 * rarity) + (40 * rarity);

        // Assign Affinity from Monogatari elements
        const affinities = CONSTS.AFFINITIES;
        const randomAffinity = affinities[Math.floor(Math.random() * affinities.length)];

        // Generate oddity Name
        const adjectives = CONSTS.ODDITY_ADJECTIVES;
        const nouns = CONSTS.ODDITY_NOUNS;
        
        let randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
        
        // Mythical Prefix Stacking
        if (rarity >= 5) {
            let secondAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
            while (secondAdjective === randomAdjective) {
                secondAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
            }
            randomAdjective = `${secondAdjective} ${randomAdjective}`;
        }
        
        const name = `${randomAdjective} ${randomNoun}`;

        // Fetch exactly ONE image from a relevant API
        let imageUrl = "";
        let attempt = 0;

        while (!imageUrl && attempt < 3) {
            try {
                if (targetType === "husbando") {
                    const response = await fetch("https://nekos.best/api/v2/husbando");
                    KaikiUtil.checkResponse(response);
                    const json = await (response.json() as Promise<any>);
                    imageUrl = json.results[0].url;
                } else {
                    const choice = Math.floor(Math.random() * 3);
                    
                    if (choice === 0) {
                        const tags = CONSTS.ODDITY_TAGS;
                        const tag = tags[Math.floor(Math.random() * tags.length)];
                        const url = `https://api.waifu.im/images?IncludedTags=${tag}&IsNsfw=false`;
                        const response = await fetch(url);
                        KaikiUtil.checkResponse(response);
                        const json = await (response.json() as Promise<any>);
                        imageUrl = json.items[0].url;
                    } else if (choice === 1) {
                        const response = await fetch("https://nekos.best/api/v2/waifu");
                        KaikiUtil.checkResponse(response);
                        const json = await (response.json() as Promise<any>);
                        imageUrl = json.results[0].url;
                    } else {
                        const response = await fetch("https://api.waifu.pics/sfw/waifu");
                        KaikiUtil.checkResponse(response);
                        const json = await (response.json() as Promise<any>);
                        imageUrl = json.url;
                    }
                }
            } catch (error) {
                attempt++;
                if (attempt >= 3) {
                    throw new Error(`Failed to parse Image API response: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        }

        // Mint it into the Database permanently, checking for duplicates first
        let newOddity = await this.orm.oddities.findFirst({
            where: {
                UserId: userId,
                ImageUrl: imageUrl
            }
        });

        let isDuplicate = false;
        
        if (newOddity) {
            // Apply Ascension scaling (+5% stats per dupe, up to a sensible limit)
            const ascensionBonusPower = Math.floor(newOddity.Power * 0.05);
            const ascensionBonusDefense = Math.floor(newOddity.Defense * 0.05);
            newOddity = await this.orm.oddities.update({
                where: { Id: newOddity.Id },
                data: {
                    Count: { increment: 1 },
                    Power: { increment: ascensionBonusPower || 1 },
                    Defense: { increment: ascensionBonusDefense || 1 }
                }
            });
            isDuplicate = true;
        } else {
            newOddity = await this.orm.oddities.create({
                data: {
                    DiscordUser: {
                        connectOrCreate: {
                            where: { UserId: userId },
                            create: { UserId: userId }
                        }
                    },
                    Name: name,
                    ImageUrl: imageUrl,
                    Rarity: rarity,
                    Power: power,
                    Defense: defense,
                    Count: 1,
                    Type: targetType,
                    Affinity: randomAffinity.id,
                }
            });
            isDuplicate = false;
        }

        return {
            ...newOddity,
            isDuplicate,
            affinityData: randomAffinity,
        };
    }
}
