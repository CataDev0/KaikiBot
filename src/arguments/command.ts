import { Argument, container } from "@sapphire/framework";
import KaikiCommand from "../lib/Kaiki/KaikiCommand";

export class CommandArgument extends Argument<KaikiCommand> {
    public run(
        parameter: string,
        context: Argument.Context<KaikiCommand>
    ): Argument.AwaitableResult<KaikiCommand> {
        const cmds = container.stores.get("commands");

        const fullNameResult = cmds.find((k) => {
            const name = k.name.toLowerCase();
            const param = parameter.toLowerCase();

            if (name === param) return true;
        });

        const aliasResult = <KaikiCommand>(
			container.stores.get("commands").aliases.get(parameter.toLowerCase())
		);

        const partialResult = cmds
            .sort(
                (firstValue, secondValue) =>
                    firstValue.name.length - secondValue.name.length
            )
            .find((k) => {
                const name = k.name.toLowerCase();
                const param = parameter.toLowerCase();

                return name.startsWith(param);
            });

        if (!aliasResult && !fullNameResult && !partialResult) {
            return this.error({
                message:
					"The provided argument could not be resolved to a command.",
                parameter,
                context,
            });
        }

        return this.ok(aliasResult || fullNameResult || partialResult);
    }
}
