import Constants from "../../struct/Constants";
import ImageAPI from "./Common/ImageAPI";
import { ImageAPIOptions } from "./Common/Types";

export enum EndPointSignatures { run = "run", peek = "peek", pout = "pout", lick = "lick" }

export default class KawaiiAPI extends ImageAPI<EndPointSignatures> {
    constructor(data: ImageAPIOptions<EndPointSignatures> = KawaiiAPI.data) {
        super(data);
    }

    private static readonly token = process.env.KAWAIIKEY;

    static readonly data: ImageAPIOptions<EndPointSignatures> = {
        endPointData: {
            run: {
                action: "is running away!!",
                color: Constants.hexColorTable["chartreuse"],
                appendable: true,
            },
            peek: {
                action: "peeks",
                color: Constants.hexColorTable["papayawhip"],
                append: "👀",
                appendable: true,
            },
            pout: {
                action: "pouts",
                color: Constants.hexColorTable["darkseagreen"],
                append: "😒",
                appendable: true,
            },
            lick: {
                action: "licked",
                color: Constants.hexColorTable["mediumpurple"],
                append: "😛",
                appendable: true,
            },
        },
        url: (endPoint: EndPointSignatures) =>
            `https://kawaii.red/api/gif/${endPoint}/token=${KawaiiAPI.token}`,
        objectIndex: "response",
    };
}
