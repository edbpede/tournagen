import { describe, expect, it } from "bun:test";
import type { Component } from "solid-js";
import { tournamentFormatRegistry } from "../tournament/registry";
import {
  exportTournament,
  importTournament,
  type ImportTournamentResult,
} from "./export";
import type {
  BaseTournamentConfig,
  ConfigPanelProps,
  TournamentFormat,
  TournamentStructure,
  VisualizerProps,
  ValidationResult,
} from "../tournament/types";
import { TournamentFormatType } from "../tournament/types";

const baseConfig = {
  id: "tournament-1",
  name: "Summer Open",
  formatType: TournamentFormatType.SingleElimination,
  participants: [],
  createdAt: new Date("2024-01-01T00:00:00.000Z"),
  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
};

const baseStructure = {
  type: "bracket" as const,
  rounds: [],
};

describe("exportTournament", () => {
  it("serializes config and structure into human-readable JSON and triggers download", () => {
    const generatedAt = new Date("2024-02-03T04:05:06.000Z");
    let downloadedJson = "";
    let downloadedFilename = "";

    const result = exportTournament({
      config: baseConfig,
      structure: baseStructure,
      generatedAt,
      download: (json, filename) => {
        downloadedJson = json;
        downloadedFilename = filename;
      },
    });

    expect(downloadedFilename.includes("single-elimination")).toBe(true);
    expect(downloadedJson.includes('\n  "format"')).toBe(true);

    const parsed = JSON.parse(downloadedJson);
    expect(parsed.format).toBe(TournamentFormatType.SingleElimination);
    expect(parsed.config.name).toBe("Summer Open");
    expect(parsed.generatedAt).toBe(generatedAt.toISOString());
    expect(result.payload.version).toBe("1.0.0");
    expect(result.json).toBe(downloadedJson);
    expect(result.filename).toBe(downloadedFilename);
  });

  it("builds a safe fallback filename when the tournament name is empty or unsafe", () => {
    let downloadedFilename = "";

    exportTournament({
      config: { ...baseConfig, name: "   ???  " },
      structure: baseStructure,
      generatedAt: new Date("2024-06-01T10:11:12.000Z"),
      download: (_json, filename) => {
        downloadedFilename = filename;
      },
    });

    expect(downloadedFilename).toMatch(
      /^tournagen-tournament-single-elimination-\d{8}-\d{6}\.json$/,
    );
  });
});

const createTestFormat = (
  formatType: TournamentFormatType,
  validateConfig: () => ValidationResult = () => ({ valid: true }),
): TournamentFormat<BaseTournamentConfig, TournamentStructure> => {
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

  return {
    metadata: {
      type: formatType,
      name: `${formatType} format`,
      description: "Test format",
      icon: "t",
      useCases: ["test"],
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
  };
};

const ensureFormatRegistered = (
  formatType: TournamentFormatType,
  validateConfig?: () => ValidationResult,
) => {
  const existing =
    tournamentFormatRegistry.get<BaseTournamentConfig, TournamentStructure>(
      formatType,
    );
  if (existing) {
    return existing;
  }

  const format = createTestFormat(
    formatType,
    validateConfig ?? (() => ({ valid: true })),
  );
  tournamentFormatRegistry.register(format);
  return format;
};

describe("importTournament", () => {
  it("parses valid payloads and normalizes dates", () => {
    ensureFormatRegistered(TournamentFormatType.SingleElimination);
    const payload = {
      version: "1.0.0",
      format: TournamentFormatType.SingleElimination,
      generatedAt: "2024-02-03T04:05:06.000Z",
      config: {
        id: "cfg-1",
        name: "Summer Open",
        formatType: TournamentFormatType.SingleElimination,
        participants: [{ id: "p1", name: "Alpha" }],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      },
      structure: { type: "bracket", rounds: [] as const },
    };

    const result = importTournament({
      json: JSON.stringify(payload),
    }) as ImportTournamentResult;

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.format).toBe(payload.format);
    expect(result.config.createdAt instanceof Date).toBe(true);
    expect(result.config.updatedAt instanceof Date).toBe(true);
    expect(result.config.participants[0].name).toBe("Alpha");
    expect(result.structure.type).toBe("bracket");
  });

  it("returns an error for invalid JSON", () => {
    const result = importTournament({ json: "{ not-json" });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe("invalid-json");
  });

  it("returns an error when the format is not registered", () => {
    const payload = {
      version: "1.0.0",
      format: TournamentFormatType.DoubleElimination,
      generatedAt: "2024-02-03T04:05:06.000Z",
      config: {
        id: "cfg-2",
        name: "Unknown Format Event",
        formatType: TournamentFormatType.DoubleElimination,
        participants: [{ id: "p1", name: "Alpha" }],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      },
      structure: { type: "bracket", rounds: [] },
    };

    const result = importTournament({
      json: JSON.stringify(payload),
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe("unknown-format");
  });

  it("returns an error when required fields are missing", () => {
    const payload = {
      version: "1.0.0",
      format: TournamentFormatType.SingleElimination,
      generatedAt: "2024-02-03T04:05:06.000Z",
      config: {},
      structure: { type: "bracket", rounds: [] },
    };

    const result = importTournament({
      json: JSON.stringify(payload),
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe("invalid-schema");
  });

  it("returns validation errors when the format rejects the config", () => {
    ensureFormatRegistered(TournamentFormatType.RoundRobin, () => ({
      valid: false,
      errors: [
        {
          code: "missing-participants",
          message: "Participants are required",
          field: "participants",
        },
      ],
    }));

    const payload = {
      version: "1.0.0",
      format: TournamentFormatType.RoundRobin,
      generatedAt: "2024-02-03T04:05:06.000Z",
      config: {
        id: "cfg-3",
        name: "Invalid Config",
        formatType: TournamentFormatType.RoundRobin,
        participants: [],
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-02T00:00:00.000Z",
      },
      structure: { type: "bracket", rounds: [] },
    };

    const result = importTournament({
      json: JSON.stringify(payload),
    });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.code).toBe("validation-failed");
    expect(result.error.details?.[0] ?? "").toMatch(/participants/);
  });
});
