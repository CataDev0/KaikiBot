import { ApplyOptions } from "@sapphire/decorators";
import KaikiCommandOptions from "../../lib/Interfaces/Kaiki/KaikiCommandOptions";
import KaikiCommand from "../../lib/Kaiki/KaikiCommand";
import { ActionRowBuilder, EmbedBuilder, Message, StringSelectMenuBuilder, StringSelectMenuInteraction, ComponentType, ChatInputCommandInteraction, MessageFlags } from "discord.js";
import { ApplicationCommandRegistry } from "@sapphire/framework";

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
                answer: "The bot automatically tracks every time a custom server emote is used in chat!\n\nYou can run the `emotecount` command (or `ec`) to see a leaderboard of the most popular emotes in the server."
            },
            {
                label: "How do I manage emotes?",
                description: "Adding and deleting custom server emotes.",
                value: "faq_manage_emotes",
                answer: "Aside from tracking emotes, you can easily add new ones to your server using `addemote <image/URL> <name>`.\n\nYou can also remove them using `deleteemote <emote>` *(Requires Manage Emotes permissions)*."
            },
            {
                label: "What games does the bot have?",
                description: "Explore the fun interactive commands.",
                value: "faq_games",
                answer: "The bot has fully interactive games!\n\nYou can play Tic-Tac-Toe using `ttt <@user>` or Snakes and Ladders using `snakesandladders`.\n\nCheck the `cmds fun` and `cmds gambling` categories for more!"
            },
            {
                label: "Are there image manipulation commands?",
                description: "Deepfry, squish, and more.",
                value: "faq_fun_images",
                answer: "Yes! In the Fun category, you can use commands like `deepfry`, `squish`, `stretch`, and `invert` to mess around with user avatars and other images."
            },
            {
                label: "How do interactions work?",
                description: "Hug, pat, kiss, and slap your friends.",
                value: "faq_interactions",
                answer: "You can send reactions to other users!\n\nTry running commands like `hug @user`, `bite`, `kiss`, `pat`, `bonk`, `slap`, etc. to show them some love!"
            },
            {
                label: "What utility commands are available?",
                description: "Weather, colors, Minecraft pings, etc.",
                value: "faq_utility",
                answer: "The bot offers many useful tools!\n\n- Check the weather with `weather <location>`\n- View hex colors with `color <hex>`\n- Ping Minecraft servers with `mcping <IP>`\n- Keep a personal task list using the `todo` command!"
            },
            {
                label: "How do I set up welcome messages?",
                description: "Configure greetings for new members.",
                value: "faq_welcome",
                answer: "You can have the bot say hi when a user joins! Set it up using the `welcome message <message>` command (you can use `{user}` as a placeholder to ping them).\n\nDon't forget to set the channel with `welcome channel`. Use `help welcome` for more details."
            },
            {
                label: "How do I configure server settings?",
                description: "Toggle dadbot, sticky roles, colors, etc.",
                value: "faq_config",
                answer: "Server administrators can manage the bot in their server using the `config` command.\n\nYou can enable or disable modules like `dadbot`, `anniversary` and `sticky` roles by running `config <module> enable`.\nYou can also change the bot's `prefix` or customize embed colors (`okcolor` and `errorcolor`).\n\nRun `help config` for more info on all the settings you can change!"
            },
            {
                label: "Can I use 'Owner only' commands?",
                description: "Clarification on bot vs server owner.",
                value: "faq_owner",
                answer: "No. The 'Owner only' category is strictly for the developer/owner of the *bot itself*, not server owners.\n\nThose commands are used for global bot administration and debugging."
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
                    embeds: [this.buildEmbed(contextMsgOrInteraction, `**Q:** ${selected.label}\n**A:** ${selected.answer}`)],
                });
            }
        });

        collector.on("end", async () => {
            await response.edit({ components: [] }).catch(() => null);
        });
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
