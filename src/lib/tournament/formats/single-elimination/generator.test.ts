import { describe, expect, it } from "bun:test";
import {
  createDefaultSingleEliminationConfig,
} from "./config";
import { generateSingleEliminationBracket } from "./generator";
import type { Participant } from "../../types";

const createParticipants = (count: number): Participant[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `p-${index + 1}`,
    name: `Participant ${index + 1}`,
    seed: index + 1,
  }));

describe("generateSingleEliminationBracket", () => {
  it("calculates rounds based on participant count", () => {
    const config = createDefaultSingleEliminationConfig(createParticipants(6));
    const bracket = generateSingleEliminationBracket(config);

    expect(bracket.rounds.length).toBe(3);
    expect(bracket.rounds[0]?.matches.length).toBe(4);
    expect(bracket.rounds[1]?.matches.length).toBe(2);
    expect(bracket.rounds[2]?.matches.length).toBe(1);
  });

  it("marks byes and advances solo participants forward", () => {
    const config = createDefaultSingleEliminationConfig(createParticipants(6));
    const bracket = generateSingleEliminationBracket(config);
    const firstRound = bracket.rounds[0];
    const byeMatches = firstRound.matches.filter((match) => match.isBye);

    expect(byeMatches.length).toBe(2);
    byeMatches.forEach((match) => {
      expect(match.winner === null).toBe(false);
    });

    const semifinalParticipants = bracket.rounds[1]?.matches
      .flatMap((match) => [match.participant1, match.participant2])
      .filter(Boolean);

    expect((semifinalParticipants?.length ?? 0) >= 2).toBe(true);
  });

  it("links matches to the next round via feedsInto", () => {
    const config = createDefaultSingleEliminationConfig(createParticipants(8));
    const bracket = generateSingleEliminationBracket(config);

    const feedsIntoIds = bracket.rounds[0].matches.map(
      (match) => match.feedsInto,
    );

    expect(feedsIntoIds.join(",")).toBe(
      [
        "round-2-match-1",
        "round-2-match-1",
        "round-2-match-2",
        "round-2-match-2",
      ].join(","),
    );
    expect(bracket.rounds[1]?.matches[0]?.feedsInto).toBe("round-3-match-1");
    expect(
      bracket.rounds.at(-1)?.matches[0]?.feedsInto === undefined,
    ).toBe(true);
  });

  it("adds a third-place playoff when enabled", () => {
    const config = createDefaultSingleEliminationConfig(
      createParticipants(4),
      { thirdPlacePlayoff: true },
    );

    const bracket = generateSingleEliminationBracket(config);

    expect(bracket.thirdPlaceMatch).toBeDefined();
    expect(bracket.thirdPlaceMatch?.roundId).toBe("third-place");
  });

  it("omits third-place playoff when disabled", () => {
    const config = createDefaultSingleEliminationConfig(createParticipants(4));
    const bracket = generateSingleEliminationBracket(config);

    expect(bracket.thirdPlaceMatch === undefined).toBe(true);
  });

  it("applies seeded ordering so the highest seeds receive byes first", () => {
    const config = createDefaultSingleEliminationConfig(createParticipants(6));

    const bracket = generateSingleEliminationBracket({
      ...config,
      options: {
        ...config.options,
        seedingMethod: "seeded",
      },
    });

    const byeWinners = bracket.rounds[0].matches
      .filter((match) => match.isBye)
      .map((match) => match.winner?.id);

    expect(byeWinners.includes("p-1")).toBe(true);
    expect(byeWinners.includes("p-2")).toBe(true);
  });
});
