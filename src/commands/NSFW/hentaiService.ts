import logger from "loglevel";
import fetch from "node-fetch";
import { Post, responseE621 } from "Interfaces/IDapi";
import KaikiUtil from "Kaiki/KaikiUtil";

const imageCache: {[id: string]: Post} = {};

export enum DapiSearchType {
	E621,
	Danbooru,
}

const options = {
    method: "GET",
    headers: {
        "User-Agent": "KaikiDeishuBot is a Discord bot (https://gitlab.com/cataclym/KaikiDeishuBot/)",
    },
};

export type types = "waifu" | "neko" | "femboy" | "trap" | "blowjob";

export const typesArray: types[] = ["waifu", "neko", "femboy", "blowjob"];

export async function grabHentai(type: types, format: "single"): Promise<string>
export async function grabHentai(type: types, format: "bomb"): Promise<string[]>
export async function grabHentai(type: types, format: "single" | "bomb"): Promise<string | string[]> {

    if (type === "femboy") type = "trap";

    if (format === "bomb") {
        const rawResponse = await fetch(`https://api.waifu.pics/many/nsfw/${type}`, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ a: 1, b: "Textual content" }),
        });
        return (await KaikiUtil.handleToJSON(await rawResponse.json()))["files"];
    }
    return (await KaikiUtil.handleToJSON(await (await fetch(`https://waifu.pics/api/nsfw/${type}`)).json()))["url"];

}

export async function DapiGrabber(tags: string[] | null, type: DapiSearchType): Promise<Post | void> {

    const tag = tags?.join("+").replace(" ", "_").toLowerCase() || "";
    let url = "";

    switch (type) {
        case DapiSearchType.E621: {
            const query = new URLSearchParams();
            query.append("tags", tag);
            query.append("limit", String(50));
            url = `https://e621.net/posts.json?${query}`;
            break;
        }
        case DapiSearchType.Danbooru: {
            url = `https://danbooru.donmai.us/posts.json?limit=100&tags=${tag}`;
            break;
        }
    }

    if (type === DapiSearchType.E621) {

        const cache = Object.values(imageCache);
        if (cache.length > 200) {
            return cache[Math.floor(Math.random() * cache.length)];
        }

        const r = (await fetch(url, options));

        if ([503, 429, 502].includes(r.status) && cache.length >= 50) {
            return cache[Math.floor(Math.random() * cache.length)];
        }

        if (!(r.status === 200)) {
            throw new Error(`Error: Fetch didnt return successful Status code\n${r.status} ${r.statusText}`);
        }

        const json = <responseE621> await r.json()
            .catch((err) => logger.error(err));

        if (Array.isArray(json)) {
            json.posts.forEach((p) => imageCache[p.id] = p);

            return json.posts[Math.floor(Math.random() * json.posts.length)];
        }

        else {
            const res = await fetch(url);
            return JSON.parse(res.body?.toString() as string).posts;
        }
    }
}
