import { describe, expect, it, beforeEach } from "@jest/globals";
import NekosBest, { APIs as NekosBestAPIs } from "../lib/APIs/NekosBest";
import NekosLife, { APIs as NekosLifeAPIs } from "../lib/APIs/nekos.life";
import CataWaifuMoe, { EndPointSignatures as WaifuImAPIs } from "../lib/APIs/CataWaifu";
import PurrBot, { EndpointSignatures as PurrBotAPIs } from "../lib/APIs/PurrBot";
import KawaiiAPI, { EndPointSignatures as KawaiiAPIs } from "../lib/APIs/KawaiiAPI";

describe("Image APIs", () => {
    describe("NekosBest", () => {
        let api: NekosBest;

        beforeEach(() => {
            api = new NekosBest();
        });

        it("should return a valid url for waifu endpoint", async () => {
            const endpoint = api.url(NekosBestAPIs.waifu);
            const response = await fetch(endpoint);
            if (!response.ok) {
                return null;
            }
            const json = await response.json();
            
            // Check objectIndex
            const val = api.objectIndex as string | string[];
            const index = (Array.isArray(val) ? val : [val]) as string[];
            const value = index.reduce((acc: any, curr: string) => acc[curr], json as any);
            expect(typeof value).toBe("string");
            expect(value.startsWith("http")).toBe(true);
        });
    });

    describe("NekosLife", () => {
        let api: NekosLife;

        beforeEach(() => {
            api = new NekosLife();
        });

        it("should return a valid url for spank endpoint", async () => {
            const endpoint = api.url(NekosLifeAPIs.spank);
            const response = await fetch(endpoint);
            if (!response.ok) {
                return null;
            }
            const json = await response.json();
            
            const index = Array.isArray(api.objectIndex) ? api.objectIndex : [api.objectIndex];
            const value = index.reduce((acc, curr) => acc[curr], json as any);
            expect(typeof value).toBe("string");
            expect(value.startsWith("http")).toBe(true);
        });
    });

    describe("WaifuIm", () => {
        let api: CataWaifuMoe;

        beforeEach(() => {
            api = new CataWaifuMoe();
        });

        it("should return a valid url for uniform endpoint", async () => {
            const endpoint = api.url(WaifuImAPIs.Uniform);
            const response = await fetch(endpoint);
            if (!response.ok) {
                return null;
            }
            const json = await response.json();
            
            const index = Array.isArray(api.objectIndex) ? api.objectIndex : [api.objectIndex];
            const value = index.reduce((acc, curr) => acc[curr], json as any);
            expect(typeof value).toBe("string");
            expect(value.startsWith("http")).toBe(true);
        });
    });

    describe("PurrBot", () => {
        let api: PurrBot;

        beforeEach(() => {
            api = new PurrBot();
        });

        it("should return a valid url for bite endpoint", async () => {
            const endpoint = api.url(PurrBotAPIs.bite);
            const response = await fetch(endpoint);
            if (!response.ok) {
                return null;
            }
            const json = await response.json();
            
            const index = Array.isArray(api.objectIndex) ? api.objectIndex : [api.objectIndex];
            const value = index.reduce((acc, curr) => acc[curr], json as any);
            expect(typeof value).toBe("string");
            expect(value.startsWith("http")).toBe(true);
        });
    });

    describe("KawaiiAPI", () => {
        let api: KawaiiAPI;

        beforeEach(() => {
            api = new KawaiiAPI();
        });

        it("should return a valid url for run endpoint when token is present", async () => {
            if (!process.env.KAWAIIKEY || process.env.KAWAIIKEY.trim() === "[YOUR_OPTIONAL_KAWAII_KEY]") {
                console.warn("Skipping KawaiiAPI test because KAWAIIKEY is not set");
                return;
            }
            const endpoint = api.url(KawaiiAPIs.run);
            const response = await fetch(endpoint);
            if (!response.ok) {
                return null;
            }
            const json = await response.json();
            
            const index = Array.isArray(api.objectIndex) ? api.objectIndex : [api.objectIndex];
            const value = index.reduce((acc, curr) => acc[curr], json as any);
            expect(typeof value).toBe("string");
            expect(value.startsWith("http")).toBe(true);
        });
    });
});