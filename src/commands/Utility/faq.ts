import { ApplyOptions } from "@sapphire/decorators";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { ActionRowBuilder, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction, ComponentType, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { ApplicationCommandRegistry } from "@sapphire/framework";
import Constants from "../../struct/Constants";

const { LINKS: { SUPPORT_SERVER, REPO_URL_ISSUES } } = Constants;

@ApplyOptions<KaikiCommandOptions>({
    name: "faq",
    aliases: ["frequent", "questions"],
    description: "Interactive FAQ containing frequently asked questions.",
    usage: "",
})
export default class FAQCommand extends KaikiCommand {
    private get FAQ_DATA() {
        return [
            {
                label: "How do I get money?",
                description: "Learn how to get rich and gamble.",
                value: "faq_economy",
                answer: `You can get ${this.client.money.currencySymbol}${this.client.money.currencyName} by claiming your \`daily\` allowance and by running the \`vote\` command.\n\nOnce you have money, you can play minigames like \`slots\`, \`betflip\` and \`betroll\` to win big!\n\nCheck out \`cash\` to see your balance.`
            },
            {
                label: "What is emotecount?",
                description: "Learn about the emote tracking feature.",
                value: "faq_emotecount",
                answer: "The bot automatically tracks every time a custom server emote is used in chat!\n\nYou can run the `{prefix}emotecount` command (or `{prefix}ec`) to see a leaderboard of the most popular emotes in the server."
            },
            {
                label: "How do I manage emotes?",
                description: "Adding and deleting custom server emotes.",
                value: "faq_manage_emotes",
                answer: "Aside from tracking emotes, you can easily add new ones to your server using `{prefix}addemote <image/URL> <name>`.\n\nYou can also remove them using `{prefix}deleteemote <emote>` *(Requires Manage Emotes permissions)*."
            },
            {
                label: "What games does the bot have?",
                description: "Explore the fun interactive commands.",
                value: "faq_games",
                answer: "The bot has fully interactive games!\n\nYou can play Tic-Tac-Toe using `{prefix}ttt <@user>` or Snakes and Ladders using `{prefix}snl`.\n\nCheck the `{prefix}cmds fun` and `{prefix}cmds gambling` categories for more!"
            },
            {
                label: "Are there image manipulation commands?",
                description: "Deepfry, squish, and more.",
                value: "faq_fun_images",
                answer: "Yes! In the Fun category, you can use commands like `{prefix}deepfry`, `{prefix}squish`, `{prefix}stretch`, and `{prefix}invert` to mess around with user avatars and other images."
            },
            {
                label: "How do interactions work?",
                description: "Hug, pat, kiss, and slap your friends.",
                value: "faq_interactions",
                answer: "You can send reactions to other users!\n\nTry running commands like `{prefix}hug @user`, `{prefix}bite`, `{prefix}kiss`, `{prefix}pat`, `{prefix}bonk`, `{prefix}slap`, etc. to show them some love!"
            },
            {
                label: "What utility commands are available?",
                description: "Weather, colors, Minecraft pings, etc.",
                value: "faq_utility",
                answer: "The bot offers many useful tools!\n\n- Check the weather with `{prefix}weather <location>`\n- View hex colors with `{prefix}color <hex>`\n- Ping Minecraft servers with `{prefix}mcping <IP>`\n- Keep a personal task list using the `{prefix}todo` command!"
            },
            {
                label: "How do I set up welcome messages?",
                description: "Configure greetings for new members.",
                value: "faq_welcome",
                answer: "You can have the bot say hi when a user joins! Set it up using the `{prefix}welcome message <message>` command (you can use `{user}` as a placeholder to ping them).\n\nDon't forget to set the channel with `{prefix}welcome channel`. Use `{prefix}help welcome` for more details."
            },
            {
                label: "How do I configure server settings?",
                description: "Toggle dadbot, sticky roles, colors, etc.",
                value: "faq_config",
                answer: "Server administrators can manage the bot in their server using the `{prefix}config` command.\n\nYou can enable or disable modules like `{prefix}dadbot`, `{prefix}anniversary` and `{prefix}sticky` roles by running `{prefix}config <module> enable`.\nYou can also change the bot's `{prefix}prefix` or customize embed colors (`okcolor` and `errorcolor`).\n\nRun `{prefix}help config` for more info on all the settings you can change!"
            },
            {
                label: "Can I use 'Owner only' commands?",
                description: "Clarification on bot vs server owner.",
                value: "faq_owner",
                answer: "No. The 'Owner only' category is strictly for the developer/owner of the *bot itself*, not server owners.\n\nThose commands are used for global bot administration and debugging."
            }, 
            {
                label: "How do I report bugs or suggest features?",
                description: "Let us know if you find any issues or have ideas!",
                value: "faq_feedback",
                answer: `If you encounter any bugs or have suggestions for new features, feel free to join the [support server](${SUPPORT_SERVER}) or write a [GitHub issue](${REPO_URL_ISSUES})!\n\nWe appreciate all input to help make the bot better for everyone.`
            },
            {
                label: "How do I delete all my data?",
                description: "Remove your personal information from the bot's database.",
                value: "faq_delete_data",
                answer: "There is a command to delete all your data from the bot. It is `{prefix}forgetme`. We take privacy seriously and this command will remove all your data from our database."
            }
        ];
    }

    public override registerApplicationCommands(registry: ApplicationCommandRegistry) {
        registry.registerChatInputCommand(
            (builder) => builder
                .setName("faq")
                .setDescription("Interactive FAQ containing frequently asked questions.")
        );
    }

    private buildMenu() {
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId("faq_menu")
            .setPlaceholder("Select a question to see the answer!")
            .addOptions(
                this.FAQ_DATA.map((item) => ({
                    label: item.label,
                    description: item.description,
                    value: item.value,
                }))
            );

        return new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    }

    private buildEmbed(interactionOrMessage: Message | ChatInputCommandInteraction, answerText?: string) {
        return new EmbedBuilder()
            .setTitle("Frequently Asked Questions")
            .setDescription(answerText || "Please select a question from the menu below to view its answer.")
            .withOkColor(interactionOrMessage.guild ?? undefined);
    }

    private async handleInteraction(response: Message, contextMsgOrInteraction: Message | ChatInputCommandInteraction) {
        const collector = response.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            time: 60000,
            filter: (i) => i.user.id === (contextMsgOrInteraction instanceof Message ? contextMsgOrInteraction.author.id : contextMsgOrInteraction.user.id)
        });

        collector.on("collect", async (interaction: StringSelectMenuInteraction) => {
            const selected = this.FAQ_DATA.find((item) => item.value === interaction.values[0]);
            if (selected) {
                await interaction.update({
                    embeds: [this.buildEmbed(contextMsgOrInteraction, `**Q:** ${selected.label}\n**A:** ${await this.formatAnswer(contextMsgOrInteraction, selected.answer)}`)],
                });
            }
        });

        collector.on("end", async () => {
            await response.edit({ components: [] }).catch(() => null);
        });
    }

    private async formatAnswer(contextMsgOrInteraction: Message | ChatInputCommandInteraction, answer: string) {
        return answer.replace(/{prefix}/g, await this.client.fetchPrefix(contextMsgOrInteraction));
    }

    public async chatInputRun(interaction: ChatInputCommandInteraction) {
        const embed = this.buildEmbed(interaction);
        const row = this.buildMenu();

        const responseMsg = await interaction.reply({
            embeds: [embed],
            components: [row],
            fetchReply: true
        });

        await this.handleInteraction(responseMsg, interaction);
    }

    public async messageRun(message: Message) {
        const embed = this.buildEmbed(message);
        const row = this.buildMenu();

        const responseMsg = await message.reply({
            options: {
                flags: [MessageFlags.Ephemeral]
            },
            embeds: [embed],
            components: [row]
        });

        await this.handleInteraction(responseMsg, message);
    }
}
