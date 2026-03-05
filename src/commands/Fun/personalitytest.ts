import { ApplyOptions } from "@sapphire/decorators";
import { ComponentType, EmbedBuilder, Message } from "discord.js";

import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import PersonalityTest from "../../lib/Fun/PersonalityTest";
import Constants from "../../struct/Constants";

@ApplyOptions<KaikiCommandOptions>({
    name: "personalitytest",
    aliases: ["ptest", "personality"],
    description: "Take a short personality test and discover your type!",
    usage: "",
})
export default class PersonalityTestCommand extends KaikiCommand {
    public async messageRun(message: Message) {
        const scores: Record<string, number> = {};

        for (const [index, question] of PersonalityTest.QUESTIONS.entries()) {
            const questionMessage = await message.reply({
                embeds: [PersonalityTest.buildQuestionEmbed(question, index, message)],
                components: [PersonalityTest.buildQuestionRow(question)],
            });

            const interaction = await questionMessage
                .awaitMessageComponent({
                    filter: (i) => {
                        i.deferUpdate();
                        return i.user.id === message.author.id;
                    },
                    componentType: ComponentType.Button,
                    time: Constants.MAGIC_NUMBERS.CMDS.FUN.PERSONALITY_TEST.ANSWER_TIMEOUT,
                })
                .catch(async () => {
                    await questionMessage.edit({
                        embeds: [
                            EmbedBuilder.from(questionMessage.embeds[0])
                                .setFooter({ text: "Timed out!" })
                                .withErrorColor(message),
                        ],
                        components: [],
                    });
                    return null;
                });

            await questionMessage.delete().catch(() => null);

            if (!interaction) return;

            const chosen = question.answers[Number(interaction.customId)];
            PersonalityTest.addScore(scores, chosen.type);
        }

        const result = PersonalityTest.getResult(scores);

        return message.reply({
            embeds: [await PersonalityTest.buildResultEmbed(result, message)],
        });
    }
}
