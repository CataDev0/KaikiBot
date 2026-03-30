import { describe, expect, it } from "@jest/globals";
import KaikiUtil from "../lib/KaikiUtil";

describe("KaikiUtil", () => {
    describe("toggledTernary", () => {
        it("returns \"Enabled\" for true", () => {
            expect(KaikiUtil.toggledTernary(true)).toBe("Enabled");
        });

        it("returns \"Disabled\" for false", () => {
            expect(KaikiUtil.toggledTernary(false)).toBe("Disabled");
        });
    });

    describe("trim", () => {
        it("does not trim a string shorter than max length", () => {
            expect(KaikiUtil.trim("Hello", 10)).toBe("Hello");
            expect(KaikiUtil.trim("Hello", 5)).toBe("Hello");
        });

        it("trims a string longer than max length and appends ...", () => {
            expect(KaikiUtil.trim("Hello World", 8)).toBe("Hello...");
        });
    });

    describe("codeblock", () => {
        it("wraps text in codeblocks", async () => {
            expect(await KaikiUtil.codeblock("const a = 1;", "ts")).toBe("\`\`\`ts\nconst a = 1;\`\`\`");
            expect(await KaikiUtil.codeblock("test")).toBe("\`\`\`\ntest\`\`\`");
        });
    });

    describe("stripHtml", () => {
        it("removes html tags from a string", () => {
            expect(KaikiUtil.stripHtml("<p>Hello</p>")).toBe("Hello");
            expect(KaikiUtil.stripHtml("<div><span>World</span></div>")).toBe("World");
            expect(KaikiUtil.stripHtml("No HTML here")).toBe("No HTML here");
        });
    });

    describe("partition", () => {
        it("splits an array based on predicate", () => {
            const arr = [1, 2, 3, 4, 5, 6];
            const [evens, odds] = KaikiUtil.partition(arr, (val) => val % 2 === 0);
            expect(evens).toEqual([2, 4, 6]);
            expect(odds).toEqual([1, 3, 5]);
        });
    });

    describe("Color Converters", () => {
        it("converts hex to rgb", () => {
            expect(KaikiUtil.convertHexToRGB("#FF0000")).toEqual({ r: 255, g: 0, b: 0 });
            expect(KaikiUtil.convertHexToRGB("00FF00")).toEqual({ r: 0, g: 255, b: 0 });
            expect(KaikiUtil.convertHexToRGB("#0000FF")).toEqual({ r: 0, g: 0, b: 255 });
        });

        it("converts rgb to hex", () => {
            expect(KaikiUtil.convertRGBToHex({ r: 255, g: 0, b: 0 })).toBe("#ff0000");
            expect(KaikiUtil.convertRGBToHex({ r: 0, g: 255, b: 0 })).toBe("#00ff00");
            expect(KaikiUtil.convertRGBToHex({ r: 0, g: 0, b: 255 })).toBe("#0000ff");
        });
    });
});
