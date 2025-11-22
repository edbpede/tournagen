import { createMemo } from "solid-js";
import { createStore } from "solid-js/store";
import { tournamentFormatRegistry } from "./registry";
import type {
  TournamentConfig,
  TournamentFormat,
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
