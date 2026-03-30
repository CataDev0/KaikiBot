import { describe, expect, it, jest, beforeEach, afterEach } from "@jest/globals";
import HentaiService, { DAPI } from "../services/HentaiService";
import KaikiUtil from "../lib/KaikiUtil";
import { UserError } from "@sapphire/framework";

describe("HentaiService", () => {
    let service: HentaiService;
    let fetchSpy: any;
    let checkSpy: any;
    let jsonSpy: any;

    beforeEach(() => {
        service = new HentaiService();
        jest.clearAllMocks();
        
        fetchSpy = jest.spyOn(global, "fetch").mockResolvedValue({} as Response);
        checkSpy = jest.spyOn(KaikiUtil, "checkResponse").mockReturnValue({} as Response);
        jsonSpy = jest.spyOn(KaikiUtil, "json").mockResolvedValue([]);
    });

    afterEach(() => {
        fetchSpy.mockRestore();
        checkSpy.mockRestore();
        jsonSpy.mockRestore();
    });

    describe("makeRequest routing", () => {
        it("routes to e621 when type is E621", async () => {
            const spyE621 = jest.spyOn(service, "e621").mockResolvedValue({ id: 1 } as any);
            await service.makeRequest(["cute"], DAPI.E621);
            expect(spyE621).toHaveBeenCalledWith("https://e621.net/posts.json?limit=5&tags=cute");
        });

        it("routes to danbooru when type is Danbooru", async () => {
            const spyDanbooru = jest.spyOn(service, "danbooru").mockResolvedValue({ id: 2 } as any);
            await service.makeRequest(["cute", "anime"], DAPI.Danbooru);
            expect(spyDanbooru).toHaveBeenCalledWith("https://danbooru.donmai.us/posts.json?limit=5&tags=cute+anime");
        });

        it("routes to safebooru when type is Safebooru", async () => {
            const spySafebooru = jest.spyOn(service, "safebooru").mockResolvedValue({ id: 3 } as any);
            await service.makeRequest([], DAPI.Safebooru);
            expect(spySafebooru).toHaveBeenCalledWith("https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=5&tags=");
        });
        
        it("throws UnknownAPI if given an invalid type", async () => {
            await expect(service.makeRequest(["test"], 999 as any)).rejects.toThrow(UserError);
        });
    });

    describe("API parsing and empty checks", () => {
        it("safebooru throws UserError if search yields no results (empty string)", async () => {
            fetchSpy.mockResolvedValueOnce({
                ok: true,
                text: () => Promise.resolve(""),
            } as any);

            await expect(service.safebooru("https://safebooru.org/")).rejects.toThrow(UserError);
        });

        it("danbooru returns a random post when results exist", async () => {
            const mockResponse = [{ id: "post1" }, { id: "post2" }];
            jsonSpy.mockResolvedValueOnce(mockResponse);

            const result = await service.danbooru("https://danbooru.donmai.us/");
            expect(mockResponse).toContain(result);
        });
    });
});
