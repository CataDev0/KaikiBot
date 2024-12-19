import { EmbedBuilder, GuildMember, Message } from "discord.js";
import Constants from "../../struct/Constants";

type PlayerType = { player: GuildMember; color: string; sign: Sign };

enum Sign {
    PLAYER1 = 1,
    PLAYER2
}

export default class TicTacToe {
    private readonly pOne: PlayerType;
    private readonly pTwo: PlayerType;
    private currentPlayer: PlayerType;
    private message: Message<true>;
    private embed: Promise<Message<true>>;
    private readonly currentPlayerTurn: (p: GuildMember, m: Message) => Promise<void>;
    private readonly winningMessage: (p: GuildMember) => string;
    private readonly timedWinMessage: (p: GuildMember) => string;
    private readonly stateDict: { [index: number]: number | Sign };
    private active: boolean;
    private static tieMessage = "Game ended, it's a tie!";
    private static numbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
    private static winningCombos = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    private static emojiIndex: {[index: number]: string} = {
        0: "1️⃣",
        1: "2️⃣",
        2: "3️⃣",
        3: "4️⃣",
        4: "5️⃣",
        5: "6️⃣",
        6: "7️⃣",
        7: "8️⃣",
        8: "9️⃣",
    };

    /**
	 * Initializes a TicTacToe game.
	 * @param playerOne @type {GuildMember}
	 * @param playerTwo @type {GuildMember}
	 * @param message @type {Message}
	 */

    constructor(
        playerOne: GuildMember,
        playerTwo: GuildMember,
        message: Message<true>
    ) {
        this.pOne = { player: playerOne, color: "78b159", sign: Sign.PLAYER1 };
        this.pTwo = { player: playerTwo, color: "dd2e44", sign: Sign.PLAYER2 };
        this.currentPlayer = this.pTwo;
        this.message = message;
        this.stateDict = {
            0: 0,
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
            6: 0,
            7: 0,
            8: 0,
        };

        this.active = true;

        this.start();

        this.embed = this.message.reply({
            content: `${this.pTwo.player} starts!`,
            embeds: [
                new EmbedBuilder({
                    description: Object.values(this.stateDict)
                        .map((_, i) => TicTacToe.emojiIndex[i])
                        .map((v, i) => ([2, 5].includes(i) ? v + "\n" : v))
                        .join(""),
                    color: parseInt(this.pTwo.color, 16),
                }),
            ],
        });

        this.currentPlayerTurn = async (p: GuildMember, m: Message) =>
            this.message.reply(`It's ${p}'s turn`).then(async (m2) => {
                setTimeout(
                    async () => m.delete(),
                    Constants.MAGIC_NUMBERS.LIB.GAMES.TTT.MSG_DEL_TIMEOUT
                );
                setTimeout(
                    async () => m2.delete(),
                    Constants.MAGIC_NUMBERS.LIB.GAMES.TTT.MSG_DEL_TIMEOUT
                );
            });
        this.winningMessage = (p: GuildMember) => `Player ${p} has won!`;
        this.timedWinMessage = (p: GuildMember) =>
            `Player ${p} didn't make a move for 30 seconds, making <@${p.id !== this.pOne.player.id ? this.pOne.player.id : this.pTwo.player.id}> the winner.`;
    }

    private start() {
        void this.awaitInput(this.pTwo);
    }

    private async awaitInput(playerObject: PlayerType) {
        if (!this.active) return;

        const { player } = playerObject;

        const filter = (m: Message<true>) =>
            TicTacToe.numbers.includes(m.content) && m.member?.id === player.id;

        this.message.channel
            .awaitMessages({
                filter,
                max: 1,
                time: 30000,
                errors: ["time"],
            })
            .then((collected) => {
                const msg = collected.first();
                if (!msg) return;
                return this.input(playerObject, msg);
            })
            .catch(() => {
                this.timedWin(playerObject);
            });
    }

    private async input(playerObject: PlayerType, m: Message) {
        const { player, sign } = playerObject;

        if (!TicTacToe.numbers.includes(m.content.trim())) {
            await m.delete();
            return this.awaitInput(playerObject);
        }

        const int = parseInt(m.content) - 1;

        if (this.stateDict[int] === Sign.PLAYER1 || this.stateDict[int] === Sign.PLAYER2) {
            await m.delete();
            return this.awaitInput(playerObject);
        }

        this.stateDict[int] = sign;
        this.currentPlayer =
			player.id !== this.pOne.player.id ? this.pOne : this.pTwo;

        await this.updateEmbed(this.currentPlayer);

        if (this.checkWin(sign)) {
            return this.win(playerObject);
        }

        else if (this.checkTie()) {
            return this.tie();
        }

        await this.currentPlayerTurn(this.currentPlayer.player, m);

        return this.awaitInput(this.currentPlayer);
    }

    private async updateEmbed(
        playerObject: PlayerType
    ): Promise<Message> {
        const finalString = `It's ${playerObject.player}'s turn to make a move.`;
        const finalEmbed = new EmbedBuilder({
            description: Object.values(this.stateDict)
                .map((v, i) => v === 0
                    ? TicTacToe.emojiIndex[i]
                    : String(v)
                        .replace(/1/g, "🟩")
                        .replace(/2/g, "🟥"))
                .map((v, i) => ([2, 5].includes(i) ? v + "\n" : v))
                .join(""),
            color: parseInt(playerObject.color, 16),
        });
        return (await this.embed).edit({
            content: finalString,
            embeds: [finalEmbed],
        });
    }

    private checkWin(value: Sign) {
        return TicTacToe.winningCombos.some((arr) => {
            return arr.every((num) => this.stateDict[num] === value);
        });
    }

    private checkTie() {
        return Object.values(this.stateDict).every((str) => {
            return str === Sign.PLAYER1 || str === Sign.PLAYER2;
        });
    }

    private win(winner: PlayerType) {
        if (this.active) {
            this.active = false;
            return this.message.reply(
                this.winningMessage(winner.player)
            );
        }
    }

    private timedWin(loser: PlayerType) {
        if (this.active) {
            this.active = false;
            return this.message.reply(
                this.timedWinMessage(loser.player)
            );
        }
    }

    private tie() {
        if (this.active) {
            this.active = false;
            return this.message.reply(TicTacToe.tieMessage);
        }
    }
}
