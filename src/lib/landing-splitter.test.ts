import { describe, expect, it } from "vitest";
import { extractUtm, pickVariant } from "./landing-splitter";

describe("landing splitter", () => {
  it("keeps the variant already assigned to a visitor", () => {
    expect(pickVariant("b", 0.01)).toBe("b");
    expect(pickVariant("a", 0.99)).toBe("a");
  });
  it("splits new visitors 50/50", () => {
    expect(pickVariant(null, 0.49)).toBe("a");
    expect(pickVariant(null, 0.5)).toBe("b");
  });
  it("forwards only tracking parameters", () => {
    expect(extractUtm("?utm_source=meta&utm_campaign=x&foo=1")).toEqual({ utm_source: "meta", utm_campaign: "x" });
  });
});
