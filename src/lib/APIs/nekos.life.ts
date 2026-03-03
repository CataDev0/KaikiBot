import Constants from "../../struct/Constants";
import ImageAPI from "./Common/ImageAPI";
import { ImageAPIOptions } from "./Common/Types";

export enum APIs { spank = "spank" }

export default class NekosLife extends ImageAPI<APIs> {
    constructor(data: ImageAPIOptions<APIs> = NekosLife.data) {
        super(data);
    }

    static readonly data: ImageAPIOptions<APIs> = {
        endPointData: {
            spank: {
                action: "spanked",
                color: Constants.hexColorTable["peachpuff"],
                append: "🍑👋",
            },
        },
        url: (endPoint: APIs) => `https://nekos.life/api/v2/img/${endPoint}`,
        objectIndex: "url",
    };
}
