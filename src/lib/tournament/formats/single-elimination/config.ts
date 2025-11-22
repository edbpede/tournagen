import { TournamentFormatType } from "../../types";
import type {
  Participant,
  SingleEliminationConfig,
  SingleEliminationOptions,
} from "../../types";

export const defaultSingleEliminationOptions: SingleEliminationOptions = {
  bracketSize: "auto",
  seedingMethod: "seeded",
  thirdPlacePlayoff: false,
};

export function createDefaultSingleEliminationConfig(
  participants: readonly Participant[],
  overrides?: Partial<SingleEliminationOptions>,
): SingleEliminationConfig {
  const timestamp = new Date();
  const seededParticipants = participants.map((participant, index) => ({
    ...participant,
    seed: participant.seed ?? index + 1,
  }));

  return {
    id: `${TournamentFormatType.SingleElimination}-config`,
    name: "Single Elimination",
    formatType: TournamentFormatType.SingleElimination,
    participants: seededParticipants,
    createdAt: timestamp,
    updatedAt: timestamp,
    options: {
      ...defaultSingleEliminationOptions,
      ...overrides,
    },
  };
}
