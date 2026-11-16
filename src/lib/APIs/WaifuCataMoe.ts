import Constants from "../../struct/Constants";
import ImageAPI from "./Common/ImageAPI";
import type { ImageAPIOptions } from "./Common/Types";

export enum EndPointSignatures {
    Uniform = "uniform",
    Maid = "maid",
    Selfies = "selfies",
    MarinKitagawa = "marin-kitagawa",
    Ero = "ero",
    Rem = "rem",
}

export default class WaifuCataMoe extends ImageAPI<EndPointSignatures> {
    constructor(
        imageAPIData: ImageAPIOptions<EndPointSignatures> = WaifuCataMoe.data
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
            rem: {
                action: "",
                color: Constants.hexColorTable["lightpink"],
            },
        },
        // { "items": [ { "url": "https://cdn.URL.com/123.jpg" } ] }
        objectIndex: ["items", "0", "url"],
        url: (string: string, nsfw = false) =>
            `https://api.cata.moe/images/?IncludedTags=${string}&IsNsfw=${nsfw}&PageSize=1`,
    };
}
