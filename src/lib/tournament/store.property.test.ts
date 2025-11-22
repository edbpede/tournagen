import { describe, expect, it } from "bun:test";
import fc from "fast-check";
import type { Component } from "solid-js";
import { tournamentFormatRegistry } from "./registry";
import {
  TournamentFormatType,
  type BaseTournamentConfig,
  type ConfigPanelProps,
  type Participant,
  type TournamentConfig,
  type TournamentFormat,
  type TournamentStructure,
  type VisualizerProps,
} from "./types";
import {
  addParticipant,
  removeParticipant,
  reorderParticipant,
  setTournamentState,
  tournamentState,
} from "./store";

const ensureFormatRegistered = (
  formatType: TournamentFormatType,
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
      description: "Participant property test format",
      icon: "pt",
      useCases: ["property-based test"],
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
    generateStructure: () => ({ type: "bracket", rounds: [] }),
    ConfigPanel,
    Visualizer,
  } satisfies TournamentFormat<BaseTournamentConfig, TournamentStructure>;

  tournamentFormatRegistry.register(format);
  return format;
};

ensureFormatRegistered(TournamentFormatType.SingleElimination);

const nameArb = fc
  .string({ minLength: 1, maxLength: 24 })
  .filter(
    (value) => value.trim().length > 0 && /^[a-zA-Z0-9 _-]+$/.test(value),
  );

const participantArb: fc.Arbitrary<Participant> = fc
  .record({
    id: fc.uuid(),
    name: nameArb,
  })
  .map((participant) => ({ ...participant }));

const uniqueParticipantsArb = fc
  .uniqueArray(participantArb, {
    minLength: 0,
    maxLength: 8,
    selector: (participant) => participant.id,
  })
  .map((list) =>
    list.map((participant, index) => ({ ...participant, seed: index + 1 })),
  );

const optionalFieldsArb = fc
  .record({
    seed: fc.option(fc.integer({ min: 1, max: 256 }), { nil: undefined }),
    team: fc.option(nameArb, { nil: undefined }),
    nationality: fc.option(nameArb, { nil: undefined }),
    metadata: fc.option(
      fc.dictionary(
        fc.string({ minLength: 1, maxLength: 12 }),
        fc.string({ maxLength: 24 }),
        { maxKeys: 3 },
      ),
      { nil: undefined },
    ),
  })
  .filter(
    (fields) =>
      fields.seed !== undefined ||
      fields.team !== undefined ||
      fields.nationality !== undefined ||
      fields.metadata !== undefined,
  );

const resetStateWithParticipants = (participants: readonly Participant[]) => {
  setTournamentState({
    currentConfig: {
      id: "cfg",
      name: "Test Config",
      formatType: TournamentFormatType.SingleElimination,
      participants: participants.map((participant, index) => ({
        ...participant,
        seed: index + 1,
      })),
      createdAt: new Date(0),
      updatedAt: new Date(0),
    },
    currentStructure: { type: "bracket", rounds: [] },
    step: "participants",
    isDirty: false,
  });
};

describe("Property 7: Participant addition", () => {
  it("adds one participant for any valid name", () => {
    fc.assert(
      fc.property(uniqueParticipantsArb, nameArb, (existing, rawName) => {
        resetStateWithParticipants(existing);
        const initialLength = tournamentState.currentConfig?.participants.length;
        const initialUpdatedAt =
          tournamentState.currentConfig?.updatedAt.getTime() ?? 0;

        const created = addParticipant({ name: rawName });

        expect(created === null).toBe(false);
        expect(created?.name).toBe(rawName.trim());
        expect(tournamentState.currentConfig?.participants.length).toBe(
          (initialLength ?? 0) + 1,
        );
        expect(
          tournamentState.currentConfig?.participants.some(
            (participant) => participant.id === created?.id,
          ),
        ).toBe(true);
        expect(
          (tournamentState.currentConfig?.updatedAt.getTime() ?? 0) >
            initialUpdatedAt,
        ).toBe(true);
        expect(tournamentState.currentStructure === null).toBe(true);
        expect(tournamentState.isDirty).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});

describe("Property 8: Participant removal", () => {
  it("removes exactly one participant when the id exists", () => {
    fc.assert(
      fc.property(
        fc
          .uniqueArray(participantArb, {
            minLength: 1,
            maxLength: 8,
            selector: (participant) => participant.id,
          })
          .map((list) =>
            list.map((participant, index) => ({
              ...participant,
              seed: index + 1,
            })),
          ),
        fc.integer({ min: 0, max: 7 }),
        (participants, removalIndex) => {
          const boundedIndex = removalIndex % participants.length;
          resetStateWithParticipants(participants);
          const initialUpdatedAt =
            tournamentState.currentConfig?.updatedAt.getTime() ?? 0;
          const targetId = participants[boundedIndex]?.id;

          removeParticipant(targetId);

          expect(tournamentState.currentConfig?.participants.length).toBe(
            participants.length - 1,
          );
          expect(
            tournamentState.currentConfig?.participants.some(
              (participant) => participant.id === targetId,
            ),
          ).toBe(false);
          expect(tournamentState.currentStructure === null).toBe(true);
          expect(tournamentState.isDirty).toBe(true);
          expect(
            (tournamentState.currentConfig?.updatedAt.getTime() ?? 0) >
              initialUpdatedAt,
          ).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe("Property 9: Participant reordering", () => {
  it("swaps positions and reseeds participants when moved", () => {
    fc.assert(
      fc.property(
        fc
          .uniqueArray(participantArb, {
            minLength: 2,
            maxLength: 8,
            selector: (participant) => participant.id,
          })
          .map((list) =>
            list.map((participant, index) => ({
              ...participant,
              seed: index + 1,
            })),
          ),
        fc.integer({ min: 0, max: 7 }),
        (participants, rawIndex) => {
          const sourceIndex = rawIndex % participants.length;
          const direction =
            sourceIndex === 0
              ? "down"
              : sourceIndex === participants.length - 1
                ? "up"
                : rawIndex % 2 === 0
                  ? "down"
                  : "up";

          const targetIndex =
            direction === "up" ? sourceIndex - 1 : sourceIndex + 1;

          resetStateWithParticipants(participants);
          const initialUpdatedAt =
            tournamentState.currentConfig?.updatedAt.getTime() ?? 0;

          reorderParticipant(participants[sourceIndex]?.id, direction);

          const reordered = tournamentState.currentConfig?.participants ?? [];
          expect(reordered.length).toBe(participants.length);
          expect(reordered[targetIndex]?.id).toBe(participants[sourceIndex]?.id);
          expect(reordered[sourceIndex]?.id).toBe(
            participants[targetIndex]?.id,
          );
          expect(reordered.map((p) => p.seed).join(",")).toBe(
            reordered.map((_, idx) => idx + 1).join(","),
          );
          expect(tournamentState.currentStructure === null).toBe(true);
          expect(tournamentState.isDirty).toBe(true);
          expect(
            (tournamentState.currentConfig?.updatedAt.getTime() ?? 0) >
              initialUpdatedAt,
          ).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe("Property 10: Optional participant fields", () => {
  it("persists optional fields when provided during addition", () => {
    fc.assert(
      fc.property(uniqueParticipantsArb, nameArb, optionalFieldsArb, (existing, rawName, optionalFields) => {
        resetStateWithParticipants(existing);
        const created = addParticipant({
          name: rawName,
          ...optionalFields,
        });

        expect(created === null).toBe(false);
        const last = tournamentState.currentConfig?.participants.slice(-1)[0];

        if (optionalFields.seed !== undefined) {
          expect(last?.seed).toBe(optionalFields.seed);
        }
        if (optionalFields.team !== undefined) {
          expect(last?.team).toBe(optionalFields.team);
        } else {
          expect(last?.team === undefined).toBe(true);
        }
        if (optionalFields.nationality !== undefined) {
          expect(last?.nationality).toBe(optionalFields.nationality);
        } else {
          expect(last?.nationality === undefined).toBe(true);
        }

        const storedMetadataString =
          last?.metadata === undefined
            ? "undefined"
            : JSON.stringify(last.metadata);
        const expectedMetadataString =
          optionalFields.metadata === undefined
            ? "undefined"
            : JSON.stringify(optionalFields.metadata);
        expect(storedMetadataString).toBe(expectedMetadataString);
        expect(tournamentState.currentStructure === null).toBe(true);
        expect(tournamentState.isDirty).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
