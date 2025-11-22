/// <reference types="astro/client" />

type BunTestFn = (name: string, fn: () => void | Promise<void>) => void;

declare module "bun:test" {
  export const describe: BunTestFn;
  export const it: BunTestFn;
  export const test: BunTestFn;
  // Minimal matcher surface for current tests; extend as needed.
  export function expect(actual: unknown): {
    toBe(expected: unknown): void;
    toBeDefined(): void;
    toMatch(expected: string | RegExp): void;
  };
}
