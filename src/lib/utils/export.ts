import type {
  BaseTournamentConfig,
  FormatExport,
  TournamentStructure,
} from "../tournament/types";

const EXPORT_VERSION = "1.0.0";
const DOWNLOAD_MIME_TYPE = "application/json";
const FILENAME_PREFIX = "tournagen";

export interface ExportTournamentOptions<
  TConfig extends BaseTournamentConfig,
  TStructure extends TournamentStructure,
> {
  readonly config: TConfig;
  readonly structure: TStructure;
  readonly metadata?: Record<string, unknown>;
  readonly filename?: string;
  readonly version?: string;
  readonly generatedAt?: Date;
  readonly download?: (json: string, filename: string) => void;
}

export interface ExportTournamentResult<
  TConfig extends BaseTournamentConfig,
  TStructure extends TournamentStructure,
> {
  readonly payload: FormatExport<TConfig, TStructure>;
  readonly filename: string;
  readonly json: string;
}

export function exportTournament<
  TConfig extends BaseTournamentConfig,
  TStructure extends TournamentStructure,
>(options: ExportTournamentOptions<TConfig, TStructure>): ExportTournamentResult<
  TConfig,
  TStructure
> {
  const { config, structure } = options;

  if (!config) {
    throw new Error("exportTournament requires a tournament config.");
  }

  if (!structure) {
    throw new Error("exportTournament requires a generated structure.");
  }

  const timestamp = options.generatedAt ?? new Date();
  const payload: FormatExport<TConfig, TStructure> = {
    version: options.version ?? EXPORT_VERSION,
    format: config.formatType,
    generatedAt: timestamp.toISOString(),
    config,
    structure,
    ...(options.metadata ? { metadata: options.metadata } : {}),
  };

  const filename =
    options.filename ??
    buildFilename({
      name: config.name,
      format: config.formatType,
      timestamp,
    });
  const json = JSON.stringify(payload, null, 2);
  const download = options.download ?? defaultDownload;

  download(json, filename);

  return { payload, filename, json };
}

interface FilenameParts {
  readonly name: string;
  readonly format: BaseTournamentConfig["formatType"];
  readonly timestamp: Date;
}

function buildFilename(parts: FilenameParts): string {
  const date = parts.timestamp;
  const formattedDate = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join("");

  const time = [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())]
    .join("");

  const slug = [FILENAME_PREFIX, slugify(parts.name), parts.format, `${formattedDate}-${time}`]
    .filter(Boolean)
    .join("-");

  return `${slug}.json`;
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function slugify(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized.length > 0 ? normalized : "tournament";
}

function defaultDownload(json: string, filename: string): void {
  if (
    typeof document === "undefined" ||
    typeof URL === "undefined" ||
    typeof URL.createObjectURL !== "function"
  ) {
    return;
  }

  const blob = new Blob([json], { type: DOWNLOAD_MIME_TYPE });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";

  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
