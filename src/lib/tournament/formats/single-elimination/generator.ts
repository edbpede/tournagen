import type { BracketMatch, BracketStructure } from "../../types";
import type { SingleEliminationConfig } from "../../types";
import { applySeedingMethod } from "../../../utils/seeding";

const MINIMUM_SLOTS = 2;

const getRoundName = (roundNumber: number, totalRounds: number): string => {
  if (totalRounds === 1) {
    return "Final";
  }

  if (roundNumber === totalRounds) {
    return "Final";
  }

  if (roundNumber === totalRounds - 1) {
    return "Semifinals";
  }

  if (roundNumber === totalRounds - 2) {
    return "Quarterfinals";
  }

  return `Round ${roundNumber}`;
};

const nextPowerOfTwo = (value: number): number => {
  if (value <= 1) {
    return 1;
  }

  return 2 ** Math.ceil(Math.log2(value));
};

const createEmptyMatch = (
  roundId: string,
  roundNumber: number,
  matchIndex: number,
  totalRounds: number,
): BracketMatch => ({
  id: `${roundId}-match-${matchIndex + 1}`,
  roundId,
  position: matchIndex + 1,
  participant1: null,
  participant2: null,
  winner: null,
  feedsInto:
    roundNumber === totalRounds
      ? undefined
      : `round-${roundNumber + 1}-match-${Math.floor(matchIndex / 2) + 1}`,
});

const applyByeAdvancement = (
  rounds: BracketStructure["rounds"],
  roundIndex: number,
) => {
  const currentRound = rounds[roundIndex];
  const nextRound = rounds[roundIndex + 1];

  currentRound.matches.forEach((match, index) => {
    if (!match.winner || !nextRound) {
      return;
    }

    const targetMatch = nextRound.matches[Math.floor(index / 2)];

    if (!targetMatch) {
      return;
    }

    if (index % 2 === 0 && targetMatch.participant1 === null) {
      targetMatch.participant1 = match.winner;
      return;
    }

    if (index % 2 === 1 && targetMatch.participant2 === null) {
      targetMatch.participant2 = match.winner;
    }
  });
};

export const generateSingleEliminationBracket = (
  config: SingleEliminationConfig,
): BracketStructure => {
  const participantCount = config.participants.length;

  if (participantCount === 0) {
    return {
      type: "bracket",
      rounds: [],
    };
  }

  const desiredSize =
    config.options.bracketSize === "auto"
      ? nextPowerOfTwo(participantCount)
      : config.options.bracketSize;

  const totalSlots = Math.max(
    MINIMUM_SLOTS,
    desiredSize,
    participantCount,
    nextPowerOfTwo(participantCount),
  );
  const totalRounds =
    participantCount < 2 ? 0 : Math.ceil(Math.log2(totalSlots));

  if (totalRounds === 0) {
    return {
      type: "bracket",
      rounds: [],
    };
  }

  const rounds = Array.from({ length: totalRounds }, (_, roundIdx) => {
    const roundNumber = roundIdx + 1;
    const roundId = `round-${roundNumber}`;
    const matchesInRound = Math.max(1, totalSlots / 2 ** roundNumber);

    const matches = Array.from({ length: matchesInRound }, (_, matchIdx) =>
      createEmptyMatch(roundId, roundNumber, matchIdx, totalRounds),
    );

    return {
      id: roundId,
      name: getRoundName(roundNumber, totalRounds),
      roundNumber,
      matches,
    };
  });

  const seededSlots = applySeedingMethod(config.participants, {
    method: config.options.seedingMethod,
    bracketSize: totalSlots,
    manualOrder: config.options.manualSeedOrder,
  });
  const firstRound = rounds[0];

  firstRound.matches.forEach((match, index) => {
    const slotIndex = index * 2;
    const participant1 = seededSlots[slotIndex] ?? null;
    const participant2 = seededSlots[slotIndex + 1] ?? null;

    match.participant1 = participant1;
    match.participant2 = participant2;

    if (participant1 && participant2) {
      match.isBye = false;
      match.winner = null;
      return;
    }

    if (!participant1 && !participant2) {
      match.isBye = false;
      match.winner = null;
      return;
    }

    match.isBye = true;
    match.winner = participant1 ?? participant2;
  });

  for (let roundIndex = 0; roundIndex < rounds.length - 1; roundIndex += 1) {
    applyByeAdvancement(rounds, roundIndex);
  }

  const thirdPlaceMatch =
    config.options.thirdPlacePlayoff && totalRounds >= 2
      ? ({
          id: "third-place",
          roundId: "third-place",
          position: 1,
          participant1: null,
          participant2: null,
          winner: null,
          isBye: false,
          feedsInto: undefined,
        } satisfies BracketMatch)
      : undefined;

  return {
    type: "bracket",
    rounds,
    thirdPlaceMatch,
  };
};
