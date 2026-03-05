import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    Message,
} from "discord.js";
import Constants from "../../struct/Constants";
import AnilistGraphQL from "../APIs/AnilistGraphQL";

const { COLORS } = Constants.MAGIC_NUMBERS.CMDS.FUN.PERSONALITY_TEST;

export interface Answer {
    label: string;
    type: string;
}

export interface Question {
    text: string;
    answers: Answer[];
}

export interface PersonalityResult {
    title: string;
    description: string;
    color: `#${string}`;
    anilistName: string;
}

export default class PersonalityTest {

    static readonly QUESTIONS: Question[] = [
        {
            text: "It's Friday night. What are you most likely doing?",
            answers: [
                { label: "Hosting a party", type: "karen" },
                { label: "Cosy night in", type: "hitagi" },
                { label: "Out with a couple of close friends", type: "tsubasa" },
                { label: "Dramatic movie night, full live commentary", type: "tsukihi" },
                { label: "Checking in on someone who needs you", type: "nadeko" },
            ],
        },
        {
            text: "How do you usually make decisions?",
            answers: [
                { label: "Logic and facts", type: "meme" },
                { label: "Gut feeling", type: "mayoi" },
                { label: "Ask others first, then decide", type: "tsubasa" },
                { label: "You already know the answer", type: "izuko" },
                { label: "Gather information quietly, then act", type: "ougi" },
            ],
        },
        {
            text: "Which environment do you thrive in?",
            answers: [
                { label: "Fast-paced and dynamic", type: "karen" },
                { label: "Calm and structured", type: "hitagi" },
                { label: "Flexible, depends on the task", type: "meme" },
                { label: "Still and silent — complications are unwelcome", type: "yotsugi" },
                { label: "Constantly shifting — nothing is as it seems", type: "ougi" },
            ],
        },
        {
            text: "When you face a problem, you usually…",
            answers: [
                { label: "Tackle it head-on immediately", type: "karen" },
                { label: "Think it through quietly first", type: "hitagi" },
                { label: "Research before acting", type: "meme" },
                { label: "Explode first, figure it out after", type: "tsukihi" },
                { label: "You already anticipated it three steps ago", type: "izuko" },
            ],
        },
        {
            text: "Friends would most likely describe you as…",
            answers: [
                { label: "The life of the party", type: "karen" },
                { label: "The reliable one", type: "meme" },
                { label: "The empathetic listener", type: "mayoi" },
                { label: "The devoted one — possibly too devoted", type: "nadeko" },
                { label: "Unreadable — somehow still calming", type: "yotsugi" },
            ],
        },
    ];

    static readonly RESULTS: Record<string, PersonalityResult> = {
        karen: {
            title: "Araragi Karen 🔥",
            description:
                "Loud, athletic, and endlessly enthusiastic, you charge into every situation headfirst. You wear your heart on your sleeve, rally everyone around you, and wouldn't have it any other way.",
            color: COLORS.KAREN,
            anilistName: "Araragi Karen",
        },
        hitagi: {
            title: "Senjougahara Hitagi ⭐",
            description:
                "You keep your walls high and your circle small, but those who earn your trust receive an almost overwhelming loyalty. Sharp-tongued and composed, you express care in your own unconventional way.",
            color: COLORS.HITAGI,
            anilistName: "Senjougahara Hitagi",
        },
        tsubasa: {
            title: "Hanekawa Tsubasa 📚",
            description:
                "Composed and adaptable, you move easily between solitude and social settings. You project calm and competence wherever you go — though you sometimes suppress your own feelings a little too well.",
            color: COLORS.TSUBASA,
            anilistName: "Hanekawa Tsubasa",
        },
        meme: {
            title: "Oshino Meme 🚬",
            description:
                "You observe before you act, and you rarely act without a plan. Detached but deeply knowledgeable, you solve problems others can't even name — usually without breaking a sweat.",
            color: COLORS.MEME,
            anilistName: "Oshino Meme",
        },
        mayoi: {
            title: "Hachikuji Mayoi 🐌",
            description:
                "Cheerful, warm, and surprisingly perceptive, you navigate the world through connection and emotion. You leave a lasting impression on everyone you meet, even if the parting comes too soon.",
            color: COLORS.MAYOI,
            anilistName: "Hachikuji Mayoi",
        },
        tsukihi: {
            title: "Araragi Tsukihi 🔥",
            description:
                "Passionate and unpredictable, you feel everything at full volume. Your flare-ups are intense but short-lived, and underneath the dramatics is a fierce, unconditional love for the people close to you.",
            color: COLORS.TSUKIHI,
            anilistName: "Araragi Tsukihi",
        },
        yotsugi: {
            title: "Ononoki Yotsugi 🪆",
            description:
                "Deadpan, precise, and quietly dependable, you say everything with characteristic lack of intonation. You process the world differently from most — and that's exactly where your strength lies.",
            color: COLORS.YOTSUGI,
            anilistName: "Ononoki Yotsugi",
        },
        ougi: {
            title: "Oshino Ougi 🌀",
            description:
                "You draw out truths others would rather leave buried. Patient, perceptive, and a little unsettling, you always seem to know more than you let on — and you use that very deliberately.",
            color: COLORS.OUGI,
            anilistName: "Oshino Ougi",
        },
        izuko: {
            title: "Gaen Izuko 🔑",
            description:
                "Confident, calculating, and always three steps ahead. You know everything — or at least, you'd like others to think so. Either way, you rarely walk into a room without already knowing how you'll walk out.",
            color: COLORS.IZUKO,
            anilistName: "Gaen Izuko",
        },
        nadeko: {
            title: "Sengoku Nadeko 🐍",
            description:
                "Outwardly gentle and easy to overlook, your inner world runs far deeper and more intense than anyone suspects. Your devotion is absolute — which can be your greatest strength, or your most dangerous trait.",
            color: COLORS.NADEKO,
            anilistName: "Sengoku Nadeko",
        },
    };

    private static readonly FALLBACK_RESULT: PersonalityResult = {
        title: "Kaiki Deishuu 🪙",
        description:
            "Enigmatic and impossible to pin down, you defy easy categorisation. Whether that makes you a fraud or simply misunderstood is left as an exercise to the reader.",
        color: COLORS.FALLBACK,
        anilistName: "Kaiki Deishuu",
    };

    static buildQuestionRow(question: Question): ActionRowBuilder<ButtonBuilder> {
        const buttons = question.answers.map((answer, i) =>
            new ButtonBuilder()
                .setCustomId(String(i))
                .setLabel(answer.label)
                .setStyle(ButtonStyle.Primary)
        );
        return new ActionRowBuilder<ButtonBuilder>({ components: buttons });
    }

    static buildQuestionEmbed(
        question: Question,
        index: number,
        message: Message
    ): EmbedBuilder {
        return new EmbedBuilder()
            .setTitle(`Question ${index + 1} / ${PersonalityTest.QUESTIONS.length}`)
            .setDescription(question.text)
            .setFooter({ text: "You have 30 seconds to answer" })
            .withOkColor(message);
    }

    static addScore(scores: Record<string, number>, type: string): void {
        scores[type] = (scores[type] ?? 0) + 1;
    }

    static getResult(scores: Record<string, number>): PersonalityResult {
        const entries = Object.entries(scores);
        if (!entries.length) return PersonalityTest.FALLBACK_RESULT;
        const topType = entries.sort(([, a], [, b]) => b - a)[0][0];
        return PersonalityTest.RESULTS[topType] ?? PersonalityTest.FALLBACK_RESULT;
    }

    static async buildResultEmbed(
        result: PersonalityResult,
        message: Message
    ): Promise<EmbedBuilder> {
        const imageUrl = await AnilistGraphQL.fetchCharacterImage(result.anilistName);
        const embed = new EmbedBuilder()
            .setTitle(`Your result: ${result.title}`)
            .setDescription(result.description)
            .setColor(result.color)
            .setFooter({
                text: `${message.author.username}'s personality type`,
                iconURL: message.author.displayAvatarURL(),
            });
        if (imageUrl) embed.setThumbnail(imageUrl);
        return embed;
    }
}
