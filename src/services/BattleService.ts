import { Oddities } from "@prisma/client";

export type BattleLog = string[];

export interface BattleResult {
    winner: bigint;
    loser: bigint;
    log: BattleLog;
    winnerOddity: Oddities;
    loserOddity: Oddities;
}

export class BattleService {
    // Specialist > Apparition > Curse > Shikigami > Vampiric > Immortal > Specialist
    private readonly ADVANTAGES: Record<string, string> = {
        "Specialist": "Apparition",
        "Apparition": "Curse",
        "Curse": "Shikigami",
        "Shikigami": "Vampiric",
        "Vampiric": "Immortal",
        "Immortal": "Specialist"
    };

    public simulateDuel(challengerId: bigint, challengerCard: Oddities, opponentId: bigint, opponentCard: Oddities): BattleResult {
        const log: BattleLog = [];
        
        let challengerHp = challengerCard.Defense * 10;
        let opponentHp = opponentCard.Defense * 10;

        const challengerHasAdv = this.ADVANTAGES[challengerCard.Affinity] === opponentCard.Affinity;
        const opponentHasAdv = this.ADVANTAGES[opponentCard.Affinity] === challengerCard.Affinity;

        log.push(`⚔️ **${challengerCard.Name}** (${challengerHp} HP) VS **${opponentCard.Name}** (${opponentHp} HP) ⚔️`);
        
        if (challengerHasAdv) log.push(`> *${challengerCard.Name}'s ${challengerCard.Affinity} affinity gives an advantage over ${opponentCard.Affinity}!*`);
        if (opponentHasAdv) log.push(`> *${opponentCard.Name}'s ${opponentCard.Affinity} affinity gives an advantage over ${challengerCard.Affinity}!*`);
        
        log.push("");

        let turn = 1;
        while (challengerHp > 0 && opponentHp > 0 && turn <= 50) {
            // Challenger attacks
            const opponentDodges = Math.random() < 0.08; // 8% chance to dodge
            
            if (opponentDodges) {
                log.push(`**Turn ${turn}:** **${challengerCard.Name}** attacks, but **${opponentCard.Name}** dodges it with incredible speed!`);
            } else {
                let dmg1 = challengerCard.Power - Math.floor(opponentCard.Defense / 2);
                if (dmg1 < 10) dmg1 = 10 + Math.floor(Math.random() * 5); // min dmg
                if (challengerHasAdv) dmg1 = Math.floor(dmg1 * 1.2);
                
                // RNG +/- 10%
                dmg1 = Math.floor(dmg1 * (0.9 + Math.random() * 0.2));
                
                // Critical Hit (15% chance for 1.8x damage)
                const isCrit1 = Math.random() < 0.15;
                if (isCrit1) dmg1 = Math.floor(dmg1 * 1.8);

                opponentHp -= dmg1;
                const critStr = isCrit1 ? " 💥 **CRITICAL HIT!**" : "";
                log.push(`**Turn ${turn}:** **${challengerCard.Name}** strikes for **${dmg1}** damage!${critStr} (Opponent HP: ${Math.max(0, opponentHp)})`);
            }
            
            if (opponentHp <= 0) break;

            turn++;

            // Opponent attacks
            const challengerDodges = Math.random() < 0.08; // 8% chance to dodge
            
            if (challengerDodges) {
                log.push(`**Turn ${turn}:** **${opponentCard.Name}** attacks, but **${challengerCard.Name}** dodges it with incredible speed!`);
            } else {
                let dmg2 = opponentCard.Power - Math.floor(challengerCard.Defense / 2);
                if (dmg2 < 10) dmg2 = 10 + Math.floor(Math.random() * 5); // min dmg
                if (opponentHasAdv) dmg2 = Math.floor(dmg2 * 1.2);
                
                // RNG +/- 10%
                dmg2 = Math.floor(dmg2 * (0.9 + Math.random() * 0.2));
                
                // Critical Hit (15% chance for 1.8x damage)
                const isCrit2 = Math.random() < 0.15;
                if (isCrit2) dmg2 = Math.floor(dmg2 * 1.8);

                challengerHp -= dmg2;
                const critStr2 = isCrit2 ? " 💥 **CRITICAL HIT!**" : "";
                log.push(`**Turn ${turn}:** **${opponentCard.Name}** strikes back for **${dmg2}** damage!${critStr2} (Challenger HP: ${Math.max(0, challengerHp)})`);
            }
            
            turn++;
        }

        log.push("");

        const challengerWon = challengerHp > 0;
        const winner = challengerWon ? challengerId : opponentId;
        const loser = challengerWon ? opponentId : challengerId;
        const winnerOddity = challengerWon ? challengerCard : opponentCard;
        const loserOddity = challengerWon ? opponentCard : challengerCard;

        return {
            winner,
            loser,
            log,
            winnerOddity,
            loserOddity
        };
    }
}
