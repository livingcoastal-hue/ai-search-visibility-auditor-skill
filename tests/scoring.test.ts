import { describe, expect, it } from "vitest";
import { scoreLabel } from "../src/audit/scoring.js";
import { normalizeUrl } from "../src/audit/url.js";

describe("score labels", () => {
  it("labels score ranges", () => {
    expect(scoreLabel(95)).toBe("AI Ready");
    expect(scoreLabel(80)).toBe("Strong");
    expect(scoreLabel(65)).toBe("Needs Improvement");
    expect(scoreLabel(45)).toBe("Weak");
    expect(scoreLabel(20)).toBe("At Risk");
  });
});

describe("URL normalization", () => {
  it("adds https and removes hash", () => {
    expect(normalizeUrl("example.com/#top")).toBe("https://example.com/");
  });
});
