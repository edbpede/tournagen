import type { Component } from "solid-js";
import { tournamentFormatRegistry } from "../registry";
import type {
  BaseTournamentConfig,
  ConfigPanelProps,
  TournamentFormat,
  TournamentFormatMetadata,
  TournamentStructure,
  VisualizerProps,
} from "../types";
import { TournamentFormatType } from "../types";

type BaseConfigFor<T extends TournamentFormatType> = BaseTournamentConfig & {
  formatType: T;
};

const createPlaceholderConfigPanel = <
  TConfig extends BaseTournamentConfig,
>(): Component<ConfigPanelProps<TConfig>> => {
  const Panel: Component<ConfigPanelProps<TConfig>> = (props) => {
    void props.config;
    return null;
  };
  return Panel;
};

const createPlaceholderVisualizer = <
  TConfig extends BaseTournamentConfig,
>(): Component<VisualizerProps<TournamentStructure, TConfig>> => {
  const Visualizer: Component<
    VisualizerProps<TournamentStructure, TConfig>
  > = (props) => {
    void props.structure;
    void props.config;
    return null;
  };
  return Visualizer;
};

const createDefaultStructure = (): TournamentStructure => ({
  type: "bracket",
  rounds: [],
});

const createLeagueStructure = (): TournamentStructure => ({
  type: "league",
  rounds: [],
  standings: { entries: [] },
});

const createStageStructure = (): TournamentStructure => ({
  type: "stage",
  stages: [],
});

const createRacingStructure = (): TournamentStructure => ({
  type: "racing",
  mode: "grand-prix",
  events: [],
});

const defaultFormats: ReadonlyArray<{
  metadata: TournamentFormatMetadata;
  structure: () => TournamentStructure;
}> = [
  {
    metadata: {
      type: TournamentFormatType.SingleElimination,
      name: "Single Elimination",
      description:
        "Fast knockout brackets that auto-fill byes and cleanly show who advances each round.",
      icon: "🏆",
      useCases: [
        "Best for 4-64 players",
        "When time is limited",
        "Streams and playoffs",
      ],
    },
    structure: createDefaultStructure,
  },
  {
    metadata: {
      type: TournamentFormatType.DoubleElimination,
      name: "Double Elimination",
      description:
        "Forgiving brackets with winners and losers paths, including optional grand final reset.",
      icon: "🌀",
      useCases: [
        "Fairer competitive play",
        "LAN events",
        "Two-loss safety net",
      ],
    },
    structure: createDefaultStructure,
  },
  {
    metadata: {
      type: TournamentFormatType.RoundRobin,
      name: "Round Robin",
      description:
        "Everyone plays everyone with auto-generated fixtures and standings tables.",
      icon: "🗓️",
      useCases: [
        "Small leagues",
        "Group stages",
        "Balanced schedules",
      ],
    },
    structure: createLeagueStructure,
  },
  {
    metadata: {
      type: TournamentFormatType.Swiss,
      name: "Swiss",
      description:
        "Score-based pairings that avoid repeats and surface the best performers quickly.",
      icon: "🎯",
      useCases: [
        "Large player pools",
        "4-9 round ladders",
        "Card games & esports",
      ],
    },
    structure: createLeagueStructure,
  },
  {
    metadata: {
      type: TournamentFormatType.FreeForAll,
      name: "Free-for-All",
      description:
        "Multi-participant lobbies with advancement rules for battle royale or party formats.",
      icon: "🌐",
      useCases: [
        "Battle royale lobbies",
        "Party games",
        "Large heats to finals",
      ],
    },
    structure: createStageStructure,
  },
  {
    metadata: {
      type: TournamentFormatType.FIFA,
      name: "FIFA Style",
      description:
        "Group play into knockout brackets with clear connectors from table positions.",
      icon: "⚽️",
      useCases: [
        "Football tournaments",
        "Group-to-bracket flows",
        "Home/away or single leg",
      ],
    },
    structure: createLeagueStructure,
  },
  {
    metadata: {
      type: TournamentFormatType.RacingMarioKart,
      name: "Racing · Mario Kart",
      description:
        "Grand prix, time trials, and elimination cups tailored for kart racing nights.",
      icon: "🏎️",
      useCases: [
        "Grand prix nights",
        "Time trials",
        "Party-friendly scoring",
      ],
    },
    structure: createRacingStructure,
  },
  {
    metadata: {
      type: TournamentFormatType.RacingF1,
      name: "Racing · F1",
      description:
        "Qualifying plus race weekends, sprint options, and full championship standings.",
      icon: "🏁",
      useCases: [
        "Season leaderboards",
        "Quali + race weekends",
        "Team & driver points",
      ],
    },
    structure: createRacingStructure,
  },
];

const createFormat = <T extends TournamentFormatType>(
  metadata: TournamentFormatMetadata & { type: T },
  structure: () => TournamentStructure,
): TournamentFormat<BaseConfigFor<T>, TournamentStructure> => ({
  metadata,
  createDefaultConfig: (participants: BaseTournamentConfig["participants"]) => ({
    id: `${metadata.type}-config`,
    name: metadata.name,
    formatType: metadata.type,
    participants,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  validateConfig: () => ({ valid: true }),
  generateStructure: structure,
  ConfigPanel: createPlaceholderConfigPanel<BaseConfigFor<T>>(),
  Visualizer: createPlaceholderVisualizer<BaseConfigFor<T>>(),
});

export const ensureDefaultFormatsRegistered = (): void => {
  defaultFormats.forEach(({ metadata, structure }) => {
    const existing =
      tournamentFormatRegistry.get<BaseTournamentConfig, TournamentStructure>(
        metadata.type,
      );

    if (existing) {
      return;
    }

    const format = createFormat(metadata, structure);
    tournamentFormatRegistry.register(format);
  });
};
