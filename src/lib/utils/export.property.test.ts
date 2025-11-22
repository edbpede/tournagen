import { describe, expect, it } from "bun:test";
import fc from "fast-check";
import type { Component } from "solid-js";
import { tournamentFormatRegistry } from "../tournament/registry";
import type {
  BaseTournamentConfig,
  ConfigPanelProps,
  Participant,
  TournamentFormat,
  TournamentStructure,
  ValidationResult,
  VisualizerProps,
} from "../tournament/types";
import { TournamentFormatType } from "../tournament/types";
import { exportTournament, importTournament } from "./export";

const getOrRegisterFormat = (
  formatType: TournamentFormatType,
  validateConfig: () => ValidationResult = () => ({ valid: true }),
): TournamentFormat<BaseTournamentConfig, TournamentStructure> => {
  const existing =
    tournamentFormatRegistry.get<BaseTournamentConfig, TournamentStructure>(
      formatType,
    );
  if (existing) {
    return existing;
  }

  const ConfigPanel: Component<ConfigPanelProps<BaseTournamentConfig>> = (
    props,
  ) => {
    void props.config;
    return null;
  };

  const Visualizer: Component<
    VisualizerProps<TournamentStructure, BaseTournamentConfig>
  > = (props) => {
    void props.structure;
    return null;
  };

  const format = {
    metadata: {
      type: formatType,
      name: `${formatType} format`,
      description: "Test format used for round-trip verification",
      icon: "rt",
      useCases: ["property-based test"],
    },
    createDefaultConfig: (participants: BaseTournamentConfig["participants"]) => ({
      id: `${formatType}-config`,
      name: `${formatType} config`,
      formatType,
      participants,
      createdAt: new Date(0),
      updatedAt: new Date(0),
    }),
    validateConfig,
    generateStructure: () => ({ type: "bracket", rounds: [] }),
    ConfigPanel,
    Visualizer,
  } satisfies TournamentFormat<BaseTournamentConfig, TournamentStructure>;

  tournamentFormatRegistry.register(format);
  return format;
};

const participantArb: fc.Arbitrary<Participant> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 32 }),
  seed: fc.integer({ min: 1, max: 256 }),
  team: fc.string({ minLength: 3, maxLength: 24 }),
  nationality: fc.string({ minLength: 2, maxLength: 24 }),
  metadata: fc.dictionary(
    fc.string({ minLength: 1, maxLength: 12 }),
    fc.string({ maxLength: 24 }),
    { maxKeys: 3 },
  ),
});

const matchArb = fc.record({
  id: fc.uuid(),
  roundId: fc.uuid(),
  position: fc.integer({ min: 0, max: 16 }),
  participant1: fc.oneof(fc.constant(null), participantArb),
  participant2: fc.oneof(fc.constant(null), participantArb),
  winner: fc.oneof(fc.constant(null), participantArb),
  feedsInto: fc.string({ minLength: 1, maxLength: 24 }),
  isBye: fc.boolean(),
});

describe("Property 15: export-import round trip", () => {
  getOrRegisterFormat(TournamentFormatType.SingleElimination);

  const boundedDate = fc
    .integer({
      min: new Date("2020-01-01T00:00:00.000Z").getTime(),
      max: new Date("2025-12-31T23:59:59.000Z").getTime(),
    })
    .map((value) => new Date(value));

  const configArb = fc
    .record({
      id: fc.uuid(),
      name: fc.string({ minLength: 1, maxLength: 40 }),
      participants: fc.array(participantArb, { minLength: 1, maxLength: 8 }),
      createdAt: boundedDate,
      updatedAt: boundedDate,
      metadata: fc.dictionary(
        fc.string({ minLength: 1, maxLength: 12 }),
        fc.string({ maxLength: 32 }),
        { maxKeys: 3 },
      ),
    })
    .map((raw) => {
      const updatedAt =
        raw.updatedAt < raw.createdAt ? raw.createdAt : raw.updatedAt;

      return {
        ...raw,
        updatedAt,
        formatType: TournamentFormatType.SingleElimination,
      };
    });

  const structureArb = fc
    .record({
      rounds: fc.array(
        fc.record({
          id: fc.uuid(),
          name: fc.string({ minLength: 3, maxLength: 24 }),
          roundNumber: fc.integer({ min: 1, max: 5 }),
          matches: fc.array(matchArb, { minLength: 1, maxLength: 4 }),
        }),
        { minLength: 1, maxLength: 3 },
      ),
      thirdPlaceMatch: matchArb,
      grandFinalReset: matchArb,
    })
    .map((record) => ({ ...record, type: "bracket" as const }));

  it("round-trips tournament payloads through export/import", () => {
    fc.assert(
      fc.property(configArb, structureArb, (config, structure) => {
        const baselineConfigJson = JSON.stringify(config);
        const baselineStructureJson = JSON.stringify(structure);

        const { json } = exportTournament({
          config,
          structure,
          download: () => undefined,
        });

        const result = importTournament({ json });

        expect(result.success).toBe(true);
        if (!result.success) {
          throw new Error(result.error.message);
        }

        expect(result.format).toBe(TournamentFormatType.SingleElimination);
        expect(JSON.stringify(result.config)).toBe(baselineConfigJson);
        expect(JSON.stringify(result.structure)).toBe(baselineStructureJson);
      }),
      { numRuns: 100 },
    );
  });
});
