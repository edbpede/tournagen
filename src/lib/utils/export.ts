import { tournamentFormatRegistry } from "../tournament/registry";
import { TournamentFormatType } from "../tournament/types";
import type {
  BaseTournamentConfig,
  FormatExport,
  TournamentConfig,
  TournamentFormat,
  TournamentStructure,
} from "../tournament/types";

const EXPORT_VERSION = "1.0.0";
const DOWNLOAD_MIME_TYPE = "application/json";
const FILENAME_PREFIX = "tournagen";
export const LOCAL_STORAGE_KEY = "tournagen:last-tournament";

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

export type ImportTournamentErrorCode =
  | "invalid-json"
  | "invalid-schema"
  | "unknown-format"
  | "validation-failed";

export interface ImportTournamentError {
  success: false;
  error: {
    code: ImportTournamentErrorCode;
    message: string;
    details?: readonly string[];
  };
}

export interface ImportTournamentSuccess<
  TConfig extends BaseTournamentConfig,
  TStructure extends TournamentStructure,
> {
  success: true;
  format: TournamentFormatType;
  payload: FormatExport<TConfig, TStructure>;
  config: TConfig;
  structure: TStructure;
}

export type ImportTournamentResult<
  TConfig extends BaseTournamentConfig = TournamentConfig,
  TStructure extends TournamentStructure = TournamentStructure,
> =
  | ImportTournamentSuccess<TConfig, TStructure>
  | ImportTournamentError;

export interface ImportTournamentOptions {
  readonly json: string;
  readonly registry?: TournamentFormatRegistryLike;
}

interface TournamentFormatRegistryLike {
  get: <TConfig extends BaseTournamentConfig, TStructure extends TournamentStructure>(
    type: TournamentFormatType,
  ) => TournamentFormat<TConfig, TStructure> | undefined;
}

export function importTournament(
  options: ImportTournamentOptions,
): ImportTournamentResult {
  const registry = options.registry ?? tournamentFormatRegistry;
  let parsed: unknown;

  try {
    parsed = JSON.parse(options.json);
  } catch (error) {
    return {
      success: false,
      error: {
        code: "invalid-json",
        message: "The selected file is not valid JSON.",
        details: [error instanceof Error ? error.message : "Unknown parse error"],
      },
    };
  }

  if (!isRecord(parsed)) {
    return schemaError("File must contain an object with tournament data.");
  }

  const { format, config, structure } = parsed as {
    format?: unknown;
    config?: unknown;
    structure?: unknown;
  };

  if (!isValidFormat(format)) {
    return schemaError("Tournament format is missing or not recognized.");
  }

  if (!isRecord(config)) {
    return schemaError("Tournament configuration is missing or malformed.");
  }

  if (!isRecord(structure)) {
    return schemaError("Tournament structure is missing or malformed.");
  }

  const structureType = (structure as { type?: unknown }).type;
  if (typeof structureType !== "string") {
    return schemaError("Tournament structure is missing a type discriminator.");
  }

  if (config.formatType !== format) {
    return schemaError("Configuration format does not match the payload format.");
  }

  const registryFormat = registry.get<TournamentConfig, TournamentStructure>(format);
  if (!registryFormat) {
    return {
      success: false,
      error: {
        code: "unknown-format",
        message: `Tournament format '${format}' is not available in this build.`,
      },
    };
  }

  const normalizedConfig = normalizeConfig(config, format);
  if (!normalizedConfig) {
    return schemaError("Tournament configuration is missing required fields.");
  }

  const validation = registryFormat.validateConfig(normalizedConfig);

  if (!validation.valid) {
    return {
      success: false,
      error: {
        code: "validation-failed",
        message: "Imported tournament failed validation.",
        details: validation.errors.map((validationError) =>
          validationError.field
            ? `${validationError.field}: ${validationError.message}`
            : validationError.message,
        ),
      },
    };
  }

  const payload: FormatExport<TournamentConfig, TournamentStructure> = {
    version: typeof parsed.version === "string" ? parsed.version : "unknown",
    format,
    generatedAt:
      typeof parsed.generatedAt === "string" ? parsed.generatedAt : new Date().toISOString(),
    config: normalizedConfig,
    structure: structure as unknown as TournamentStructure,
    ...(isRecord(parsed.metadata) ? { metadata: parsed.metadata } : {}),
  };

  return {
    success: true,
    format,
    payload,
    config: payload.config,
    structure: payload.structure,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidFormat(value: unknown): value is TournamentFormatType {
  return Object.values(TournamentFormatType).includes(
    value as TournamentFormatType,
  );
}

function schemaError(message: string): ImportTournamentError {
  return { success: false, error: { code: "invalid-schema", message } };
}

function normalizeConfig(
  config: Record<string, unknown>,
  format: TournamentFormatType,
): TournamentConfig | null {
  if (
    typeof config.id !== "string" ||
    typeof config.name !== "string" ||
    typeof config.formatType !== "string" ||
    !Array.isArray(config.participants)
  ) {
    return null;
  }

  const createdAt = parseDate(config.createdAt);
  const updatedAt = parseDate(config.updatedAt);

  if (!createdAt || !updatedAt) {
    return null;
  }

  const participants = config.participants.map((participant) => {
    if (!isRecord(participant) || typeof participant.id !== "string" || typeof participant.name !== "string") {
      return null;
    }

    const normalized = {
      id: participant.id,
      name: participant.name,
      seed: typeof participant.seed === "number" ? participant.seed : undefined,
      team: typeof participant.team === "string" ? participant.team : undefined,
      nationality:
        typeof participant.nationality === "string"
          ? participant.nationality
          : undefined,
      metadata: isRecord(participant.metadata) ? participant.metadata : undefined,
    };

    return normalized;
  });

  if (participants.some((entry) => entry === null)) {
    return null;
  }

  const baseConfig = config as unknown as TournamentConfig;
  baseConfig.formatType = format;
  baseConfig.createdAt = createdAt;
  baseConfig.updatedAt = updatedAt;
  baseConfig.participants = participants as TournamentConfig["participants"];

  return baseConfig;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" && !(value instanceof Date)) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export interface SaveToLocalStorageOptions<
  TConfig extends BaseTournamentConfig,
  TStructure extends TournamentStructure,
> extends ExportTournamentOptions<TConfig, TStructure> {
  readonly key?: string;
  readonly storage?: Storage;
}

export type SaveToLocalStorageErrorCode = "unavailable" | "save-failed";

export type SaveToLocalStorageResult<
  TConfig extends BaseTournamentConfig,
  TStructure extends TournamentStructure,
> =
  | {
      success: true;
      key: string;
      payload: FormatExport<TConfig, TStructure>;
      json: string;
    }
  | {
      success: false;
      error: {
        code: SaveToLocalStorageErrorCode;
        message: string;
        details?: readonly string[];
      };
    };

export function saveToLocalStorage<
  TConfig extends BaseTournamentConfig,
  TStructure extends TournamentStructure,
>(options: SaveToLocalStorageOptions<TConfig, TStructure>): SaveToLocalStorageResult<
  TConfig,
  TStructure
> {
  const storage = options.storage ?? getLocalStorage();

  if (!storage) {
    return {
      success: false,
      error: {
        code: "unavailable",
        message: "Local storage is not available in this environment.",
      },
    };
  }

  const key = options.key ?? LOCAL_STORAGE_KEY;

  try {
    const { payload, json } = exportTournament({
      ...options,
      download: () => undefined,
    });

    storage.setItem(key, json);

    return { success: true, key, payload, json };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "save-failed",
        message: "Failed to save tournament to local storage.",
        details: [error instanceof Error ? error.message : "Unknown error"],
      },
    };
  }
}

export interface LoadFromLocalStorageOptions {
  readonly key?: string;
  readonly registry?: TournamentFormatRegistryLike;
  readonly storage?: Storage;
}

export type LoadFromLocalStorageErrorCode =
  | "unavailable"
  | "not-found"
  | ImportTournamentErrorCode;

export type LoadFromLocalStorageResult<
  TConfig extends BaseTournamentConfig = TournamentConfig,
  TStructure extends TournamentStructure = TournamentStructure,
> =
  | (ImportTournamentSuccess<TConfig, TStructure> & {
      key: string;
      source: "local-storage";
    })
  | {
      success: false;
      key: string;
      source: "local-storage";
      error: {
        code: LoadFromLocalStorageErrorCode;
        message: string;
        details?: readonly string[];
      };
    };

export function loadFromLocalStorage(
  options: LoadFromLocalStorageOptions = {},
): LoadFromLocalStorageResult {
  const storage = options.storage ?? getLocalStorage();

  if (!storage) {
    return {
      success: false,
      key: options.key ?? LOCAL_STORAGE_KEY,
      source: "local-storage",
      error: {
        code: "unavailable",
        message: "Local storage is not available in this environment.",
      },
    };
  }

  const key = options.key ?? LOCAL_STORAGE_KEY;
  let raw: string | null;

  try {
    raw = storage.getItem(key);
  } catch (error) {
    return {
      success: false,
      key,
      source: "local-storage",
      error: {
        code: "unavailable",
        message: "Unable to access local storage.",
        details: [error instanceof Error ? error.message : "Unknown error"],
      },
    };
  }

  if (!raw) {
    return {
      success: false,
      key,
      source: "local-storage",
      error: {
        code: "not-found",
        message: "No saved tournament was found in local storage.",
      },
    };
  }

  const result = importTournament({
    json: raw,
    registry: options.registry,
  });

  if (!result.success) {
    return {
      success: false,
      key,
      source: "local-storage",
      error: result.error,
    };
  }

  return { ...result, key, source: "local-storage" };
}

function getLocalStorage(): Storage | null {
  if (typeof localStorage === "undefined") {
    return null;
  }

  try {
    const probeKey = `${LOCAL_STORAGE_KEY}-probe`;
    localStorage.setItem(probeKey, "1");
    localStorage.removeItem(probeKey);
    return localStorage;
  } catch (error) {
    console.warn("Local storage unavailable", error);
    return null;
  }
}
