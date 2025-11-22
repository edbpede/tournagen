import type { BracketMatch, BracketStructure } from "../../types";
import type { SingleEliminationConfig } from "../../types";

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
  const matchCount = totalSlots / 2;
  const byes = Math.max(0, totalSlots - participantCount);
  const matchesWithBye = Math.min(byes, matchCount);
  const fullMatchCount = matchCount - matchesWithBye;
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

  const participantQueue = [...config.participants];
  const firstRound = rounds[0];

  firstRound.matches.forEach((match, index) => {
    if (index < fullMatchCount) {
      match.participant1 = participantQueue.shift() ?? null;
      match.participant2 = participantQueue.shift() ?? null;
      match.isBye = false;
      return;
    }

    const soloParticipant = participantQueue.shift() ?? null;
    match.participant1 = soloParticipant;
    match.participant2 = null;
    match.isBye = soloParticipant !== null;
    match.winner = soloParticipant;
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
