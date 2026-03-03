import { GuildMember, Message } from "discord.js";
import APIProcessor from "../APIProcessor";
import type { ImageAPIEndPointTypes, ImageAPIOptions } from "./Types";

export default class ImageAPI<FullEndpointType extends string> {
    readonly objectIndex: string | string[];
    readonly endPoints: ImageAPIEndPointTypes<FullEndpointType>;
    readonly token: string | undefined;
    readonly url: (endPoint: FullEndpointType, nsfw?: boolean) => string;

    constructor(imageAPIData: ImageAPIOptions<FullEndpointType>) {
        this.endPoints = imageAPIData.endPointData;
        this.token = imageAPIData.token;
        this.url = imageAPIData.url;
        this.objectIndex = imageAPIData.objectIndex;
    }

    public async sendImageAPIRequest<T extends FullEndpointType>(
        message: Message,
        endPoint: T,
        mention?: GuildMember | null,
        nsfw = false
    ) {
        return message.reply({
            embeds: [
                await APIProcessor.processImageAPIRequest(
                    message,
                    this.url(endPoint, nsfw),
                    this.endPoints[endPoint],
                    this.objectIndex,
                    mention
                ),
            ],
        });
    }
}
