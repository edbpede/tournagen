# TournaGen Design Document

## Overview

TournaGen is a static tournament generator web application built with Astro, SolidJS, and UnoCSS. The application runs entirely in the browser, providing tournament organizers with an intuitive interface to create, visualize, and manage various tournament formats without requiring backend infrastructure or user accounts.

The architecture embraces Astro's islands pattern, keeping most content static while adding targeted interactivity through SolidJS islands. The design prioritizes modularity to enable easy addition of new tournament formats, performance through minimal JavaScript shipping, and visual clarity through consistent design patterns and clear progression indicators.

### Core Design Principles

1. **Modularity First**: Tournament formats are implemented as plugins with a common interface, allowing new formats to be added without modifying core logic
2. **Static by Default**: Leverage Astro's static rendering for all non-interactive content, hydrating only necessary islands
3. **Fine-Grained Reactivity**: Use SolidJS signals and stores to update only affected DOM nodes when configuration changes
4. **Visual Clarity**: Provide clear visual progression through connecting lines, consistent typography, and hierarchical spacing
5. **Zero Backend**: All logic executes client-side with file-based persistence and optional local storage
6. **Best Practices Adherence**: Follow modern stack guidelines from `.claude/astro-solid-unocss-pro.md` for TypeScript, SolidJS, UnoCSS, and Astro patterns

### Guidelines Compliance

This design strictly follows the patterns specified in `.claude/astro-solid-unocss-pro.md`:

**TypeScript**:
- Strict mode with `astro/tsconfigs/strict`
- Discriminated unions for type-safe state management
- `Component<Props>` typing for all SolidJS components
- `moduleResolution: "bundler"` for Vite compatibility

**SolidJS**:
- Never destructure props (breaks reactivity)
- Use `createSignal` for primitives, `createStore` for nested objects
- Use `createMemo` for derived values, `createEffect` only for side effects
- Use `<For>`, `<Show>`, `<Switch>/<Match>` instead of `.map()` and ternaries
- Always use `onCleanup()` for subscriptions and event listeners
- Use `batch()` for multiple signal updates

**UnoCSS**:
- Static class strings over dynamic interpolation
- Shortcuts for repeated patterns and design system
- `presetWind()` for Tailwind compatibility
- `presetIcons()` for zero-JS icons
- Class-based dark mode for SolidJS control

**Astro**:
- UnoCSS integration before SolidJS (critical for extraction)
- Strategic hydration: `client:visible`, `client:idle`, `client:load`
- Server-fetched data passed as props to islands
- File-based routing for pages
- Static output for deployment

## Architecture

### High-Level Structure

```
TournaGen Application
├── Static Landing Page (Astro)
│   ├── Hero Section
│   ├── Format Cards (generated from registry)
│   └── Feature Highlights
├── Tournament Builder (Astro + SolidJS Islands)
│   ├── Format Selection
│   ├── Configuration Panel (SolidJS Island)
│   ├── Participant Manager (SolidJS Island)
│   └── Visualization (SolidJS Island)
└── Tournament Format Plugins
    ├── Single Elimination
    ├── Double Elimination
    ├── Round Robin
    ├── Swiss
    ├── Free-for-All
    ├── FIFA-Style
    └── Racing (Mario Kart & F1)
```

### Technology Stack

- **Astro 5.16+**: Static site generation with islands architecture
- **SolidJS 1.9+**: Fine-grained reactive UI components
- **UnoCSS 0.66+**: Utility-first CSS with zero runtime
- **TypeScript 5.6+**: Strict type safety with discriminated unions
- **Bun**: Fast package manager and runtime
- **fast-check**: Property-based testing library
- **Vitest**: Unit testing with @solidjs/testing-library

### Stack Configuration

Following the guidelines from `.claude/astro-solid-unocss-pro.md`:

**Integration Order** (critical for proper extraction):
```typescript
// astro.config.mjs
export default defineConfig({
  integrations: [
    UnoCSS({ injectReset: true }), // MUST be before SolidJS
    solidJs()
  ]
});
```

**TypeScript Configuration**:
```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true
  }
}
```

**UnoCSS Configuration**:
```typescript
// uno.config.ts
import { defineConfig, presetWind, presetIcons } from 'unocss';

export default defineConfig({
  presets: [
    presetWind({ dark: 'class' }),
    presetIcons({ cdn: 'https://esm.sh/' })
  ],
  content: {
    pipeline: {
      include: ['src/**/*.{astro,tsx}'],
      exclude: ['node_modules', 'dist']
    }
  }
});
```

### File Structure

```
src/
├── pages/
│   ├── index.astro                 # Landing page
│   └── builder.astro               # Tournament builder page
├── components/
│   ├── landing/
│   │   ├── Hero.astro
│   │   ├── FormatCard.astro
│   │   └── FeatureSection.astro
│   └── builder/
│       ├── FormatSelector.tsx      # SolidJS island
│       ├── ConfigPanel.tsx         # SolidJS island
│       ├── ParticipantManager.tsx  # SolidJS island
│       └── Visualization.tsx       # SolidJS island
├── lib/
│   ├── tournament/
│   │   ├── types.ts                # Core type definitions
│   │   ├── registry.ts             # Format registry
│   │   ├── store.ts                # Global tournament state
│   │   └── formats/
│   │       ├── base.ts             # Base format interface
│   │       ├── single-elimination/
│   │       │   ├── config.ts
│   │       │   ├── generator.ts
│   │       │   └── visualizer.tsx
│   │       ├── double-elimination/
│   │       ├── round-robin/
│   │       ├── swiss/
│   │       ├── ffa/
│   │       ├── fifa/
│   │       └── racing/
│   ├── utils/
│   │   ├── bracket.ts              # Bracket generation utilities
│   │   ├── scheduling.ts           # Scheduling algorithms
│   │   ├── seeding.ts              # Seeding utilities
│   │   └── export.ts               # Import/export logic
│   └── design-system/
│       ├── colors.ts
│       ├── typography.ts
│       └── shortcuts.ts
└── styles/
    └── global.css
```

## Components and Interfaces

### Core Type System

The type system uses discriminated unions to represent different tournament formats and their configurations:

```typescript
// Core participant type
interface Participant {
  id: string;
  name: string;
  seed?: number;
  metadata?: Record<string, unknown>;
}

// Base tournament configuration
interface BaseTournamentConfig {
  id: string;
  name: string;
  formatType: TournamentFormatType;
  participants: Participant[];
  createdAt: Date;
  updatedAt: Date;
}

// Discriminated union for format-specific configs
type TournamentConfig =
  | SingleEliminationConfig
  | DoubleEliminationConfig
  | RoundRobinConfig
  | SwissConfig
  | FFAConfig
  | FIFAConfig
  | RacingConfig;

// Format type discriminator
type TournamentFormatType =
  | "single-elimination"
  | "double-elimination"
  | "round-robin"
  | "swiss"
  | "ffa"
  | "fifa"
  | "racing-mk"
  | "racing-f1";

// Example: Single Elimination specific config
interface SingleEliminationConfig extends BaseTournamentConfig {
  formatType: "single-elimination";
  options: {
    thirdPlacePlayoff: boolean;
    bracketSize: "auto" | 8 | 16 | 32 | 64;
    seedingMethod: "random" | "seeded" | "manual";
  };
}
```

### Tournament Format Plugin Interface

Each tournament format implements a common interface, enabling the plugin architecture.

**Component Typing Pattern** (following SolidJS guidelines):

```typescript
import type { Component } from 'solid-js';

// IMPORTANT: Never destructure props - breaks reactivity
// Always access via props.xyz or use splitProps()

interface ConfigPanelProps<TConfig extends BaseTournamentConfig> {
  config: TConfig;
  onChange: (config: TConfig) => void;
}

interface VisualizerProps {
  structure: TournamentStructure;
  config: BaseTournamentConfig;
}

interface TournamentFormat<TConfig extends BaseTournamentConfig> {
  // Metadata
  readonly type: TournamentFormatType;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly useCases: string[];
  
  // Configuration
  createDefaultConfig(participants: Participant[]): TConfig;
  validateConfig(config: TConfig): ValidationResult;
  
  // Generation
  generateStructure(config: TConfig): TournamentStructure;
  
  // Components (typed with Component<Props>)
  ConfigPanel: Component<ConfigPanelProps<TConfig>>;
  Visualizer: Component<VisualizerProps>;
  
  // Export
  exportData(config: TConfig, structure: TournamentStructure): ExportData;
}

// Example implementation showing proper prop access
const ExampleConfigPanel: Component<ConfigPanelProps<SingleEliminationConfig>> = (props) => {
  // ❌ WRONG: const { config, onChange } = props; // Breaks reactivity!
  
  // ✅ CORRECT: Access directly
  const handleChange = (key: string, value: any) => {
    props.onChange({
      ...props.config,
      options: { ...props.config.options, [key]: value }
    });
  };
  
  return (
    <div>
      <label>
        Third Place Playoff
        <input
          type="checkbox"
          checked={props.config.options.thirdPlacePlayoff}
          onChange={(e) => handleChange('thirdPlacePlayoff', e.target.checked)}
        />
      </label>
    </div>
  );
};

// Validation result
type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

// Tournament structure (format-specific)
type TournamentStructure =
  | BracketStructure
  | LeagueStructure
  | StageStructure
  | RacingStructure;
```

### Format Registry

The registry provides a centralized way to register and access tournament formats:

```typescript
class TournamentFormatRegistry {
  private formats = new Map<TournamentFormatType, TournamentFormat<any>>();
  
  register<T extends BaseTournamentConfig>(format: TournamentFormat<T>): void {
    this.formats.set(format.type, format);
  }
  
  get(type: TournamentFormatType): TournamentFormat<any> | undefined {
    return this.formats.get(type);
  }
  
  getAll(): TournamentFormat<any>[] {
    return Array.from(this.formats.values());
  }
}

// Global registry instance
export const formatRegistry = new TournamentFormatRegistry();
```

### Global State Management

Tournament state is managed using SolidJS stores for fine-grained reactivity.

**State Pattern** (following SolidJS guidelines):

```typescript
import { createStore } from 'solid-js/store';
import { createMemo } from 'solid-js';

interface TournamentState {
  currentConfig: TournamentConfig | null;
  currentStructure: TournamentStructure | null;
  step: BuilderStep;
  isDirty: boolean;
}

type BuilderStep =
  | "format-selection"
  | "configuration"
  | "participants"
  | "review";

// Global store for nested object (use createStore, not createSignal)
// Exported from shared module for cross-island communication
export const [tournamentState, setTournamentState] = createStore<TournamentState>({
  currentConfig: null,
  currentStructure: null,
  step: "format-selection",
  isDirty: false,
});

// Derived values use createMemo (not createEffect!)
// Memos cache results and act as reactivity filters
export const currentFormat = createMemo(() => {
  const config = tournamentState.currentConfig;
  return config ? formatRegistry.get(config.formatType) : null;
});

// Example: Updating nested properties with fine-grained reactivity
export function updateParticipant(id: string, changes: Partial<Participant>) {
  setTournamentState('currentConfig', 'participants', 
    (p) => p.id === id,
    (p) => ({ ...p, ...changes })
  );
  setTournamentState('isDirty', true);
}

// Example: Batch multiple updates
import { batch } from 'solid-js';

export function updateMultipleParticipants(updates: Array<{ id: string; changes: Partial<Participant> }>) {
  batch(() => {
    updates.forEach(({ id, changes }) => {
      updateParticipant(id, changes);
    });
  });
}
```

## Data Models

### Bracket Structures (Elimination Formats)

```typescript
interface BracketStructure {
  type: "bracket";
  rounds: Round[];
  thirdPlaceMatch?: Match;
  grandFinalReset?: Match;
}

interface Round {
  id: string;
  name: string;
  roundNumber: number;
  matches: Match[];
}

interface Match {
  id: string;
  roundId: string;
  position: number;
  participant1: Participant | null;
  participant2: Participant | null;
  winner: Participant | null;
  feedsInto?: string; // Match ID
  isBye: boolean;
}

// Double elimination specific
interface DoubleEliminationStructure extends BracketStructure {
  winnersRounds: Round[];
  losersRounds: Round[];
  grandFinal: Match;
  grandFinalReset?: Match;
}
```

### League Structures (Round Robin, Swiss)

```typescript
interface LeagueStructure {
  type: "league";
  groups?: Group[];
  rounds: ScheduleRound[];
  standings: Standings;
}

interface Group {
  id: string;
  name: string;
  participants: Participant[];
  standings: Standings;
  fixtures: Fixture[];
}

interface ScheduleRound {
  id: string;
  roundNumber: number;
  fixtures: Fixture[];
}

interface Fixture {
  id: string;
  participant1: Participant;
  participant2: Participant;
  result?: FixtureResult;
}

interface FixtureResult {
  score1: number;
  score2: number;
  winner: Participant | null; // null for draw
}

interface Standings {
  entries: StandingEntry[];
}

interface StandingEntry {
  participant: Participant;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  tiebreakers?: Record<string, number>;
}
```

### Stage Structures (FFA, Racing)

```typescript
interface StageStructure {
  type: "stage";
  stages: Stage[];
}

interface Stage {
  id: string;
  name: string;
  stageNumber: number;
  matches: StageMatch[];
  advancementRules: AdvancementRules;
}

interface StageMatch {
  id: string;
  matchNumber: number;
  participants: Participant[];
  results?: StageMatchResult[];
}

interface StageMatchResult {
  participant: Participant;
  placement: number;
  advances: boolean;
  metadata?: Record<string, unknown>; // Format-specific data
}

interface AdvancementRules {
  advanceCount: number;
  advanceMethod: "top-n" | "points" | "time";
}
```

### Racing Structures

```typescript
interface RacingStructure {
  type: "racing";
  mode: "time-trial" | "grand-prix" | "knockout" | "championship";
  events: RacingEvent[];
  standings?: RacingStandings;
}

interface RacingEvent {
  id: string;
  name: string;
  circuit?: string;
  sessions: RacingSession[];
}

interface RacingSession {
  id: string;
  type: "practice" | "qualifying" | "sprint" | "race";
  results: RacingResult[];
}

interface RacingResult {
  participant: Participant;
  position: number;
  time?: number; // milliseconds
  points?: number;
  status: "finished" | "dnf" | "dsq";
}

interface RacingStandings {
  drivers: RacingStandingEntry[];
  teams?: RacingStandingEntry[];
}

interface RacingStandingEntry {
  participant: Participant;
  points: number;
  wins: number;
  podiums: number;
  position: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Format card rendering completeness
*For any* set of registered tournament formats, rendering the format cards should produce cards containing title, description, and use case information for each format.
**Validates: Requirements 1.2, 1.3**

### Property 2: Responsive layout adaptation
*For any* viewport width, the landing page layout should adapt appropriately with different breakpoints for desktop, tablet, and mobile.
**Validates: Requirements 1.5**

### Property 3: Builder step navigation
*For any* builder step beyond the first, the user should be able to navigate backwards to previous steps.
**Validates: Requirements 2.2**

### Property 4: Format configuration panel provision
*For all* registered tournament formats, each format should provide a ConfigPanel component for configuration.
**Validates: Requirements 2.3**

### Property 5: Configuration reactivity
*For any* configuration change, only the affected UI elements should update without triggering full component re-renders.
**Validates: Requirements 2.4, 15.3, 15.4**

### Property 6: Structure labeling
*For any* generated tournament structure, rounds and stages should include proper labels and identifiers.
**Validates: Requirements 2.5**

### Property 7: Participant addition
*For any* valid participant name, adding it to the participant list should increase the list length by exactly one.
**Validates: Requirements 3.1**

### Property 8: Participant removal
*For any* participant in the list, removing it should decrease the list length by exactly one and regenerate the tournament structure.
**Validates: Requirements 3.3**

### Property 9: Participant reordering
*For any* two participants in the list, swapping their positions should swap their positions in the generated tournament structure.
**Validates: Requirements 3.4**

### Property 10: Optional participant fields
*For any* participant, the system should support storing and retrieving optional fields like seed, team, nationality, and metadata.
**Validates: Requirements 3.5**

### Property 11: Bracket connection rendering
*For any* bracket structure, the rendered output should include connecting lines with proper match-to-match references via feedsInto properties.
**Validates: Requirements 4.1**

### Property 12: Bye indication
*For any* bracket with byes, the rendered structure should mark bye matches and show proper advancement paths.
**Validates: Requirements 4.2**

### Property 13: Group-to-knockout connectors
*For any* FIFA-style structure, the rendered output should include visual connectors from group positions to knockout bracket slots.
**Validates: Requirements 4.3**

### Property 14: Multi-stage progression
*For any* multi-stage structure, the rendered output should include progression indicators between stages.
**Validates: Requirements 4.4**

### Property 15: Export-import round trip
*For any* tournament configuration, exporting then importing should produce an equivalent configuration state.
**Validates: Requirements 5.1, 5.2**

### Property 16: Invalid import handling
*For any* invalid import file, the system should not crash and should provide an error message.
**Validates: Requirements 5.3**

### Property 17: Export structure validity
*For any* tournament configuration, the exported JSON should have the expected structure with all required fields.
**Validates: Requirements 5.4**

### Property 18: Local storage persistence
*For any* tournament state, saving to local storage then reloading should restore the equivalent state.
**Validates: Requirements 5.5**

### Property 19: Single elimination round calculation
*For any* participant count N, a single elimination bracket should have exactly ceil(log2(N)) rounds.
**Validates: Requirements 6.1**

### Property 20: Bye generation
*For any* participant count that is not a power of 2, the single elimination structure should include bye matches.
**Validates: Requirements 6.2**

### Property 21: Bracket structure validity
*For any* generated single elimination bracket, all matches should have proper round labels and feedsInto references.
**Validates: Requirements 6.3**

### Property 22: Third-place playoff
*For any* single elimination configuration with third-place playoff enabled, the structure should include exactly one additional match with the losing semifinalists.
**Validates: Requirements 6.4**

### Property 23: Seeding method support
*For any* seeding method (random, seeded, manual), the generated bracket should be valid with participants placed according to the method.
**Validates: Requirements 6.5**

### Property 24: Double elimination structure
*For any* double elimination tournament, the structure should include both winners rounds and losers rounds.
**Validates: Requirements 7.1**

### Property 25: Winners-to-losers connections
*For any* double elimination structure, matches in the winners bracket should have proper references to losers bracket positions.
**Validates: Requirements 7.2**

### Property 26: Grand final reset
*For any* double elimination configuration with reset enabled, the structure should include a conditional reset match.
**Validates: Requirements 7.3, 7.5**

### Property 27: Round robin fixture count
*For any* N participants and M rounds in round robin, the total fixture count should be N*(N-1)/2*M.
**Validates: Requirements 8.1**

### Property 28: Standings structure
*For any* round robin structure, standings should include played, wins, draws, losses, and points for each participant.
**Validates: Requirements 8.2**

### Property 29: Fixture organization
*For any* round robin structure, fixtures should be grouped into rounds with proper round numbers.
**Validates: Requirements 8.3**

### Property 30: Group separation
*For any* round robin with multiple groups, each group should have its own standings and fixtures list.
**Validates: Requirements 8.4**

### Property 31: Swiss pairing by score
*For any* Swiss tournament after round 1, participants with similar scores should be paired together.
**Validates: Requirements 9.1**

### Property 32: Swiss repeat avoidance
*For any* Swiss tournament, no two participants should be paired more than once unless unavoidable.
**Validates: Requirements 9.2**

### Property 33: Swiss standings accumulation
*For any* Swiss tournament, standings should reflect cumulative scores across all completed rounds.
**Validates: Requirements 9.3**

### Property 34: Swiss custom scoring
*For any* Swiss configuration with custom point values, those values should be used in standings calculations.
**Validates: Requirements 9.4**

### Property 35: FFA match participant limits
*For any* FFA match, the number of participants should not exceed the configured maximum.
**Validates: Requirements 10.1**

### Property 36: FFA advancement rules
*For any* FFA match, exactly the configured number of top performers should be marked as advancing.
**Validates: Requirements 10.2**

### Property 37: FFA stage structure
*For any* FFA tournament, the structure should organize matches into stages with proper stage numbers.
**Validates: Requirements 10.3**

### Property 38: FIFA group structure
*For any* FIFA-style tournament, the structure should include groups with round robin fixtures.
**Validates: Requirements 11.1**

### Property 39: FIFA advancement configuration
*For any* FIFA-style tournament, the configuration should specify how many teams advance from each group and their bracket seeding.
**Validates: Requirements 11.2**

### Property 40: FIFA group standings
*For any* FIFA-style group, standings should include points, played, wins, draws, losses, goal difference, and goals scored.
**Validates: Requirements 11.3**

### Property 41: FIFA bracket mapping
*For any* FIFA-style knockout bracket, matches should have proper references to group positions.
**Validates: Requirements 11.4**

### Property 42: Racing time trial ranking
*For any* time trial event, participants should be ranked by fastest time with calculated deltas from the leader.
**Validates: Requirements 12.1**

### Property 43: Racing grand prix accumulation
*For any* grand prix with multiple races, standings should accumulate points across all races.
**Validates: Requirements 12.2**

### Property 44: Racing knockout elimination
*For any* knockout cup race, the specified number of lowest-placed participants should be marked as eliminated.
**Validates: Requirements 12.3**

### Property 45: F1 session structure
*For any* F1 single Grand Prix, the structure should include both qualifying and race sessions in proper order.
**Validates: Requirements 13.1**

### Property 46: F1 championship accumulation
*For any* F1 championship season, driver standings should accumulate points across all events.
**Validates: Requirements 13.2**

### Property 47: No external network calls
*For any* tournament operation (generation, save, load), the system should not make external network requests.
**Validates: Requirements 16.1, 16.2, 16.4**

### Property 48: Offline functionality
*For any* tournament operation after initial page load, the system should function with network disabled.
**Validates: Requirements 16.3**

### Property 49: Format registration
*For any* new tournament format registered in the registry, it should become available without modifying core builder code.
**Validates: Requirements 17.1**

### Property 50: Format interface compliance
*For all* registered tournament formats, each should implement the required TournamentFormat interface methods and components.
**Validates: Requirements 17.2, 17.3**

### Property 51: Dynamic format card generation
*For any* format added to the registry, it should automatically appear in the landing page format cards.
**Validates: Requirements 17.5**


## Error Handling

### Validation Errors

The system uses discriminated unions for validation results, providing type-safe error handling:

```typescript
type ValidationResult =
  | { valid: true }
  | { valid: false; errors: ValidationError[] };

interface ValidationError {
  field: string;
  message: string;
  code: string;
}
```

**Validation scenarios:**
- Insufficient participants for format (e.g., < 2 for elimination)
- Invalid configuration values (e.g., negative round counts)
- Conflicting options (e.g., manual seeding without seed values)
- Invalid participant data (e.g., duplicate IDs)

### Import/Export Errors

Import errors are handled gracefully with user-friendly messages:

```typescript
type ImportResult =
  | { success: true; config: TournamentConfig }
  | { success: false; error: ImportError };

interface ImportError {
  type: "invalid-json" | "invalid-schema" | "unsupported-version" | "missing-format";
  message: string;
  recoverable: boolean;
}
```

**Error recovery:**
- Invalid JSON: Prompt to check file format
- Invalid schema: Offer to create new tournament
- Unsupported version: Attempt migration or suggest re-creation
- Missing format: List available formats

### Runtime Errors

SolidJS ErrorBoundary components wrap islands to prevent cascading failures:

```typescript
<ErrorBoundary
  fallback={(err, reset) => (
    <div class="error-container">
      <h3>Something went wrong</h3>
      <p>{err.message}</p>
      <button onClick={reset}>Try Again</button>
    </div>
  )}
>
  <TournamentBuilder />
</ErrorBoundary>
```

### User Input Validation

Real-time validation with clear feedback:

- Participant names: Non-empty, reasonable length
- Configuration values: Within valid ranges
- File uploads: Size limits, format checks
- Seed values: Unique, within participant count


## Testing Strategy

### Dual Testing Approach

TournaGen employs both unit testing and property-based testing to ensure comprehensive coverage:

**Unit Tests** verify:
- Specific examples and edge cases
- Integration between components
- UI interactions and user flows
- Error handling scenarios

**Property-Based Tests** verify:
- Universal properties across all inputs
- Correctness of algorithms (bracket generation, scheduling, seeding)
- Data integrity through transformations
- Round-trip consistency (export/import, serialize/deserialize)

### Property-Based Testing Framework

**Library**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**: Each property test runs a minimum of 100 iterations to ensure statistical confidence.

**Test Tagging**: Each property-based test includes a comment explicitly referencing the design document property:

```typescript
// Feature: tournagen, Property 19: Single elimination round calculation
fc.assert(
  fc.property(fc.integer({ min: 2, max: 128 }), (participantCount) => {
    const bracket = generateSingleEliminationBracket(participantCount);
    const expectedRounds = Math.ceil(Math.log2(participantCount));
    return bracket.rounds.length === expectedRounds;
  }),
  { numRuns: 100 }
);
```

### Unit Testing Framework

**Library**: Vitest with @solidjs/testing-library

**Coverage areas**:
- Component rendering and interactions
- State management and reactivity
- Format-specific logic
- Utility functions
- Import/export functionality

**Example unit test**:

```typescript
import { render, fireEvent } from '@solidjs/testing-library';
import { describe, it, expect } from 'vitest';
import { ParticipantManager } from './ParticipantManager';

describe('ParticipantManager', () => {
  it('adds participant when form is submitted', () => {
    const { getByRole, getByText } = render(() => <ParticipantManager />);
    
    const input = getByRole('textbox');
    const button = getByRole('button', { name: /add/i });
    
    fireEvent.input(input, { target: { value: 'Player 1' } });
    fireEvent.click(button);
    
    expect(getByText('Player 1')).toBeInTheDocument();
  });
});
```

### Test Organization

```
src/
├── lib/
│   └── tournament/
│       └── formats/
│           └── single-elimination/
│               ├── generator.ts
│               ├── generator.test.ts          # Unit tests
│               └── generator.property.test.ts # Property tests
└── components/
    └── builder/
        ├── ParticipantManager.tsx
        └── ParticipantManager.test.tsx
```

### Property Test Generators

Custom generators for tournament-specific data:

```typescript
// Participant generator
const participantArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  seed: fc.option(fc.integer({ min: 1, max: 100 })),
});

// Participant list generator
const participantListArb = (min: number, max: number) =>
  fc.array(participantArb, { minLength: min, maxLength: max })
    .map(participants => 
      participants.map((p, i) => ({ ...p, id: `p${i}` }))
    );

// Configuration generator
const singleEliminationConfigArb = fc.record({
  formatType: fc.constant('single-elimination' as const),
  participants: participantListArb(2, 64),
  options: fc.record({
    thirdPlacePlayoff: fc.boolean(),
    bracketSize: fc.constantFrom('auto', 8, 16, 32, 64),
    seedingMethod: fc.constantFrom('random', 'seeded', 'manual'),
  }),
});
```

### Integration Testing

End-to-end user flows tested with Playwright:

- Complete tournament creation flow
- Export and import workflow
- Format switching and configuration
- Responsive layout behavior
- Offline functionality

### Performance Testing

- Bundle size monitoring (target: <100KB compressed JS)
- Lighthouse CI for performance budgets
- Reactivity benchmarks (update granularity)
- Large tournament stress tests (1000+ participants)


## Design System

### Color Palette

```typescript
// uno.config.ts
export default defineConfig({
  theme: {
    colors: {
      brand: {
        50: '#eff6ff',
        100: '#dbeafe',
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',  // Primary brand color
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e40af',
        900: '#1e3a8a',
      },
      accent: {
        500: '#8b5cf6',  // Secondary accent
        600: '#7c3aed',
      },
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      neutral: {
        50: '#fafafa',
        100: '#f5f5f5',
        200: '#e5e5e5',
        300: '#d4d4d4',
        400: '#a3a3a3',
        500: '#737373',
        600: '#525252',
        700: '#404040',
        800: '#262626',
        900: '#171717',
      },
    },
  },
});
```

### Typography Scale

```typescript
// UnoCSS shortcuts
shortcuts: [
  // Headings
  { 'heading-1': 'text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50' },
  { 'heading-2': 'text-3xl md:text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50' },
  { 'heading-3': 'text-2xl md:text-3xl font-semibold text-neutral-900 dark:text-neutral-50' },
  { 'heading-4': 'text-xl md:text-2xl font-semibold text-neutral-800 dark:text-neutral-100' },
  { 'heading-5': 'text-lg md:text-xl font-semibold text-neutral-800 dark:text-neutral-100' },
  
  // Body text
  { 'body-lg': 'text-lg leading-relaxed text-neutral-700 dark:text-neutral-300' },
  { 'body': 'text-base leading-relaxed text-neutral-700 dark:text-neutral-300' },
  { 'body-sm': 'text-sm leading-relaxed text-neutral-600 dark:text-neutral-400' },
  { 'caption': 'text-xs text-neutral-500 dark:text-neutral-500' },
]
```

### Spacing System

Consistent spacing scale based on 4px base unit:

- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-6`: 24px
- `space-8`: 32px
- `space-12`: 48px
- `space-16`: 64px
- `space-24`: 96px

### Component Patterns

```typescript
// UnoCSS shortcuts for common components
shortcuts: [
  // Buttons
  { 'btn-base': 'px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2' },
  { 'btn-primary': 'btn-base bg-brand-500 hover:bg-brand-600 text-white focus:ring-brand-500' },
  { 'btn-secondary': 'btn-base bg-neutral-200 hover:bg-neutral-300 text-neutral-900 focus:ring-neutral-500' },
  { 'btn-ghost': 'btn-base bg-transparent hover:bg-neutral-100 text-neutral-700 focus:ring-neutral-500' },
  
  // Cards
  { 'card': 'bg-white dark:bg-neutral-800 rounded-xl shadow-md p-6 border border-neutral-200 dark:border-neutral-700' },
  { 'card-hover': 'card transition-all duration-200 hover:shadow-lg hover:scale-102' },
  
  // Inputs
  { 'input': 'px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent' },
  
  // Badges
  { 'badge': 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium' },
  { 'badge-primary': 'badge bg-brand-100 text-brand-800' },
  { 'badge-success': 'badge bg-green-100 text-green-800' },
  { 'badge-warning': 'badge bg-yellow-100 text-yellow-800' },
  
  // Tournament-specific
  { 'bracket-line': 'stroke-neutral-400 dark:stroke-neutral-600 stroke-2' },
  { 'match-box': 'bg-white dark:bg-neutral-800 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg p-3' },
  { 'match-box-winner': 'match-box border-brand-500 bg-brand-50 dark:bg-brand-900/20' },
  { 'stage-connector': 'stroke-brand-500 stroke-2 fill-none' },
]
```

### Visual Hierarchy

**Elevation system** using shadows:

```typescript
shortcuts: [
  { 'elevation-1': 'shadow-sm' },
  { 'elevation-2': 'shadow-md' },
  { 'elevation-3': 'shadow-lg' },
  { 'elevation-4': 'shadow-xl' },
]
```

**Z-index scale**:

- Base content: 0
- Dropdowns: 10
- Sticky headers: 20
- Modals: 30
- Toasts: 40

### Responsive Breakpoints

```typescript
theme: {
  breakpoints: {
    sm: '640px',   // Mobile landscape
    md: '768px',   // Tablet
    lg: '1024px',  // Desktop
    xl: '1280px',  // Large desktop
    '2xl': '1536px', // Extra large
  },
}
```

### Dark Mode

Class-based dark mode for SolidJS control:

```typescript
// uno.config.ts
presets: [
  presetWind({ dark: 'class' }),
]

// Dark mode toggle component
const [darkMode, setDarkMode] = createSignal(false);

createEffect(() => {
  document.documentElement.classList.toggle('dark', darkMode());
});
```

### Icons

Using UnoCSS preset-icons with Iconify:

```typescript
// uno.config.ts
presets: [
  presetIcons({
    scale: 1.2,
    cdn: 'https://esm.sh/',
    collections: {
      carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default),
      mdi: () => import('@iconify-json/mdi/icons.json').then(i => i.default),
    },
  }),
]

// Usage in components
<div class="i-carbon-trophy text-2xl text-brand-500" />
<div class="i-mdi-account-group text-xl" />
```

### Animation

Subtle transitions for polish:

```typescript
shortcuts: [
  { 'transition-base': 'transition-all duration-200 ease-in-out' },
  { 'transition-slow': 'transition-all duration-300 ease-in-out' },
  { 'hover-lift': 'transition-base hover:translate-y--1 hover:shadow-lg' },
]
```


## Format-Specific Designs

### Single Elimination

**Generator Algorithm**:

```typescript
function generateSingleEliminationBracket(
  participants: Participant[],
  options: SingleEliminationOptions
): BracketStructure {
  const count = participants.length;
  const roundCount = Math.ceil(Math.log2(count));
  const bracketSize = options.bracketSize === 'auto' 
    ? Math.pow(2, roundCount)
    : options.bracketSize;
  
  // Apply seeding
  const seeded = applySeedingMethod(participants, options.seedingMethod);
  
  // Generate first round with byes
  const firstRound = generateFirstRound(seeded, bracketSize);
  
  // Generate subsequent rounds
  const rounds = [firstRound];
  for (let i = 1; i < roundCount; i++) {
    rounds.push(generateNextRound(rounds[i - 1]));
  }
  
  // Add third-place playoff if enabled
  const thirdPlaceMatch = options.thirdPlacePlayoff
    ? generateThirdPlaceMatch(rounds[rounds.length - 2])
    : undefined;
  
  return { type: 'bracket', rounds, thirdPlaceMatch };
}
```

**Visualization**: Tree-like bracket with SVG connecting lines between matches.

### Double Elimination

**Generator Algorithm**:

```typescript
function generateDoubleEliminationBracket(
  participants: Participant[],
  options: DoubleEliminationOptions
): DoubleEliminationStructure {
  // Winners bracket (same as single elimination)
  const winnersRounds = generateWinnersBracket(participants);
  
  // Losers bracket (receives losers from winners bracket)
  const losersRounds = generateLosersBracket(winnersRounds);
  
  // Grand final
  const grandFinal = generateGrandFinal(
    winnersRounds[winnersRounds.length - 1],
    losersRounds[losersRounds.length - 1]
  );
  
  // Optional reset match
  const grandFinalReset = options.enableReset
    ? generateResetMatch(grandFinal)
    : undefined;
  
  return {
    type: 'bracket',
    winnersRounds,
    losersRounds,
    grandFinal,
    grandFinalReset,
    rounds: [...winnersRounds, ...losersRounds],
  };
}
```

**Visualization**: Side-by-side brackets with drop-down connectors from winners to losers.

### Round Robin

**Scheduling Algorithm** (Circle method):

```typescript
function generateRoundRobinSchedule(
  participants: Participant[],
  rounds: number
): ScheduleRound[] {
  const n = participants.length;
  const isOdd = n % 2 === 1;
  const players = isOdd ? [...participants, null] : [...participants];
  
  const schedule: ScheduleRound[] = [];
  
  for (let round = 0; round < rounds; round++) {
    const roundFixtures: Fixture[] = [];
    
    // Generate fixtures for this round using circle method
    for (let i = 0; i < players.length / 2; i++) {
      const home = players[i];
      const away = players[players.length - 1 - i];
      
      if (home && away) {
        roundFixtures.push({
          id: `r${round}-f${i}`,
          participant1: home,
          participant2: away,
        });
      }
    }
    
    schedule.push({
      id: `round-${round}`,
      roundNumber: round + 1,
      fixtures: roundFixtures,
    });
    
    // Rotate players (keep first fixed)
    players.splice(1, 0, players.pop()!);
  }
  
  return schedule;
}
```

**Visualization**: Tables with standings and fixture lists grouped by round.

### Swiss

**Pairing Algorithm**:

```typescript
function generateSwissPairings(
  participants: Participant[],
  previousRounds: ScheduleRound[],
  roundNumber: number
): ScheduleRound {
  // Calculate current standings
  const standings = calculateStandings(participants, previousRounds);
  
  // Group by score
  const scoreGroups = groupByScore(standings);
  
  // Pair within each score group
  const fixtures: Fixture[] = [];
  
  for (const group of scoreGroups) {
    const unpaired = [...group];
    
    while (unpaired.length >= 2) {
      const p1 = unpaired.shift()!;
      
      // Find best opponent (hasn't played before)
      const p2Index = unpaired.findIndex(p => 
        !hasPlayedBefore(p1, p, previousRounds)
      );
      
      const p2 = p2Index >= 0 
        ? unpaired.splice(p2Index, 1)[0]
        : unpaired.shift()!; // Allow repeat if necessary
      
      fixtures.push({
        id: `r${roundNumber}-${fixtures.length}`,
        participant1: p1.participant,
        participant2: p2.participant,
      });
    }
    
    // Handle bye if odd number
    if (unpaired.length === 1) {
      // Assign bye (handled in standings calculation)
    }
  }
  
  return {
    id: `round-${roundNumber}`,
    roundNumber,
    fixtures,
  };
}
```

**Visualization**: Round-by-round pairings with cumulative standings table.

### Free-for-All

**Stage Generation**:

```typescript
function generateFFAStages(
  participants: Participant[],
  options: FFAOptions
): StageStructure {
  const stages: Stage[] = [];
  let remaining = [...participants];
  let stageNumber = 1;
  
  while (remaining.length > options.finalSize) {
    const matchCount = Math.ceil(remaining.length / options.lobbySize);
    const matches: StageMatch[] = [];
    
    for (let i = 0; i < matchCount; i++) {
      const matchParticipants = remaining.splice(0, options.lobbySize);
      matches.push({
        id: `s${stageNumber}-m${i}`,
        matchNumber: i + 1,
        participants: matchParticipants,
      });
    }
    
    stages.push({
      id: `stage-${stageNumber}`,
      name: `Stage ${stageNumber}`,
      stageNumber,
      matches,
      advancementRules: {
        advanceCount: options.advancePerMatch,
        advanceMethod: 'top-n',
      },
    });
    
    // Prepare for next stage
    remaining = matches.flatMap(m => 
      m.participants.slice(0, options.advancePerMatch)
    );
    stageNumber++;
  }
  
  // Final stage
  stages.push({
    id: `stage-${stageNumber}`,
    name: 'Final',
    stageNumber,
    matches: [{
      id: `s${stageNumber}-m0`,
      matchNumber: 1,
      participants: remaining,
    }],
    advancementRules: {
      advanceCount: 1,
      advanceMethod: 'top-n',
    },
  });
  
  return { type: 'stage', stages };
}
```

**Visualization**: Stage blocks with participant lists and advancement indicators.

### FIFA-Style

**Hybrid Structure**:

```typescript
function generateFIFAStructure(
  participants: Participant[],
  options: FIFAOptions
): FIFAStructure {
  // Group stage
  const groups = distributeIntoGroups(participants, options.groupCount);
  const groupStructures = groups.map(group => ({
    id: group.id,
    name: group.name,
    participants: group.participants,
    fixtures: generateRoundRobinSchedule(group.participants, 1),
    standings: initializeStandings(group.participants),
  }));
  
  // Determine advancement
  const advancingTeams = groupStructures.flatMap(group => 
    group.standings.entries
      .slice(0, options.advancePerGroup)
      .map(entry => entry.participant)
  );
  
  // Knockout bracket
  const knockoutBracket = generateKnockoutBracket(
    advancingTeams,
    options.knockoutOptions
  );
  
  return {
    type: 'fifa',
    groups: groupStructures,
    knockout: knockoutBracket,
  };
}
```

**Visualization**: Group tables with connectors to knockout bracket positions.

### Racing Formats

**Time Trial**:

```typescript
function generateTimeTrial(
  participants: Participant[],
  tracks: string[]
): RacingStructure {
  const events = tracks.map((track, i) => ({
    id: `event-${i}`,
    name: track,
    circuit: track,
    sessions: [{
      id: `session-${i}`,
      type: 'race' as const,
      results: participants.map(p => ({
        participant: p,
        position: 0, // To be filled
        time: 0,
        status: 'finished' as const,
      })),
    }],
  }));
  
  return {
    type: 'racing',
    mode: 'time-trial',
    events,
  };
}
```

**Grand Prix**:

```typescript
function generateGrandPrix(
  participants: Participant[],
  races: number,
  pointsSystem: number[]
): RacingStructure {
  const events: RacingEvent[] = [];
  
  for (let i = 0; i < races; i++) {
    events.push({
      id: `race-${i}`,
      name: `Race ${i + 1}`,
      sessions: [{
        id: `session-${i}`,
        type: 'race',
        results: participants.map((p, pos) => ({
          participant: p,
          position: pos + 1,
          points: pointsSystem[pos] || 0,
          status: 'finished',
        })),
      }],
    });
  }
  
  const standings = calculateRacingStandings(events, participants);
  
  return {
    type: 'racing',
    mode: 'grand-prix',
    events,
    standings,
  };
}
```

**Visualization**: Leaderboards, race results tables, and championship standings.


## Performance Considerations

### Bundle Size Optimization

**Target**: <100KB compressed JavaScript for initial load

**Strategies**:
1. **Static by default**: Most landing page content is static Astro components
2. **Strategic hydration**: Only builder islands use `client:*` directives
3. **Code splitting**: Each tournament format is a separate chunk
4. **Tree shaking**: ES modules with proper exports
5. **Lazy loading**: Heavy visualizations load on demand

```typescript
// Lazy load format visualizers
const SingleEliminationVisualizer = lazy(() => 
  import('./formats/single-elimination/visualizer')
);

<Suspense fallback={<LoadingSpinner />}>
  <SingleEliminationVisualizer structure={structure()} />
</Suspense>
```

### Reactivity Optimization

**Fine-grained updates** using SolidJS control flow (following guidelines):

```typescript
import { For, Show, Switch, Match } from 'solid-js';
import type { Component } from 'solid-js';

// ❌ BAD: Using .map() - recreates all DOM on every update
const ParticipantListBad: Component = () => {
  const [participants, setParticipants] = createSignal([]);
  return (
    <div>
      {participants().map(p => <div>{p.name}</div>)}
    </div>
  );
};

// ✅ GOOD: Using <For> - stable references, fine-grained updates
const ParticipantList: Component = () => {
  const [participants, setParticipants] = createSignal([]);
  return (
    <For each={participants()}>
      {(participant, index) => (
        <ParticipantItem 
          participant={participant} 
          index={index()} 
        />
      )}
    </For>
  );
};

// ✅ GOOD: Using <Show> for conditionals with type narrowing
const TournamentView: Component = () => {
  const structure = createMemo(() => generateStructure());
  
  return (
    <Show 
      when={structure()} 
      fallback={<div>No tournament configured</div>}
    >
      {(s) => <BracketVisualizer structure={s()} />}
    </Show>
  );
};

// ✅ GOOD: Using <Switch>/<Match> for multiple conditions
const FormatSelector: Component = () => {
  const [selectedFormat, setSelectedFormat] = createSignal<TournamentFormatType>('single-elimination');
  
  return (
    <Switch>
      <Match when={selectedFormat() === 'single-elimination'}>
        <SingleEliminationConfig />
      </Match>
      <Match when={selectedFormat() === 'double-elimination'}>
        <DoubleEliminationConfig />
      </Match>
      <Match when={selectedFormat() === 'round-robin'}>
        <RoundRobinConfig />
      </Match>
    </Switch>
  );
};
```

**Memoization** for expensive computations (use createMemo, not createEffect):

```typescript
import { createMemo, createEffect, onCleanup } from 'solid-js';

// ✅ CORRECT: Use createMemo for derived values
const tournamentStructure = createMemo(() => {
  const config = tournamentState.currentConfig;
  if (!config) return null;
  
  const format = formatRegistry.get(config.formatType);
  return format?.generateStructure(config);
});

// ✅ CORRECT: Use createEffect ONLY for side effects
createEffect(() => {
  const structure = tournamentStructure();
  if (structure) {
    console.log('Structure updated:', structure);
  }
});

// ✅ CORRECT: Always cleanup in effects
createEffect(() => {
  const handleResize = () => {
    // Update bracket layout
  };
  
  window.addEventListener('resize', handleResize);
  
  onCleanup(() => {
    window.removeEventListener('resize', handleResize);
  });
});

// ❌ WRONG: Never set signals in effects (causes extra render cycles)
createEffect(() => {
  const config = tournamentState.currentConfig;
  setDerivedValue(computeSomething(config)); // WRONG!
});
```

**Batching** multiple updates:

```typescript
function updateMultipleParticipants(updates: ParticipantUpdate[]) {
  batch(() => {
    updates.forEach(update => {
      setTournamentState('currentConfig', 'participants', 
        p => p.id === update.id ? { ...p, ...update.changes } : p
      );
    });
  });
}
```

### Rendering Performance

**Virtual scrolling** for large participant lists:

```typescript
import { createVirtualizer } from '@tanstack/solid-virtual';

const ParticipantList = () => {
  const [participants] = createSignal(/* large array */);
  
  const virtualizer = createVirtualizer({
    count: participants().length,
    getScrollElement: () => parentRef,
    estimateSize: () => 50,
  });
  
  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        <For each={virtualizer.getVirtualItems()}>
          {(virtualRow) => (
            <div style={{ transform: `translateY(${virtualRow.start}px)` }}>
              {participants()[virtualRow.index].name}
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
```

**SVG optimization** for brackets:

- Use `<use>` elements for repeated shapes
- Minimize path complexity
- Apply CSS transforms instead of recalculating paths
- Use `will-change` for animated elements

### Memory Management

**Cleanup** in effects:

```typescript
createEffect(() => {
  const handleResize = () => updateBracketLayout();
  window.addEventListener('resize', handleResize);
  
  onCleanup(() => {
    window.removeEventListener('resize', handleResize);
  });
});
```

**Weak references** for large data:

```typescript
const structureCache = new WeakMap<TournamentConfig, TournamentStructure>();

function getCachedStructure(config: TournamentConfig): TournamentStructure {
  if (structureCache.has(config)) {
    return structureCache.get(config)!;
  }
  
  const structure = generateStructure(config);
  structureCache.set(config, structure);
  return structure;
}
```

### Build Optimization

**Astro configuration**:

```typescript
export default defineConfig({
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks: {
            'solid': ['solid-js'],
            'formats': [
              './src/lib/tournament/formats/single-elimination',
              './src/lib/tournament/formats/double-elimination',
              // ... other formats
            ],
          },
        },
      },
    },
  },
});
```

**UnoCSS optimization**:

```typescript
export default defineConfig({
  presets: [presetWind()],
  safelist: [], // Keep empty, use static classes
  blocklist: ['container'], // Remove unused utilities
  content: {
    pipeline: {
      include: ['src/**/*.{astro,tsx}'],
      exclude: ['node_modules', 'dist'],
    },
  },
});
```


## Accessibility

### Semantic HTML

Use proper semantic elements throughout:

```astro
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
      <li><a href="/builder">Builder</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Tournament Builder</h1>
    <section aria-labelledby="config-heading">
      <h2 id="config-heading">Configuration</h2>
      <!-- Content -->
    </section>
  </article>
</main>
```

### Keyboard Navigation

All interactive elements must be keyboard accessible:

```typescript
const Button: Component<ButtonProps> = (props) => {
  return (
    <button
      onClick={props.onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          props.onClick();
        }
      }}
      aria-label={props.ariaLabel}
    >
      {props.children}
    </button>
  );
};
```

### ARIA Labels

Provide descriptive labels for screen readers:

```typescript
<div role="region" aria-label="Tournament bracket">
  <div role="list" aria-label="Round 1 matches">
    <div role="listitem" aria-label="Match 1: Player A vs Player B">
      {/* Match content */}
    </div>
  </div>
</div>
```

### Focus Management

Manage focus for dynamic content:

```typescript
const Modal: Component<ModalProps> = (props) => {
  let firstFocusable: HTMLElement;
  let lastFocusable: HTMLElement;
  
  onMount(() => {
    firstFocusable?.focus();
  });
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable?.focus();
      } else if (!e.shiftKey && document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable?.focus();
      }
    }
    
    if (e.key === 'Escape') {
      props.onClose();
    }
  };
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onKeyDown={handleKeyDown}
    >
      {/* Modal content */}
    </div>
  );
};
```

### Color Contrast

Ensure WCAG AA compliance (4.5:1 for normal text, 3:1 for large text):

```typescript
// Design system colors meet contrast requirements
colors: {
  // Text on white background
  'text-primary': '#171717',    // 16.1:1 contrast
  'text-secondary': '#404040',  // 10.4:1 contrast
  
  // Text on brand background
  'brand-500': '#3b82f6',       // Use white text (4.6:1)
  'brand-600': '#2563eb',       // Use white text (5.9:1)
}
```

### Screen Reader Announcements

Use live regions for dynamic updates:

```typescript
const TournamentBuilder = () => {
  const [announcement, setAnnouncement] = createSignal('');
  
  const addParticipant = (name: string) => {
    // Add participant logic
    setAnnouncement(`Added participant: ${name}`);
  };
  
  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        class="sr-only"
      >
        {announcement()}
      </div>
      {/* Rest of component */}
    </>
  );
};
```

### Skip Links

Provide skip navigation for keyboard users:

```astro
<a href="#main-content" class="skip-link">
  Skip to main content
</a>

<style>
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--brand-500);
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
  }
  
  .skip-link:focus {
    top: 0;
  }
</style>
```

## Security

### Content Security Policy

Implement strict CSP headers:

```typescript
// astro.config.mjs (Astro 5.9+)
export default defineConfig({
  experimental: {
    csp: {
      hashFunction: 'sha256',
      directives: [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'", // UnoCSS requires inline styles
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
    },
  },
});
```

### Input Sanitization

Sanitize all user input:

```typescript
function sanitizeParticipantName(name: string): string {
  // Remove potentially dangerous characters
  return name
    .trim()
    .replace(/[<>\"']/g, '')
    .slice(0, 100); // Max length
}

function validateConfig(config: unknown): ValidationResult {
  // Use Zod or similar for schema validation
  const schema = z.object({
    formatType: z.enum(['single-elimination', /* ... */]),
    participants: z.array(participantSchema).min(2).max(1000),
    // ... other fields
  });
  
  try {
    schema.parse(config);
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      errors: error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      })),
    };
  }
}
```

### XSS Prevention

SolidJS auto-escapes by default, but be careful with dynamic content:

```typescript
// ✅ SAFE: Auto-escaped
const SafeComponent = (props) => (
  <div>{props.userInput}</div>
);

// ❌ UNSAFE: Bypasses escaping
const UnsafeComponent = (props) => (
  <div innerHTML={props.userInput}></div>
);

// ✅ SAFE: Sanitized if HTML is needed
import DOMPurify from 'isomorphic-dompurify';

const SafeHTMLComponent = (props) => (
  <div innerHTML={DOMPurify.sanitize(props.userInput)}></div>
);
```

### Local Storage Security

Validate data from local storage:

```typescript
function loadFromLocalStorage(): TournamentConfig | null {
  try {
    const data = localStorage.getItem('tournament-state');
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    const validation = validateConfig(parsed);
    
    if (!validation.valid) {
      console.warn('Invalid data in local storage', validation.errors);
      return null;
    }
    
    return parsed as TournamentConfig;
  } catch (error) {
    console.error('Failed to load from local storage', error);
    return null;
  }
}
```

### Dependency Security

Regular security audits:

```json
{
  "scripts": {
    "audit": "bun audit",
    "audit:fix": "bun audit --fix"
  }
}
```

## Deployment

### Static Site Generation

Build for static deployment:

```bash
bun run build
# Output: dist/ directory with static files
```

### Hosting Options

**Recommended platforms**:
- Vercel (automatic deployments from Git)
- Netlify (drag-and-drop or Git integration)
- Cloudflare Pages (global CDN)
- GitHub Pages (free for public repos)

### Build Configuration

```typescript
// astro.config.mjs
export default defineConfig({
  output: 'static',
  site: 'https://tournagen.example.com',
  base: '/', // Change if deploying to subdirectory
  build: {
    assets: '_assets',
  },
});
```

### Environment Variables

No secrets needed (client-side only), but can use for build-time config:

```bash
# .env
PUBLIC_SITE_URL=https://tournagen.example.com
PUBLIC_ANALYTICS_ID=UA-XXXXX-Y
```

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest
      
      - name: Install dependencies
        run: bun install --frozen-lockfile
      
      - name: Type check
        run: bun run typecheck
      
      - name: Build
        run: bun run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          working-directory: ./
```

## Future Enhancements

### Potential Features

1. **Tournament Templates**: Pre-configured templates for common tournament types
2. **Bracket Customization**: Drag-and-drop bracket editing
3. **Live Updates**: Real-time score updates (with optional backend)
4. **Print Layouts**: Optimized print stylesheets for physical brackets
5. **Multi-language Support**: i18n for international users
6. **Advanced Statistics**: Win rates, performance metrics, head-to-head records
7. **Tournament History**: Track multiple tournaments over time
8. **Sharing**: Generate shareable links (would require backend)
9. **Mobile App**: Native mobile version with offline support
10. **Additional Formats**: Ladder, gauntlet, king of the hill, etc.

### Extensibility Points

The modular architecture makes these additions straightforward:

- **New formats**: Implement `TournamentFormat` interface and register
- **New visualizations**: Create new visualizer components
- **New export formats**: Add to export utility (PDF, CSV, etc.)
- **New seeding methods**: Add to seeding utility
- **Custom scoring**: Extend scoring configuration options

