import { describe, expect, it } from "bun:test";
import type { Component } from "solid-js";
import { TournamentFormatRegistry } from "./registry";
import type {
  BaseTournamentConfig,
  BracketStructure,
  ConfigPanelProps,
  Participant,
  TournamentFormat,
  VisualizerProps,
} from "./types";
import { TournamentFormatType } from "./types";

type SimpleConfig<T extends TournamentFormatType> = BaseTournamentConfig & {
  formatType: T;
};

const createConfig = <T extends TournamentFormatType>(
  formatType: T,
  participants: Participant[] = [],
): SimpleConfig<T> => ({
  id: `${formatType}-config`,
  name: `${formatType} format`,
  formatType,
  participants,
  createdAt: new Date(0),
  updatedAt: new Date(0),
});

const createTestFormat = <T extends TournamentFormatType>(
  formatType: T,
): TournamentFormat<SimpleConfig<T>, BracketStructure> => {
  const ConfigPanel: Component<ConfigPanelProps<SimpleConfig<T>>> = (props) => {
    void props.config.name;
    return null;
  };

  const Visualizer: Component<
    VisualizerProps<BracketStructure, SimpleConfig<T>>
  > = (props) => {
    void props.structure.type;
    return null;
  };

  return {
    metadata: {
      type: formatType,
      name: `${formatType} name`,
      description: "Test format",
      icon: "test-icon",
      useCases: ["testing"],
    },
    createDefaultConfig: (participants: Participant[]) =>
      createConfig(formatType, participants),
    validateConfig: () => ({ valid: true }),
    generateStructure: () => ({
      type: "bracket",
      rounds: [],
    }),
    ConfigPanel,
    Visualizer,
  };
};

describe("TournamentFormatRegistry", () => {
  it("registers and retrieves formats by type", () => {
    const registry = new TournamentFormatRegistry();
    const format = createTestFormat(TournamentFormatType.SingleElimination);

    registry.register(format);

    const retrieved = registry.get(TournamentFormatType.SingleElimination);

    expect(retrieved).toBe(format);
  });

  it("returns all registered formats in insertion order", () => {
    const registry = new TournamentFormatRegistry();
    const singleElim = createTestFormat(
      TournamentFormatType.SingleElimination,
    );
    const doubleElim = createTestFormat(
      TournamentFormatType.DoubleElimination,
    );

    registry.register(singleElim);
    registry.register(doubleElim);

    const formats = registry.getAll();

    expect(formats.length).toBe(2);
    expect(formats[0]).toBe(singleElim);
    expect(formats[1]).toBe(doubleElim);
  });

  it("prevents duplicate registrations for the same format type", () => {
    const registry = new TournamentFormatRegistry();
    const format = createTestFormat(TournamentFormatType.RoundRobin);

    let error: unknown;

    try {
      registry.register(format);
      registry.register(format);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(String(error)).toMatch("round-robin");
  });
});
