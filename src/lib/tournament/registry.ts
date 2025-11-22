import type {
  BaseTournamentConfig,
  TournamentFormat,
  TournamentFormatType,
  TournamentStructure,
} from "./types";

export class TournamentFormatRegistry {
  private readonly formats = new Map<
    TournamentFormatType,
    TournamentFormat<BaseTournamentConfig, TournamentStructure>
  >();

  register<TConfig extends BaseTournamentConfig, TStructure extends TournamentStructure>(
    format: TournamentFormat<TConfig, TStructure>,
  ): void {
    const type = format.metadata.type;

    if (this.formats.has(type)) {
      throw new Error(`Tournament format '${type}' is already registered.`);
    }

    const storedFormat = format as unknown as TournamentFormat<
      BaseTournamentConfig,
      TournamentStructure
    >;

    this.formats.set(type, storedFormat);
  }

  get<TConfig extends BaseTournamentConfig, TStructure extends TournamentStructure>(
    type: TournamentFormatType,
  ): TournamentFormat<TConfig, TStructure> | undefined {
    return this.formats.get(type) as
      | TournamentFormat<TConfig, TStructure>
      | undefined;
  }

  getAll(): readonly TournamentFormat<BaseTournamentConfig, TournamentStructure>[] {
    return Array.from(this.formats.values());
  }
}

export const tournamentFormatRegistry = new TournamentFormatRegistry();
