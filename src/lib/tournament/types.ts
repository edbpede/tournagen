import type { Component } from "solid-js";

// Core type definitions for tournament configurations and generated structures.

export interface Participant {
  id: string;
  name: string;
  seed?: number;
  team?: string;
  nationality?: string;
  metadata?: Record<string, unknown>;
}

export enum TournamentFormatType {
  SingleElimination = "single-elimination",
  DoubleElimination = "double-elimination",
  RoundRobin = "round-robin",
  Swiss = "swiss",
  FreeForAll = "ffa",
  FIFA = "fifa",
  RacingMarioKart = "racing-mk",
  RacingF1 = "racing-f1",
}

export interface BaseTournamentConfig {
  id: string;
  name: string;
  formatType: TournamentFormatType;
  participants: Participant[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export type SingleEliminationBracketSize =
  | "auto"
  | 2
  | 4
  | 8
  | 16
  | 32
  | 64
  | 128;

export type SingleEliminationSeedingMethod =
  | "random"
  | "seeded"
  | "manual";

export interface SingleEliminationOptions {
  readonly bracketSize: SingleEliminationBracketSize;
  readonly thirdPlacePlayoff: boolean;
  readonly seedingMethod: SingleEliminationSeedingMethod;
  /**
   * Optional manual ordering of participant IDs, top-to-bottom.
   * Used when seedingMethod is "manual".
   */
  readonly manualSeedOrder?: readonly string[];
}

export interface SingleEliminationConfig extends BaseTournamentConfig {
  formatType: TournamentFormatType.SingleElimination;
  options: SingleEliminationOptions;
}

export interface DoubleEliminationConfig extends BaseTournamentConfig {
  formatType: TournamentFormatType.DoubleElimination;
  options?: Record<string, unknown>;
}

export interface RoundRobinConfig extends BaseTournamentConfig {
  formatType: TournamentFormatType.RoundRobin;
  options?: Record<string, unknown>;
}

export interface SwissConfig extends BaseTournamentConfig {
  formatType: TournamentFormatType.Swiss;
  options?: Record<string, unknown>;
}

export interface FFAConfig extends BaseTournamentConfig {
  formatType: TournamentFormatType.FreeForAll;
  options?: Record<string, unknown>;
}

export interface FIFAConfig extends BaseTournamentConfig {
  formatType: TournamentFormatType.FIFA;
  options?: Record<string, unknown>;
}

export interface RacingMarioKartConfig extends BaseTournamentConfig {
  formatType: TournamentFormatType.RacingMarioKart;
  options?: Record<string, unknown>;
}

export interface RacingF1Config extends BaseTournamentConfig {
  formatType: TournamentFormatType.RacingF1;
  options?: Record<string, unknown>;
}

export type RacingConfig = RacingMarioKartConfig | RacingF1Config;

export type TournamentConfig =
  | SingleEliminationConfig
  | DoubleEliminationConfig
  | RoundRobinConfig
  | SwissConfig
  | FFAConfig
  | FIFAConfig
  | RacingConfig;

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: readonly ValidationError[] };

export interface TournamentFormatMetadata {
  readonly type: TournamentFormatType;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly useCases: readonly string[];
}

export interface ConfigPanelProps<TConfig extends BaseTournamentConfig> {
  config: TConfig;
  onChange: (config: TConfig) => void;
}

export interface VisualizerProps<
  TStructure extends TournamentStructure,
  TConfig extends BaseTournamentConfig = BaseTournamentConfig,
> {
  config: TConfig;
  structure: TStructure;
}

export interface FormatExport<
  TConfig extends BaseTournamentConfig,
  TStructure extends TournamentStructure,
> {
  version: string;
  format: TournamentFormatType;
  generatedAt: string;
  config: TConfig;
  structure: TStructure;
  metadata?: Record<string, unknown>;
}

export interface TournamentFormat<
  TConfig extends BaseTournamentConfig,
  TStructure extends TournamentStructure = TournamentStructure,
> {
  readonly metadata: TournamentFormatMetadata;
  createDefaultConfig(participants: Participant[]): TConfig;
  validateConfig(config: TConfig): ValidationResult;
  generateStructure(config: TConfig): TStructure;
  ConfigPanel: Component<ConfigPanelProps<TConfig>>;
  Visualizer: Component<VisualizerProps<TStructure, TConfig>>;
  exportData?: (
    config: TConfig,
    structure: TStructure,
  ) => FormatExport<TConfig, TStructure>;
}

export interface BracketStructure {
  type: "bracket";
  rounds: BracketRound[];
  thirdPlaceMatch?: BracketMatch;
  grandFinalReset?: BracketMatch;
}

export interface BracketRound {
  id: string;
  name: string;
  roundNumber: number;
  matches: BracketMatch[];
}

export interface BracketMatch {
  id: string;
  roundId: string;
  position: number;
  participant1: Participant | null;
  participant2: Participant | null;
  winner?: Participant | null;
  feedsInto?: string;
  isBye?: boolean;
}

export interface LeagueStructure {
  type: "league";
  groups?: LeagueGroup[];
  rounds: ScheduleRound[];
  standings: Standings;
}

export interface LeagueGroup {
  id: string;
  name: string;
  participants: Participant[];
  standings: Standings;
  fixtures: Fixture[];
}

export interface ScheduleRound {
  id: string;
  roundNumber: number;
  fixtures: Fixture[];
}

export interface Fixture {
  id: string;
  participant1: Participant;
  participant2: Participant;
  result?: FixtureResult;
}

export interface FixtureResult {
  score1: number;
  score2: number;
  winner: Participant | null;
}

export interface Standings {
  entries: StandingEntry[];
}

export interface StandingEntry {
  participant: Participant;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  tiebreakers?: Record<string, number>;
}

export interface StageStructure {
  type: "stage";
  stages: TournamentStage[];
}

export interface TournamentStage {
  id: string;
  name: string;
  stageNumber: number;
  matches: StageMatch[];
  advancementRules: AdvancementRules;
}

export interface StageMatch {
  id: string;
  matchNumber: number;
  participants: Participant[];
  results?: StageMatchResult[];
}

export interface StageMatchResult {
  participant: Participant;
  placement: number;
  advances: boolean;
  metadata?: Record<string, unknown>;
}

export interface AdvancementRules {
  advanceCount: number;
  advanceMethod: "top-n" | "points" | "time";
}

export type RacingMode =
  | "time-trial"
  | "grand-prix"
  | "knockout"
  | "championship";

export interface RacingStructure {
  type: "racing";
  mode: RacingMode;
  events: RacingEvent[];
  standings?: RacingStandings;
}

export interface RacingEvent {
  id: string;
  name: string;
  circuit?: string;
  sessions: RacingSession[];
}

export type RacingSessionType = "practice" | "qualifying" | "sprint" | "race";

export interface RacingSession {
  id: string;
  type: RacingSessionType;
  results: RacingResult[];
}

export interface RacingResult {
  participant: Participant;
  position: number;
  time?: number;
  points?: number;
  status: "finished" | "dnf" | "dsq";
}

export interface RacingStandings {
  drivers: RacingStandingEntry[];
  teams?: RacingStandingEntry[];
}

export interface RacingStandingEntry {
  participant: Participant;
  points: number;
  wins: number;
  podiums: number;
  position: number;
}

export type TournamentStructure =
  | BracketStructure
  | LeagueStructure
  | StageStructure
  | RacingStructure;
