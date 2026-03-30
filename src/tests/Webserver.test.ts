import { describe, expect, it, jest } from "@jest/globals";
import { Webserver } from "../services/Webserver";

// We only want to test pure static methods from Webserver without requiring full Express setups
describe("Webserver static methods", () => {
    describe("validateIdParam", () => {
        it("returns true for a valid number ID", () => {
            const req = { params: { id: "123456789" } } as any;
            const res = { sendStatus: jest.fn() } as any;
            expect(Webserver.validateIdParam(req, res)).toBe(true);
            expect(res.sendStatus).not.toHaveBeenCalled();
        });

        it("returns false and sends 400 for an invalid ID", () => {
            const req = { params: { id: "not-a-number" } } as any;
            const res = { sendStatus: jest.fn() } as any;
            expect(Webserver.validateIdParam(req, res)).toBe(false);
            expect(res.sendStatus).toHaveBeenCalledWith(400);
        });
    });
});
