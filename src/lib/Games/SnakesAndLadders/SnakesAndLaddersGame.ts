export type Player = {
    id: string;
    username: string;
    position: number;
};

const SNAKES: Record<number, number> = {
    17: 7,
    54: 34,
    62: 19,
    64: 60,
    87: 24,
    93: 73,
    95: 75,
    99: 78,
};

const LADDERS: Record<number, number> = {
    1: 38,
    4: 14,
    9: 31,
    20: 38,
    28: 84,
    40: 59,
    51: 67,
    63: 81,
    71: 91,
};

export default class SnakesAndLaddersGame {
    public players: Player[];
    public currentPlayerIndex: number;
    public winner: Player | null;
    public lastRoll: number;
    public lastEvent: string | null;

    constructor(players: { id: string; username: string }[]) {
        this.players = players.map(p => ({ ...p, position: 0 }));
        this.currentPlayerIndex = 0;
        this.winner = null;
        this.lastRoll = 0;
        this.lastEvent = null;
    }

    get currentPlayer(): Player {
        return this.players[this.currentPlayerIndex];
    }

    rollDice(): number {
        return Math.floor(Math.random() * 6) + 1;
    }

    takeTurn(): { roll: number; newPosition: number; event: string | null; winner: Player | null } {
        const roll = this.rollDice();
        this.lastRoll = roll;
        const player = this.currentPlayer;
        let newPosition = player.position + roll;
        let event: string | null = null;

        if (newPosition > 100) {
            newPosition = player.position; // bounce back
            event = `🚫 Overshot! stays at **${player.position}**`;
        } else if (SNAKES[newPosition]) {
            const from = newPosition;
            newPosition = SNAKES[from];
            event = `🐍 Snake! slid from **${from}** → **${newPosition}**`;
        } else if (LADDERS[newPosition]) {
            const from = newPosition;
            newPosition = LADDERS[from];
            event = `🪜 Ladder! climbed from **${from}** → **${newPosition}**`;
        }

        player.position = newPosition;
        this.lastEvent = event;

        if (newPosition === 100) {
            this.winner = player;
            return { roll, newPosition, event, winner: player };
        }

        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
        return { roll, newPosition, event, winner: null };
    }

    buildBoard(): string {
        const positions = new Map<number, string[]>();
        for (const player of this.players) {
            if (!positions.has(player.position)) positions.set(player.position, []);
            positions.get(player.position)!.push(player.username[0].toUpperCase());
        }

        const rows: string[] = [];
        for (let row = 9; row >= 0; row--) {
            const cells: string[] = [];
            const leftToRight = row % 2 === 0;
            for (let col = 0; col < 10; col++) {
                const square = row * 10 + (leftToRight ? col + 1 : 10 - col);
                const occupants = positions.get(square);
                cells.push(occupants ? `[${occupants.join("")}]` : `[${String(square).padStart(2, " ")} ]`);
            }
            rows.push(cells.join(""));
        }
        return rows.join("\n");
    }
}