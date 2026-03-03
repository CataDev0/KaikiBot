import Constants from "../../struct/Constants";
import ImageAPI from "./Common/ImageAPI";
import { ImageAPIOptions } from "./Common/Types";

export enum EndpointSignatures { bite = "bite", blush = "blush", feed = "feed" }

export default class PurrBot extends ImageAPI<EndpointSignatures> {
    constructor(data: ImageAPIOptions<EndpointSignatures> = PurrBot.data) {
        super(data);
    }

    static readonly data: ImageAPIOptions<EndpointSignatures> = {
        endPointData: {
            bite: {
                action: "just bit",
                color: Constants.hexColorTable["crimson"],
                append: "!!!",
            },
            blush: {
                action: "blushed",
                color: Constants.hexColorTable["mediumorchid"],
                appendable: true,
            },
            feed: {
                action: "fed",
                color: Constants.hexColorTable["springgreen"],
                append: "🍖",
            },
        },
        url: (endPoint) => `https://purrbot.site/api/img/sfw/${endPoint}/gif`,
        objectIndex: "link",
    };
}
