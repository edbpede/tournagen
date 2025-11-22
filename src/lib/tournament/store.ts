import { batch, createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import { tournamentFormatRegistry } from "./registry";
import type {
  Participant,
  TournamentConfig,
  TournamentFormat,
  TournamentFormatType,
  TournamentStructure,
} from "./types";

export type BuilderStep =
  | "format-selection"
  | "configuration"
  | "participants"
  | "review";

export interface TournamentState {
  currentConfig: TournamentConfig | null;
  currentStructure: TournamentStructure | null;
  step: BuilderStep;
  isDirty: boolean;
}

const initialState: TournamentState = {
  currentConfig: null,
  currentStructure: null,
  step: "format-selection",
  isDirty: false,
};

export const [tournamentState, setTournamentState] =
  createStore<TournamentState>(initialState);

export const currentFormat = createMemo<TournamentFormat<TournamentConfig> | null>(
  () => {
    const config = tournamentState.currentConfig;
    return config
      ? tournamentFormatRegistry.get<TournamentConfig, TournamentStructure>(
          config.formatType,
        ) ?? null
      : null;
  },
);

export const currentParticipants = createMemo(
  () => tournamentState.currentConfig?.participants ?? [],
);

export const hasGeneratedStructure = createMemo(
  () => tournamentState.currentStructure !== null,
);

export function setCurrentFormat(
  formatType: TournamentFormatType,
  participants: readonly Participant[] = tournamentState.currentConfig?.participants ?? [],
): void {
  const format =
    tournamentFormatRegistry.get<TournamentConfig, TournamentStructure>(
      formatType,
    );

  if (!format) {
    throw new Error(`Tournament format '${formatType}' is not registered.`);
  }

  const config = format.createDefaultConfig([...participants]);
  const timestamp = new Date();

  batch(() => {
    setTournamentState({
      currentConfig: { ...config, updatedAt: timestamp },
      currentStructure: null,
      step: "configuration",
      isDirty: false,
    });
  });
}

export function setCurrentStep(step: BuilderStep): void {
  setTournamentState("step", step);
}

export function updateParticipant(
  participantId: string,
  changes: Partial<Participant>,
): void {
  if (!tournamentState.currentConfig) {
    return;
  }

  let updated = false;

  setTournamentState(
    "currentConfig",
    "participants",
    (participant) => {
      const isMatch = participant.id === participantId;
      if (isMatch) {
        updated = true;
      }
      return isMatch;
    },
    (participant) => ({ ...participant, ...changes }),
  );

  if (!updated) {
    return;
  }

  const timestamp = new Date();

  batch(() => {
    setTournamentState("currentConfig", "updatedAt", timestamp);
    setTournamentState("currentStructure", null);
    setTournamentState("isDirty", true);
  });
}

export function updateMultipleParticipants(
  updates: readonly { id: string; changes: Partial<Participant> }[],
): void {
  if (!tournamentState.currentConfig || updates.length === 0) {
    return;
  }

  let updatedAny = false;

  batch(() => {
    updates.forEach(({ id, changes }) => {
      setTournamentState(
        "currentConfig",
        "participants",
        (participant) => {
          const isMatch = participant.id === id;
          if (isMatch) {
            updatedAny = true;
          }
          return isMatch;
        },
        (participant) => ({ ...participant, ...changes }),
      );
    });

    if (!updatedAny) {
      return;
    }

    const timestamp = new Date();

    setTournamentState("currentConfig", "updatedAt", timestamp);
    setTournamentState("currentStructure", null);
    setTournamentState("isDirty", true);
  });
}
