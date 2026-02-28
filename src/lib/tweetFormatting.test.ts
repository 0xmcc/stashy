import { describe, expect, it } from "vitest";
import { formatMetric } from "./tweetFormatting";

describe("formatMetric", () => {
  it("returns '0' for undefined", () => {
    expect(formatMetric(undefined)).toBe("0");
  });

  it("returns '0' for 0", () => {
    expect(formatMetric(0)).toBe("0");
  });

  it("returns plain string for values below 1000", () => {
    expect(formatMetric(999)).toBe("999");
    expect(formatMetric(1)).toBe("1");
    expect(formatMetric(42)).toBe("42");
  });

  it("formats thousands with K suffix", () => {
    expect(formatMetric(1500)).toBe("1.5K");
    expect(formatMetric(10000)).toBe("10K");
  });

  it("strips trailing .0 in thousands", () => {
    expect(formatMetric(1000)).toBe("1K");
    expect(formatMetric(2000)).toBe("2K");
    expect(formatMetric(5000)).toBe("5K");
  });

  it("formats millions with M suffix", () => {
    expect(formatMetric(1_500_000)).toBe("1.5M");
  });

  it("strips trailing .0 in millions", () => {
    expect(formatMetric(2_000_000)).toBe("2M");
    expect(formatMetric(1_000_000)).toBe("1M");
  });
});
