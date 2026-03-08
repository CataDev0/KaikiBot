import Constants from "../struct/Constants";
import E261APIData, { E621Post } from "../lib/Interfaces/Common/E261APIData";
import KaikiUtil from "../lib/KaikiUtil";
import { DanbooruData, DanbooruPost } from "../lib/Interfaces/Common/DanbooruData";
import { SafebooruData, SafebooruPost } from "../lib/Interfaces/Common/SafebooruData";
import { UserError } from "@sapphire/framework";

export enum DAPI {
    E621,
    Danbooru,
    Safebooru,
}

export type HentaiTypes = "waifu" | "neko" | "femboy" | "trap" | "blowjob";

// noinspection FunctionNamingConventionJS
export default class HentaiService {
    protected options = {
        method: "GET",
        headers: {
            "User-Agent": `KaikiDeishuBot is a Discord bot (${Constants.LINKS.REPO_URL})`,
        },
    };

    public static readonly hentaiArray: HentaiTypes[] = [
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
        format: "bomb",
        amount?: number
    ): Promise<string[]>;
    public async grabHentai(
        type: HentaiTypes,
        format: "single" | "bomb",
        amount = 5
    ): Promise<string | string[]> {
        // This is just a renamed variable to match the API
        if (type === "femboy") type = "trap";

        if (format === "bomb") {
            const batchSize = 5;
            const batches = Math.ceil(amount / batchSize);
            const results: string[] = [];

            for (let i = 0; i < batches; i++) {
                const currentAmount = Math.min(
                    batchSize,
                    amount - results.length
                );
                const rawResponse = await fetch(
                    `https://api.waifu.pics/many/nsfw/${type}`,
                    {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ type, amount: currentAmount }),
                    }
                );
                KaikiUtil.checkResponse(rawResponse);
                const batch = await KaikiUtil.json<string[]>(rawResponse, [
                    "files",
                ]);
                results.push(...batch);
            }

            return results;
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
        type: DAPI.Safebooru
    ): Promise<SafebooruPost>;
    async makeRequest(
        tags: string[] | null,
        type: DAPI
    ): Promise<E621Post | DanbooruPost | SafebooruPost> {
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
        case DAPI.Safebooru:
            return this.safebooru(
                `https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=5&tags=${tag}`
            );
        default:
            throw new UserError({
                identifier: "UnknownAPI",
                message: "Unknown API type."
            });
        }
    }

    public async danbooru(url: RequestInfo): Promise<DanbooruPost> {
        const r = await fetch(url, this.options);

        KaikiUtil.checkResponse(r);

        const json = await KaikiUtil.json<DanbooruData>(r);

        HentaiService.checkJSONLength(json);

        return json[Math.floor(Math.random() * json.length)];
    }

    public async safebooru(url: RequestInfo): Promise<SafebooruPost> {
        const r = await fetch(url, this.options);

        KaikiUtil.checkResponse(r);

        // Safebooru returns an empty body instead of a [] when there are no results,
        // which causes JSON.parse to throw. Treat empty body as no results.
        const text = await r.text();
        const json: SafebooruData = text.trim() ? JSON.parse(text) : [];

        HentaiService.checkJSONLength(json);

        return json[Math.floor(Math.random() * json.length)];
    }

    public async e621(url: RequestInfo) {
        const r = await fetch(url, this.options);

        KaikiUtil.checkResponse(r);

        const json = await KaikiUtil.json<E261APIData>(r);

        HentaiService.checkJSONLength(json.posts);

        return json.posts[Math.floor(Math.random() * json.posts.length)];
    }

    private static checkJSONLength(json: Record<any, any>[]) {
        if (!json.length)
            throw new UserError({
                identifier: "EmptyHentaiResponse",
                message: "Your search did not amount to any results.",
            });
    }
}
