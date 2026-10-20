import Constants from "../../struct/Constants";
import ImageAPI from "./Common/ImageAPI";
import type { ImageAPIOptions } from "./Common/Types";

export enum EndPointSignatures {
    Uniform = "uniform",
    Maid = "maid",
    Selfies = "selfies",
    MarinKitagawa = "marin-kitagawa",
    Ero = "ero",
}

export default class CataWaifuMoe extends ImageAPI<EndPointSignatures> {
    constructor(
        imageAPIData: ImageAPIOptions<EndPointSignatures> = CataWaifuMoe.data
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
            `https://api.cata.moe/images/?IncludedTags=${string}&IsNsfw=${nsfw}&PageSize=1`,
    };
}
