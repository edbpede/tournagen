import type {
  Participant,
  SingleEliminationSeedingMethod,
} from "../tournament/types";

export interface ApplySeedingOptions {
  method: SingleEliminationSeedingMethod;
  bracketSize?: number;
  manualOrder?: readonly string[];
  /**
   * Optional random generator used for deterministic testing.
   */
  random?: () => number;
}

const nextPowerOfTwo = (value: number): number => {
  if (value <= 1) {
    return 1;
  }

  return 2 ** Math.ceil(Math.log2(value));
};

const buildSeedSlotOrder = (slotCount: number): number[] => {
  if (slotCount <= 1) {
    return [1];
  }

  let order = [1, 2];

  while (order.length < slotCount) {
    const nextSize = order.length * 2;
    const expanded: number[] = [];

    for (const seed of order) {
      expanded.push(seed);
      expanded.push(nextSize + 1 - seed);
    }

    order = expanded;
  }

  return order.slice(0, slotCount);
};

const shuffleParticipants = (
  participants: readonly Participant[],
  randomFn: () => number,
): Participant[] => {
  const result = [...participants];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(randomFn() * (i + 1));
    [result[i], result[j]] = [result[j] as Participant, result[i] as Participant];
  }

  return result;
};

const deriveSeed = (participant: Participant, index: number): number =>
  participant.seed ?? index + 1;

const sortByDerivedSeed = (
  participants: readonly Participant[],
): Participant[] => {
  return participants
    .map((participant, index) => ({
      participant,
      seed: deriveSeed(participant, index),
      index,
    }))
    .sort((a, b) => {
      if (a.seed !== b.seed) {
        return a.seed - b.seed;
      }

      return a.index - b.index;
    })
    .map((entry) => entry.participant);
};

const applySeededPlacement = (
  participants: readonly Participant[],
  bracketSize: number,
): (Participant | null)[] => {
  const slots: (Participant | null)[] = Array.from(
    { length: bracketSize },
    () => null,
  );
  const seedOrder = buildSeedSlotOrder(bracketSize);
  const seedToSlot = new Map<number, number>();

  seedOrder.forEach((seed, slotIndex) => {
    seedToSlot.set(seed, slotIndex);
  });

  const rankedParticipants = sortByDerivedSeed(participants);

  rankedParticipants.forEach((participant, index) => {
    const seedNumber = deriveSeed(participant, index);
    const preferredSlot = seedToSlot.get(seedNumber);

    if (preferredSlot !== undefined && slots[preferredSlot] === null) {
      slots[preferredSlot] = participant;
      return;
    }

    const fallbackSlot = slots.findIndex((slot) => slot === null);

    if (fallbackSlot !== -1) {
      slots[fallbackSlot] = participant;
    }
  });

  return slots;
};

const applyManualPlacement = (
  participants: readonly Participant[],
  bracketSize: number,
  manualOrder: readonly string[] | undefined,
): (Participant | null)[] => {
  const slots: (Participant | null)[] = Array.from(
    { length: bracketSize },
    () => null,
  );
  const participantsById = new Map(
    participants.map((participant) => [participant.id, participant]),
  );
  const usedIds = new Set<string>();
  let slotIndex = 0;

  manualOrder?.forEach((id) => {
    if (slotIndex >= bracketSize) {
      return;
    }

    const participant = participantsById.get(id);

    if (!participant || usedIds.has(id)) {
      return;
    }

    slots[slotIndex] = participant;
    usedIds.add(id);
    slotIndex += 1;
  });

  const remaining = sortByDerivedSeed(
    participants.filter((participant) => !usedIds.has(participant.id)),
  );

  remaining.forEach((participant) => {
    if (slotIndex >= bracketSize) {
      return;
    }

    slots[slotIndex] = participant;
    slotIndex += 1;
  });

  return slots;
};

export const applySeedingMethod = (
  participants: readonly Participant[],
  options: ApplySeedingOptions,
): (Participant | null)[] => {
  const baseSize = options.bracketSize ?? participants.length;
  const bracketSize = Math.max(
    2,
    nextPowerOfTwo(Math.max(baseSize, participants.length)),
  );

  if (participants.length === 0) {
    return Array.from({ length: bracketSize }, () => null);
  }

  if (options.method === "random") {
    const randomFn = options.random ?? Math.random;
    const shuffled = shuffleParticipants(participants, randomFn);
    const slots: (Participant | null)[] = Array.from(
      { length: bracketSize },
      () => null,
    );

    shuffled.slice(0, bracketSize).forEach((participant, index) => {
      slots[index] = participant;
    });

    return slots;
  }

  if (options.method === "manual") {
    return applyManualPlacement(
      participants,
      bracketSize,
      options.manualOrder ?? [],
    );
  }

  return applySeededPlacement(participants, bracketSize);
};
