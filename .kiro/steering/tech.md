---
inclusion: always
---

# Tech Stack

## Core Technologies

- **Astro 5.16+**: Static site generator with island architecture
- **Solid.js 1.9+**: Reactive UI framework for interactive components
- **UnoCSS 66.5+**: Atomic CSS engine for utility-first styling
- **TypeScript 5.6+**: Strict mode with discriminated unions

## Testing

- **Vitest**: Unit testing framework
- **@solidjs/testing-library**: Component testing utilities
- **fast-check**: Property-based testing library (minimum 100 iterations per test)

## Build System

- **Package Manager**: Bun (preferred)
- **Module System**: ES Modules (`type: "module"`)
- **Output**: Static site (no SSR)

## Common Commands

Run all commands from the project root:

- `bun install` - Install dependencies
- `bun dev` - Start development server at localhost:4321
- `bun build` - Build production site to ./dist/
- `bun preview` - Preview production build locally
- `bun test` - Run test suite
- `bun astro ...` - Run Astro CLI commands

## Configuration Files

- `astro.config.mjs` - Astro configuration (UnoCSS MUST be before SolidJS)
- `uno.config.ts` - UnoCSS configuration with presets
- `tsconfig.json` - TypeScript strict configuration

## TypeScript Configuration

- Extends: `astro/tsconfigs/strict`
- JSX import source: `solid-js`
- JSX mode: `preserve`
- Module resolution: `bundler`
- Strict mode enabled with discriminated unions

## Integration Order (Critical)

In `astro.config.mjs`, UnoCSS MUST come before SolidJS for proper CSS extraction:

```typescript
export default defineConfig({
  integrations: [
    UnoCSS({ injectReset: true }), // MUST be first
    solidJs()
  ]
});
```
