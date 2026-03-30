import {
    AllFlowsPrecondition,
    Command,
    Piece,
    Result,
} from "@sapphire/framework";
import {
    ChatInputCommandInteraction,
    ContextMenuCommandInteraction,
    Message,
} from "discord.js";
import { CategoriesEnum } from "../lib/Enums/categoriesEnum";
import KaikiSapphireClient from "../lib/Kaiki/KaikiSapphireClient";
import { Categories } from "../lib/Types/Miscellaneous";

export class BlockedCategoriesPrecondition extends AllFlowsPrecondition {
    public constructor(
        context: Piece.LoaderContext<"preconditions">,
        options: AllFlowsPrecondition.Options
    ) {
        super(context, {
            ...options,
            position: 20,
        });
    }

    public override chatInputRun(
        interaction: ChatInputCommandInteraction,
        cmd: Command
    ) {
        return this.checkBlockedCategories(interaction, cmd);
    }

    public override contextMenuRun(
        interaction: ContextMenuCommandInteraction,
        cmd: Command
    ) {
        return this.checkBlockedCategories(interaction, cmd);
    }

    public override messageRun(message: Message, cmd: Command) {
        return this.checkBlockedCategories(message, cmd);
    }

    private async checkBlockedCategories(
        messageOrInteraction:
			| Message
			| ContextMenuCommandInteraction
			| ChatInputCommandInteraction,
        cmd: Command
    ) {
        if (messageOrInteraction.guildId === null || !cmd.category)
            return this.ok();

        const categoryEnum = CategoriesEnum[cmd.category as Categories];
        
        if (categoryEnum === undefined)
            return this.ok();

        const isBlocked = await Result.fromAsync(
            (
            messageOrInteraction.client as KaikiSapphireClient<true>
            ).orm.blockedCategories.findFirstOrThrow({
                where: {
                    GuildId: BigInt(messageOrInteraction.guildId),
                    CategoryTarget: categoryEnum,
                },
            }),
        );

        // SQL query failed, therefore no guild was found, therefore the guild is not banned.
        if (isBlocked.isErr()) return this.ok();

        // Guild was found, therefore it is banned.
        return this.error({ identifier: "BlockedCategory" });
    }
}
