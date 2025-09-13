import Constants from "../struct/Constants";
import E261APIData, { E621Post } from "../lib/Interfaces/Common/E261APIData";
import KaikiUtil from "../lib/KaikiUtil";
import { DanbooruData, DanbooruPost } from "../lib/Interfaces/Common/DanbooruData";
import { UserError } from "@sapphire/framework";

export enum DAPI {
	E621,
	Danbooru,
}

export type HentaiTypes = "waifu" | "neko" | "femboy" | "trap" | "blowjob";

// noinspection FunctionNamingConventionJS
export default class HentaiService {
    options = {
        method: "GET",
        headers: {
            "User-Agent": `KaikiDeishuBot is a Discord bot (${Constants.LINKS.REPO_URL})`,
        },
    };

    public static hentaiArray: HentaiTypes[] = [
        "waifu",
        "neko",
        "femboy",
        "blowjob",
    ];

    public async grabHentai(
		type: HentaiTypes,
		format: "single"
	): Promise<string>;
    public async grabHentai(
		type: HentaiTypes,
		format: "bomb"
	): Promise<string[]>;
    public async grabHentai(
        type: HentaiTypes,
        format: "single" | "bomb"
    ): Promise<string | string[]> {
        if (type === "femboy") type = "trap";

        if (format === "bomb") {
            const rawResponse = await fetch(
                `https://api.waifu.pics/many/nsfw/${type}`,
                {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ a: 1, b: "Textual content" }),
                }
            );
            KaikiUtil.checkResponse(rawResponse);
            return await KaikiUtil.json(rawResponse, ["files"]);
        }
        const response = await fetch(`https://waifu.pics/api/nsfw/${type}`);

        KaikiUtil.checkResponse(response);
        return KaikiUtil.json(response, ["url"]);
    }

    async makeRequest(
		tags: string[] | null,
		type: DAPI.E621
	): Promise<E621Post>;
    async makeRequest(
		tags: string[] | null,
		type: DAPI.Danbooru
	): Promise<DanbooruPost>;
    async makeRequest(
        tags: string[] | null,
        type: DAPI
    ): Promise<E621Post | DanbooruPost> {
        const tag = tags?.join("+").toLowerCase() || "";

        switch (type) {
        case DAPI.E621:
            return this.e621(
                `https://e621.net/posts.json?limit=5&tags=${tag}`
            );

        case DAPI.Danbooru:
            return this.danbooru(
                `https://danbooru.donmai.us/posts.json?limit=5&tags=${tag}`
            );
        }
    }

    async danbooru(url: RequestInfo): Promise<DanbooruPost> {
        const r = await fetch(url, this.options);

        KaikiUtil.checkResponse(r);

        const json = await KaikiUtil.json<DanbooruData>(r);

        HentaiService.checkJSONLength(json);

        return json[Math.round(Math.random() * json.length)];
    }

    async e621(url: RequestInfo) {
        const r = await fetch(url, this.options);

        KaikiUtil.checkResponse(r);

        const json = await KaikiUtil.json<E261APIData>(r);

        HentaiService.checkJSONLength(json.posts);

        return json.posts[Math.round(Math.random() * json.posts.length)];
    }

    private static checkJSONLength(json: Record<any, any>[]) {
        if (!json.length)
            throw new UserError({
                identifier: "EmptyHentaiResponse",
                message: "Your search did not amount to any results.",
            });
    }
}
