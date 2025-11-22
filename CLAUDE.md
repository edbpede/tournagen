# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TournaGen is a static tournament generator web application that creates, visualizes, and manages various tournament formats entirely in the browser. The application targets hobby sports leagues, esports communities, school tournaments, and online events with a **client-side only architecture** (no backend required).

**Core Principles:**
- Modularity first: Tournament formats as plugins
- Static by default with targeted interactivity
- Fine-grained reactivity for performance
- Zero backend dependency
- Visual clarity through consistent design

## Common Commands

All commands run from the project root using Bun:

```bash
bun install          # Install dependencies
bun dev              # Start dev server at localhost:4321
bun build            # Build production site to ./dist/
bun preview          # Preview production build locally
bun test             # Run test suite
bun astro ...        # Run Astro CLI commands
```

### Running Tests

- `bun test` - Run all tests (uses Bun's built-in test runner, compatible with Vitest API)
- `bun test <file>` - Run specific test file
- Test files use `.test.ts` suffix, property-based tests use `.property.test.ts`
- Property-based tests must use `fast-check` with minimum 100 iterations

## Architecture

### Stack

- **Astro 5.16+**: Static site generator with island architecture
- **SolidJS 1.9+**: Reactive UI framework for interactive components
- **UnoCSS 66.5+**: Atomic CSS engine for utility-first styling
- **TypeScript 5.6+**: Strict mode with discriminated unions
- **Bun**: Package manager and runtime

### Critical Integration Order

In `astro.config.mjs`, UnoCSS **MUST** come before SolidJS for proper CSS extraction:

```typescript
export default defineConfig({
  integrations: [
    UnoCSS({ injectReset: true }), // MUST be first
    solidJs()
  ]
});
```

**This is not negotiable - the order matters for extraction.**

### Directory Structure

```
src/
├── pages/                    # File-based routing (Astro)
│   ├── index.astro          # Landing page (static)
│   └── builder.astro        # Tournament builder (with islands)
├── components/
│   ├── landing/             # Static Astro components
│   │   ├── Hero.astro
│   │   ├── FormatCard.astro
│   │   └── FeatureSection.astro
│   └── builder/             # Interactive SolidJS islands
│       ├── FormatSelector.tsx
│       ├── ConfigPanel.tsx
│       ├── ParticipantManager.tsx
│       └── Visualization.tsx
├── lib/
│   ├── tournament/          # Tournament core logic
│   │   ├── types.ts        # Core type definitions
│   │   ├── registry.ts     # Format registry
│   │   ├── store.ts        # Global tournament state
│   │   └── formats/        # Tournament format plugins
│   │       ├── base.ts
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
│   ├── utils/              # Utility functions
│   │   ├── bracket.ts      # Bracket generation
│   │   ├── scheduling.ts   # Scheduling algorithms
│   │   ├── seeding.ts      # Seeding utilities
│   │   └── export.ts       # Import/export logic
│   └── design-system/      # Design tokens
│       ├── colors.ts       # Color palette
│       ├── typography.ts   # Font scales
│       ├── scale.ts        # Spacing/shadows/breakpoints
│       └── shortcuts.ts    # UnoCSS component shortcuts
└── styles/
    └── global.css
```

## Tournament Format Plugin Architecture

**This is the core architectural pattern of TournaGen.** Each format is a self-contained plugin implementing the `TournamentFormat<TConfig, TStructure>` interface.

### Key Type Definitions

Located in [src/lib/tournament/types.ts](src/lib/tournament/types.ts):

**Format Types:**
```typescript
enum TournamentFormatType {
  SingleElimination = "single-elimination",
  DoubleElimination = "double-elimination",
  RoundRobin = "round-robin",
  Swiss = "swiss",
  FreeForAll = "ffa",
  FIFA = "fifa",
  RacingMarioKart = "racing-mk",
  RacingF1 = "racing-f1",
}
```

**Configuration Types:**
- `Participant` - Individual or team with id, name, seed, metadata
- `BaseTournamentConfig` - Common fields for all formats (id, name, formatType, participants, timestamps)
- `TournamentConfig` - Discriminated union of format-specific configs (SingleEliminationConfig, DoubleEliminationConfig, etc.)

**Structure Types:**
- `BracketStructure` - For elimination formats (rounds, matches, feedsInto connections)
- `LeagueStructure` - For round robin/Swiss (groups, fixtures, standings)
- `StageStructure` - For FFA (multi-stage with advancement rules)
- `RacingStructure` - For racing formats (events, sessions, results)
- `TournamentStructure` - Discriminated union of all structure types

### Plugin Interface

Every format plugin implements:

```typescript
interface TournamentFormat<TConfig extends BaseTournamentConfig, TStructure extends TournamentStructure> {
  readonly metadata: TournamentFormatMetadata;
  createDefaultConfig(participants: Participant[]): TConfig;
  validateConfig(config: TConfig): ValidationResult;
  generateStructure(config: TConfig): TStructure;
  ConfigPanel: Component<ConfigPanelProps<TConfig>>;
  Visualizer: Component<VisualizerProps<TStructure, TConfig>>;
  exportData?: (config: TConfig, structure: TStructure) => FormatExport<TConfig, TStructure>;
}
```

### Plugin File Structure

Each format plugin lives in `src/lib/tournament/formats/<format-name>/`:

```
formats/single-elimination/
├── config.ts        # Configuration types extending BaseTournamentConfig
├── generator.ts     # Structure generation logic implementing generateStructure()
└── visualizer.tsx   # SolidJS visualization component
```

### Visual Progression System

A critical feature is showing **how participants advance through the tournament**:

- **Bracket formats**: Connecting lines between matches showing `feedsInto` relationships
- **Byes**: Visual indicators for participants skipping rounds
- **Group-to-knockout**: Advancement lines from group standings to bracket positions with labels
- **Multi-stage**: Progression arrows between stages
- **Connectors**: Consistent stroke style, color, thickness (see design system)

## TypeScript Patterns

### Configuration

```json
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

**Path aliases:**
- `@/*` → `./src/*`
- `@components/*` → `./src/components/*`
- `@lib/*` → `./src/lib/*`

### Type Safety Requirements

- Use **discriminated unions** for tournament types (see [types.ts](src/lib/tournament/types.ts))
- `Component<Props>` typing for all SolidJS components
- Readonly types for metadata and constants
- Strict null checking enabled
- `verbatimModuleSyntax: true` enforces explicit type imports

## SolidJS Best Practices

**These are CRITICAL rules - violating them breaks reactivity:**

### 1. Never Destructure Props

```typescript
// ❌ WRONG - breaks reactivity
const MyComponent = ({ name, value }) => {
  return <div>{name}</div>;
}

// ✅ CORRECT
const MyComponent: Component<Props> = (props) => {
  return <div>{props.name}</div>;
}
```

### 2. Use Control Flow Components

```typescript
// ❌ WRONG - use control flow instead
{items.map(item => <div>{item}</div>)}
{condition ? <A /> : <B />}

// ✅ CORRECT
<For each={items}>{(item) => <div>{item}</div>}</For>
<Show when={condition} fallback={<B />}><A /></Show>
<Switch>
  <Match when={type === "bracket"}><BracketView /></Match>
  <Match when={type === "league"}><LeagueView /></Match>
</Switch>
```

### 3. Always Use onCleanup()

```typescript
createEffect(() => {
  const handler = () => { ... };
  window.addEventListener('resize', handler);
  onCleanup(() => window.removeEventListener('resize', handler));
});
```

### 4. Signals vs Stores

```typescript
// Primitives: use createSignal
const [count, setCount] = createSignal(0);
setCount(c => c + 1); // ✅ Use updater function

// Nested objects: use createStore
const [state, setState] = createStore({
  tournament: { name: "", participants: [] }
});
setState("tournament", "name", "My Tournament"); // Fine-grained updates
```

### 5. Derived Values: Use createMemo

```typescript
// ✅ For derived values
const fullName = createMemo(() => `${props.firstName} ${props.lastName}`);

// ❌ createEffect is for side effects only, not derived values
```

### 6. Batch Multiple Updates

```typescript
import { batch } from "solid-js";

// When updating multiple signals at once
batch(() => {
  setName("New Name");
  setParticipants([...]);
  setDirty(true);
});
```

## State Management

Located in `src/lib/tournament/store.ts`:

```typescript
interface TournamentState {
  currentConfig: TournamentConfig | null;
  currentStructure: TournamentStructure | null;
  step: number;
  isDirty: boolean;
}

// Use createStore for nested objects
const [tournamentState, setTournamentState] = createStore<TournamentState>({ ... });

// Fine-grained updates
setTournamentState("currentConfig", "participants", [...]);
```

**Key patterns:**
- Use `createMemo` for derived values like `currentFormat`
- Use `batch()` for multiple signal updates
- Fine-grained updates prevent unnecessary re-renders

## UnoCSS Patterns

### Design System Integration

Design tokens from `src/lib/design-system/` are integrated into [uno.config.ts](uno.config.ts):

**Colors:**
- `brand-{50-900}` - Blue primary (#2f6ff2 at 500)
- `accent-{50-900}` - Orange highlights (#f07900 at 500)
- `neutral-{50-900}` - Gray scale
- `surface-{50-500}` - Light backgrounds
- `success`, `warning`, `danger`, `info` - Status colors

**Typography:**
- Fonts: `font-sans` (Space Grotesk), `font-display` (Clash Display), `font-mono` (DM Mono)
- Sizes: `text-xs` through `text-4xl`

**Spacing:** rem-based (0.5 through 16)
**Shadows:** `shadow-soft`, `shadow-card`, `shadow-ring`
**Border Radius:** `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-pill`

### Component Shortcuts

Defined in [shortcuts.ts](src/lib/design-system/shortcuts.ts):

```typescript
"btn"                // Base button
"btn-primary"        // Primary action
"btn-secondary"      // Secondary action
"btn-ghost"          // Ghost button
"card"               // Card container
"tournament-card"    // Tournament format card
"bracket-match"      // Bracket match box
"bracket-connector"  // Connecting line
"input"              // Form input
"field-group"        // Form field wrapper
```

### Class Patterns

```typescript
// ✅ Static class strings (preferred for extraction)
<div class="flex items-center gap-4 px-6 py-4 rounded-lg bg-brand-600 text-white">

// ✅ Conditional with classList
<div classList={{
  "btn": true,
  "btn-primary": props.variant === "primary",
  "btn-secondary": props.variant === "secondary"
}}>

// ❌ Dynamic interpolation (won't be extracted)
<div class={`bg-${color}-500`}>
```

### Dark Mode

Use class-based dark mode for SolidJS control:

```typescript
<div class="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">
```

## Testing Patterns

### Unit Tests

From [tokens.test.ts](src/lib/design-system/tokens.test.ts):

```typescript
import { describe, expect, it } from "bun:test";

describe("design system tokens", () => {
  it("exposes a usable brand palette", () => {
    expect(colors.brand[500]).toBeDefined();
    expect(colors.brand[500]).toMatch(/^#/);
  });
});
```

### Property-Based Tests

**Must use `fast-check` with minimum 100 iterations:**

```typescript
import fc from "fast-check";

it("round robin generates correct fixture count", () => {
  fc.assert(
    fc.property(fc.integer({ min: 2, max: 20 }), (n) => {
      const fixtures = generateRoundRobin(n);
      expect(fixtures.length).toBe(n * (n - 1) / 2);
    }),
    { numRuns: 100 }
  );
});
```

**Test co-location:** Place `.test.ts` files alongside source files.

## Component Guidelines

### When to Use Astro vs SolidJS

**Astro components (`.astro`):**
- Static content (hero sections, feature lists)
- Landing page sections
- Layout components
- Server-fetched data passed as props to islands

**SolidJS components (`.tsx`):**
- Interactive islands needing reactivity
- Form inputs, participant managers
- Tournament visualizations
- State-dependent UI

### Hydration Strategy

```astro
<!-- Strategic hydration directives -->
<FormatSelector client:load />           <!-- Critical, loads immediately -->
<Visualization client:visible />         <!-- Loads when scrolled into view -->
<ConfigPanel client:idle />              <!-- Loads after main thread is idle -->
```

**Minimize shipped JavaScript** by defaulting to static rendering.

## Import/Export System

Format defined by `FormatExport<TConfig, TStructure>` in [types.ts](src/lib/tournament/types.ts):

```typescript
interface FormatExport<TConfig, TStructure> {
  version: string;
  format: TournamentFormatType;
  generatedAt: string;
  config: TConfig;
  structure: TStructure;
  metadata?: Record<string, unknown>;
}
```

**Utilities in `src/lib/utils/export.ts`:**
- `exportTournament()` - Serialize config to JSON, trigger download
- `importTournament()` - Parse and validate JSON, return discriminated union for success/error
- `saveToLocalStorage()` / `loadFromLocalStorage()` - Optional persistence

**Requirements:**
- Human-readable JSON with clear field names
- Validation with friendly error messages
- Optional local storage persistence for convenience

## Design System

### Color Palette

From [colors.ts](src/lib/design-system/colors.ts):

- **Brand (Blue)**: Professional, trustworthy primary color
- **Accent (Orange)**: Energetic highlights and CTAs
- **Neutral (Gray)**: Text, borders, backgrounds
- **Surface**: Light backgrounds for elevation
- **Status**: Success (green), warning (amber), danger (red), info (cyan)

### Typography Scale

From [typography.ts](src/lib/design-system/typography.ts):

- **Sans**: Space Grotesk for body and UI
- **Display**: Clash Display for headings
- **Mono**: DM Mono for code/data
- **Sizes**: Consistent scale with paired line heights

### Spacing & Scale

From [scale.ts](src/lib/design-system/scale.ts):

- **Spacing**: 0.5 (0.125rem) through 16 (4rem)
- **Radii**: sm (0.375rem) through pill (9999px)
- **Shadows**: soft (subtle), card (elevated), ring (focus states)
- **Breakpoints**: xs (480px), sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)

## Implementation Plan

The project follows a phased implementation approach (see `.kiro/specs/tournagen/tasks.md`):

**Current status:** ✅ Phase 1 complete (design system and core types)

**Next phases:**
1. Format registry and state management
2. Landing page with dynamic format cards
3. Builder interface shell
4. Tournament formats (single-elim → double-elim → round robin → swiss → ffa → fifa → racing)
5. Visualization integration
6. Responsive design and accessibility
7. Performance optimization

**Key checkpoints:**
- All tournament format generators must have property-based tests
- Export-import round trip must be tested
- Offline functionality must be verified
- Bundle size target: < 100KB

## Best Practices Reference

**Comprehensive guidelines:** See `.claude/astro-solid-unocss-pro.md` for detailed modern stack patterns.

**Key documents:**
- **Product Spec**: `.kiro/steering/product.md`
- **Tech Stack**: `.kiro/steering/tech.md`
- **Structure Guide**: `.kiro/steering/structure.md`
- **Design Doc**: `.kiro/specs/tournagen/design.md`
- **Requirements**: `.kiro/specs/tournagen/requirements.md`
- **Tasks**: `.kiro/specs/tournagen/tasks.md`

## Client-Side Architecture Requirements

**Zero backend dependency** - all features must work in the browser:

1. All tournament logic executes client-side
2. File-based export/import (no external API calls)
3. Optional local storage persistence
4. Full offline functionality after initial load
5. No user accounts or authentication

## Performance Goals

- Minimize shipped JavaScript (static by default)
- Strategic island hydration (`client:visible`, `client:idle`, `client:load`)
- Fine-grained reactivity (update only affected UI elements)
- Code splitting for format plugins
- Virtual scrolling for large participant lists (100+)
- Bundle size < 100KB

## Accessibility Requirements

- ARIA labels on all interactive elements
- Keyboard navigation for all features
- Screen reader announcements for dynamic updates
- Focus management for modals
- Skip links for navigation
