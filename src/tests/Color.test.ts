import { describe, expect, it } from "@jest/globals";
import { ConvertToColorResolvable } from "../lib/Color";

describe("Color", () => {
    describe("ConvertToColorResolvable", () => {
        it("returns the exact array if color is a RGBTuple", () => {
            const rgb: [number, number, number] = [255, 0, 0];
            const result = ConvertToColorResolvable(rgb);
            expect(result).toEqual([255, 0, 0]);
        });

        it("returns a Number when passed a hex string without hash", () => {
            const result = ConvertToColorResolvable("0xff0000");
            expect(result).toBe(16711680);
        });

        it("returns a Number when passed a numerical string", () => {
            const result = ConvertToColorResolvable("16711680");
            expect(result).toBe(16711680);
        });
    });
});
