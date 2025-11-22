import { describe, expect, it } from "bun:test";

import { colors } from "./colors";
import { breakpoints, spacing } from "./scale";
import { typography } from "./typography";

describe("design system tokens", () => {
  it("exposes a usable brand palette", () => {
    expect(colors.brand[500]).toBeDefined();
    expect(colors.brand[500]).toMatch(/^#/);
  });

  it("keeps spacing values in rem or px units", () => {
    const units = Object.values(spacing).map((value) => value.trim());
    expect(units.every((value) => value.endsWith("rem") || value.endsWith("px"))).toBe(true);
  });

  it("defines breakpoint sequence from xs upward", () => {
    expect(breakpoints.xs).toBe("480px");
    expect(breakpoints["2xl"]).toBe("1536px");
  });

  it("defines a consistent base font size", () => {
    expect(typography.fontSizes.base[0]).toBe("1rem");
  });
});
