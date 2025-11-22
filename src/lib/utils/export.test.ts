import { describe, expect, it } from "bun:test";
import { exportTournament } from "./export";
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
