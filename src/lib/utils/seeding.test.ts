import { describe, expect, it } from "bun:test";
import type { Participant } from "../tournament/types";
import { applySeedingMethod } from "./seeding";

const createParticipants = (count: number): Participant[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `p-${index + 1}`,
    name: `Participant ${index + 1}`,
    seed: index + 1,
  }));

describe("applySeedingMethod", () => {
  it("places seeds using the standard bracket pattern (1 vs N)", () => {
    const participants = createParticipants(8);

    const seeded = applySeedingMethod(participants, {
      method: "seeded",
      bracketSize: 8,
    });

    const pairs = Array.from({ length: seeded.length / 2 }, (_, index) => [
      seeded[index * 2],
      seeded[index * 2 + 1],
    ]);

    const normalizedPairs = pairs
      .map(([a, b]) => [a?.seed, b?.seed].sort((left, right) => (left ?? 0) - (right ?? 0)))
      .sort((pairA, pairB) => (pairA[0] ?? 0) - (pairB[0] ?? 0));

    expect(JSON.stringify(normalizedPairs)).toBe(
      JSON.stringify([
        [1, 8],
        [2, 7],
        [3, 6],
        [4, 5],
      ]),
    );
  });

  it("gives top seeds the byes when the bracket has empty slots", () => {
    const participants = createParticipants(6);

    const seeded = applySeedingMethod(participants, {
      method: "seeded",
      bracketSize: 8,
    });

    const pairs = Array.from({ length: seeded.length / 2 }, (_, index) => [
      seeded[index * 2],
      seeded[index * 2 + 1],
    ]);

    const byeRecipients = pairs
      .filter(([a, b]) => (a === null) !== (b === null))
      .map(([a, b]) => (a ?? b)?.id);

    expect(byeRecipients.includes("p-1")).toBe(true);
    expect(byeRecipients.includes("p-2")).toBe(true);
  });

  it("respects manual ordering before filling the remaining slots by seed", () => {
    const participants = createParticipants(4);

    const seeded = applySeedingMethod(participants, {
      method: "manual",
      bracketSize: 4,
      manualOrder: ["p-3", "p-1"],
    });

    const order = seeded.map((slot) => slot?.id ?? null);

    expect(JSON.stringify(order)).toBe(
      JSON.stringify(["p-3", "p-1", "p-2", "p-4"]),
    );
  });

  it("shuffles participants with a provided random generator", () => {
    const participants = createParticipants(4);
    const randomValues = [0.2, 0.7, 0.1];
    let callIndex = 0;
    const random = () => randomValues[callIndex++] ?? 0;

    const seeded = applySeedingMethod(participants, {
      method: "random",
      bracketSize: 4,
      random,
    });

    const order = seeded.map((slot) => slot?.id ?? null);

    expect(JSON.stringify(order)).toBe(
      JSON.stringify(["p-2", "p-4", "p-3", "p-1"]),
    );
  });
});
