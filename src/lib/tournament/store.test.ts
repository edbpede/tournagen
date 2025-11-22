import { describe, expect, it } from "bun:test";
import type { Component } from "solid-js";
import type {
  BaseTournamentConfig,
  ConfigPanelProps,
  Participant,
  VisualizerProps,
} from "./types";
import {
  TournamentFormatType,
  type TournamentConfig,
  type TournamentFormat,
  type TournamentStructure,
} from "./types";
import {
  setCurrentFormat,
  setCurrentStep,
  setTournamentState,
  tournamentState,
  addParticipant,
  updateMultipleParticipants,
  updateParticipant,
  removeParticipant,
  reorderParticipant,
} from "./store";
import { tournamentFormatRegistry } from "./registry";

type SimpleConfig<T extends TournamentFormatType> = BaseTournamentConfig & {
  formatType: T;
};

const createTestFormat = <T extends TournamentFormatType>(
  formatType: T,
): TournamentFormat<SimpleConfig<T>, TournamentStructure> => {
  const ConfigPanel: Component<ConfigPanelProps<SimpleConfig<T>>> = (props) => {
    void props.config.name;
    return null;
  };

  const Visualizer: Component<
    VisualizerProps<TournamentStructure, SimpleConfig<T>>
  > = (props) => {
    void props.structure;
    return null;
  };

  return {
    metadata: {
      type: formatType,
      name: `${formatType} format`,
      description: "Test format",
      icon: "test",
      useCases: ["test"],
    },
    createDefaultConfig: (participants: Participant[]) => ({
      id: `${formatType}-config`,
      name: `${formatType} config`,
      formatType,
      participants,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    }),
    validateConfig: () => ({ valid: true }),
    generateStructure: () => ({
      type: "bracket",
      rounds: [],
    }),
    ConfigPanel,
    Visualizer,
  };
};

const ensureFormatRegistered = (formatType: TournamentFormatType) => {
  const existing =
    tournamentFormatRegistry.get<TournamentConfig, TournamentStructure>(
      formatType,
    );

  if (existing) {
    return existing;
  }

  const format = createTestFormat(formatType);
  tournamentFormatRegistry.register(format);
  return format;
};

ensureFormatRegistered(TournamentFormatType.SingleElimination);

const resetState = () => {
  setTournamentState({
    currentConfig: null,
    currentStructure: null,
    step: "format-selection",
    isDirty: false,
  });
};

describe("tournament store", () => {
  it("sets the current format with default config and resets state", () => {
    resetState();
    const participants: Participant[] = [
      { id: "p1", name: "Alpha" },
      { id: "p2", name: "Bravo" },
    ];

    setCurrentFormat(TournamentFormatType.SingleElimination, participants);

    expect(tournamentState.currentConfig?.formatType).toBe(
      TournamentFormatType.SingleElimination,
    );
    expect(tournamentState.currentConfig?.participants.length).toBe(2);
    expect(
      (tournamentState.currentConfig?.updatedAt?.getTime() ?? 0) > 0,
    ).toBe(true);
    expect(tournamentState.currentStructure === null).toBe(true);
    expect(tournamentState.step).toBe("configuration");
    expect(tournamentState.isDirty).toBe(false);
  });

  it("updates a participant with fine-grained store updates", () => {
    resetState();
    const initialUpdatedAt = new Date(0);

    setTournamentState({
      currentConfig: {
        id: "cfg",
        name: "Test Config",
        formatType: TournamentFormatType.SingleElimination,
        participants: [
          { id: "p1", name: "Alpha" },
          { id: "p2", name: "Bravo" },
        ],
        createdAt: new Date(0),
        updatedAt: initialUpdatedAt,
      },
      currentStructure: { type: "bracket", rounds: [] },
      step: "participants",
      isDirty: false,
    });

    updateParticipant("p1", { name: "Updated", seed: 2 });

    expect(tournamentState.currentConfig?.participants[0].id).toBe("p1");
    expect(tournamentState.currentConfig?.participants[0].name).toBe("Updated");
    expect(tournamentState.currentConfig?.participants[0].seed).toBe(2);
    expect(tournamentState.currentConfig?.participants[1].name).toBe("Bravo");
    expect(tournamentState.currentStructure === null).toBe(true);
    expect(tournamentState.isDirty).toBe(true);
    expect(
      (tournamentState.currentConfig?.updatedAt.getTime() ?? 0) >
        initialUpdatedAt.getTime(),
    ).toBe(true);
  });

  it("adds a participant and marks the config dirty", () => {
    resetState();
    const initialUpdatedAt = new Date(0);

    setTournamentState({
      currentConfig: {
        id: "cfg",
        name: "Test Config",
        formatType: TournamentFormatType.SingleElimination,
        participants: [{ id: "p1", name: "Alpha" }],
        createdAt: new Date(0),
        updatedAt: initialUpdatedAt,
      },
      currentStructure: { type: "bracket", rounds: [] },
      step: "participants",
      isDirty: false,
    });

    const created = addParticipant({ name: "   Bravo  " });

    expect(created?.name).toBe("Bravo");
    expect(created?.id).toBeDefined();
    expect(tournamentState.currentConfig?.participants.length).toBe(2);
    expect(tournamentState.currentConfig?.participants[1].name).toBe("Bravo");
    expect(tournamentState.currentStructure === null).toBe(true);
    expect(tournamentState.isDirty).toBe(true);
    expect(
      (tournamentState.currentConfig?.updatedAt.getTime() ?? 0) >
      initialUpdatedAt.getTime(),
    ).toBe(true);
  });

  it("stores optional participant fields when provided", () => {
    resetState();
    const initialUpdatedAt = new Date(0);

    setTournamentState({
      currentConfig: {
        id: "cfg",
        name: "Test Config",
        formatType: TournamentFormatType.SingleElimination,
        participants: [],
        createdAt: new Date(0),
        updatedAt: initialUpdatedAt,
      },
      currentStructure: { type: "bracket", rounds: [] },
      step: "participants",
      isDirty: false,
    });

    const metadata = { role: "captain", notes: "Prefers mornings" };

    const created = addParticipant({
      name: "Delta",
      seed: 7,
      team: "Falcons",
      nationality: "Canada",
      metadata,
    });

    expect(created?.seed).toBe(7);
    expect(created?.team).toBe("Falcons");
    expect(created?.nationality).toBe("Canada");
    expect(created?.metadata).toBe(metadata);
    expect(tournamentState.currentStructure === null).toBe(true);
    expect(tournamentState.currentConfig?.participants[0].metadata).toBe(
      metadata,
    );
    expect(tournamentState.isDirty).toBe(true);
    expect(
      (tournamentState.currentConfig?.updatedAt.getTime() ?? 0) >
        initialUpdatedAt.getTime(),
    ).toBe(true);
  });

  it("removes a participant, marks dirty, and resets the structure", () => {
    resetState();
    const initialUpdatedAt = new Date(0);

    setTournamentState({
      currentConfig: {
        id: "cfg",
        name: "Test Config",
        formatType: TournamentFormatType.SingleElimination,
        participants: [
          { id: "p1", name: "Alpha" },
          { id: "p2", name: "Bravo" },
        ],
        createdAt: new Date(0),
        updatedAt: initialUpdatedAt,
      },
      currentStructure: { type: "bracket", rounds: [] },
      step: "participants",
      isDirty: false,
    });

    removeParticipant("p1");

    expect(tournamentState.currentConfig?.participants.length).toBe(1);
    expect(tournamentState.currentConfig?.participants[0].id).toBe("p2");
    expect(tournamentState.currentStructure === null).toBe(true);
    expect(tournamentState.isDirty).toBe(true);
    expect(
      (tournamentState.currentConfig?.updatedAt.getTime() ?? 0) >
        initialUpdatedAt.getTime(),
    ).toBe(true);
  });

  it("updates multiple participants in a batch", () => {
    resetState();
    const initialUpdatedAt = new Date(0);

    setTournamentState({
      currentConfig: {
        id: "cfg",
        name: "Test Config",
        formatType: TournamentFormatType.SingleElimination,
        participants: [
          { id: "p1", name: "Alpha" },
          { id: "p2", name: "Bravo", seed: 1 },
        ],
        createdAt: new Date(0),
        updatedAt: initialUpdatedAt,
      },
      currentStructure: { type: "bracket", rounds: [] },
      step: "participants",
      isDirty: false,
    });

    updateMultipleParticipants([
      { id: "p1", changes: { name: "Updated Alpha" } },
      { id: "p2", changes: { seed: 3 } },
    ]);

    expect(tournamentState.currentConfig?.participants[0].id).toBe("p1");
    expect(tournamentState.currentConfig?.participants[0].name).toBe(
      "Updated Alpha",
    );
    expect(tournamentState.currentConfig?.participants[1].id).toBe("p2");
    expect(tournamentState.currentConfig?.participants[1].name).toBe("Bravo");
    expect(tournamentState.currentConfig?.participants[1].seed).toBe(3);
    expect(tournamentState.currentStructure === null).toBe(true);
    expect(tournamentState.isDirty).toBe(true);
    expect(
      (tournamentState.currentConfig?.updatedAt.getTime() ?? 0) >
        initialUpdatedAt.getTime(),
    ).toBe(true);
  });

  it("reorders participants, reseeds them, and resets the current structure", () => {
    resetState();
    const initialUpdatedAt = new Date(0);

    setTournamentState({
      currentConfig: {
        id: "cfg",
        name: "Test Config",
        formatType: TournamentFormatType.SingleElimination,
        participants: [
          { id: "p1", name: "Alpha", seed: 1 },
          { id: "p2", name: "Bravo", seed: 2 },
          { id: "p3", name: "Charlie", seed: 3 },
        ],
        createdAt: new Date(0),
        updatedAt: initialUpdatedAt,
      },
      currentStructure: { type: "bracket", rounds: [] },
      step: "participants",
      isDirty: false,
    });

    reorderParticipant("p2", "up");

    const order = tournamentState.currentConfig?.participants.map((p) => p.id);
    expect(order?.join(",")).toBe("p2,p1,p3");
    const seeds = tournamentState.currentConfig?.participants.map((p) => p.seed);
    expect(seeds?.join(",")).toBe("1,2,3");
    expect(tournamentState.currentStructure === null).toBe(true);
    expect(tournamentState.isDirty).toBe(true);
    expect(
      (tournamentState.currentConfig?.updatedAt.getTime() ?? 0) >
        initialUpdatedAt.getTime(),
    ).toBe(true);
  });

  it("updates the current builder step", () => {
    resetState();
    setCurrentStep("participants");
    expect(tournamentState.step).toBe("participants");
  });
});
