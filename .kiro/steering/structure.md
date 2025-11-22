---
inclusion: always
---

# Project Structure

## Directory Organization

```
src/
├── pages/
│   ├── index.astro              # Landing page (static)
│   └── builder.astro            # Tournament builder (with islands)
├── components/
│   ├── landing/                 # Static landing page components
│   │   ├── Hero.astro
│   │   ├── FormatCard.astro
│   │   └── FeatureSection.astro
│   └── builder/                 # Interactive SolidJS islands
│       ├── FormatSelector.tsx
│       ├── ConfigPanel.tsx
│       ├── ParticipantManager.tsx
│       └── Visualization.tsx
├── lib/
│   ├── tournament/
│   │   ├── types.ts             # Core type definitions
│   │   ├── registry.ts          # Format registry
│   │   ├── store.ts             # Global tournament state
│   │   └── formats/             # Tournament format plugins
│   │       ├── base.ts
│   │       ├── single-elimination/
│   │       ├── double-elimination/
│   │       ├── round-robin/
│   │       ├── swiss/
│   │       ├── ffa/
│   │       ├── fifa/
│   │       └── racing/
│   ├── utils/
│   │   ├── bracket.ts           # Bracket generation
│   │   ├── scheduling.ts        # Scheduling algorithms
│   │   ├── seeding.ts           # Seeding utilities
│   │   └── export.ts            # Import/export logic
│   └── design-system/
│       ├── colors.ts
│       ├── typography.ts
│       └── shortcuts.ts
└── styles/
    └── global.css
```

## Routing

- `index.astro` - Landing page with format cards
- `builder.astro` - Tournament builder with SolidJS islands

## Component Guidelines

- **Astro components** (`.astro`): Static content, landing page sections
- **SolidJS components** (`.tsx`): Interactive islands in builder
- Use `Component<Props>` typing for all SolidJS components
- Never destructure props in SolidJS (breaks reactivity)
- Use `<For>`, `<Show>`, `<Switch>/<Match>` instead of `.map()` and ternaries

## Tournament Format Plugin Structure

Each format implements the `TournamentFormat` interface:

```
formats/single-elimination/
├── config.ts        # Configuration types
├── generator.ts     # Structure generation logic
└── visualizer.tsx   # SolidJS visualization component
```

## Static Assets

- Place in `public/` directory
- Reference with absolute paths (e.g., `/favicon.svg`)

## Test Organization

- Co-locate tests with source files
- Use `.test.ts` suffix for unit tests
- Use `.property.test.ts` suffix for property-based tests
