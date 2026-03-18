import { describe, it, expect } from "vitest";
import { Kineticai } from "../src/core.js";
describe("Kineticai", () => {
  it("init", () => { expect(new Kineticai().getStats().ops).toBe(0); });
  it("op", async () => { const c = new Kineticai(); await c.process(); expect(c.getStats().ops).toBe(1); });
  it("reset", async () => { const c = new Kineticai(); await c.process(); c.reset(); expect(c.getStats().ops).toBe(0); });
});
