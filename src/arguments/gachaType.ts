import { Argument } from "@sapphire/framework";

export type GachaType = "waifu" | "husbando" | "random";

export default class GachaTypeArgument extends Argument<GachaType> {
    static validTypes: GachaType[] = ["waifu", "husbando", "random"];

    public run(parameter: string) {
        const str = parameter.toLowerCase();

        if (this.assertType(str)) {
            return this.ok(str);
        }

        if (str === "w") return this.ok("waifu");
        if (str === "h") return this.ok("husbando");
        if (str === "r") return this.ok("random");

        return this.error({
            parameter,
            message: `The provided argument doesn't match a valid oddity type.
Valid types are: \`${GachaTypeArgument.validTypes.join("`, `")}\` or \`w\`, \`h\`, \`r\`.`,
        });
    }

    private assertType(str: string): str is GachaType {
        return GachaTypeArgument.validTypes.includes(str as GachaType);
    }
}
