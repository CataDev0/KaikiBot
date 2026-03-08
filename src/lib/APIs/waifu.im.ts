import Constants from "../../struct/Constants";
import ImageAPI from "./Common/ImageAPI";
import type { ImageAPIOptions } from "./Common/Types";

export enum EndPointSignatures {
    uniform = "uniform",
    maid = "maid",
    selfies = "selfies",
    marinKitagawa = "marin-kitagawa",
    ero = "ero",
}

export default class WaifuIm extends ImageAPI<EndPointSignatures> {
    constructor(
        imageAPIData: ImageAPIOptions<EndPointSignatures> = WaifuIm.data
    ) {
        super(imageAPIData);
    }

    static readonly data: ImageAPIOptions<EndPointSignatures> = {
        endPointData: {
            uniform: {
                action: "",
                color: Constants.hexColorTable["lightskyblue"],
            },
            maid: {
                action: "",
                color: Constants.hexColorTable["lightskyblue"],
            },
            selfies: {
                action: "",
                color: Constants.hexColorTable["lightskyblue"],
            },
            "marin-kitagawa": {
                action: "",
                color: Constants.hexColorTable["lightskyblue"],
            },
            ero: {
                action: "",
                color: Constants.hexColorTable["hotpink"],
            },
        },
        objectIndex: ["items", "0", "url"],
        url: (string: string, nsfw = false) =>
            `https://api.waifu.im/images/?IncludedTags=${string}&IsNsfw=${nsfw}&PageSize=1`,
    };
}
