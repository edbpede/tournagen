# Modern Stack Best Practices: TypeScript + Astro + SolidJS + UnoCSS (2025)

## 1. TypeScript

### Enable strict mode with Astro's recommended presets
**Rule**: Extend `astro/tsconfigs/strict` or `strictest` in your root `tsconfig.json`.

**Rationale**: Astro 3+ requires TypeScript 5.x and provides curated presets with essential flags like `verbatimModuleSyntax` (enforces explicit type imports to prevent bundling issues) and proper JSX configuration. The strict preset catches null/undefined issues critical in server/client boundary code.

**Snippet**:
```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "solid-js",
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "baseUrl": ".",
    "paths": {
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"]
    }
  }
}
```

**When to deviate**: Use `base` preset for prototypes; `strictest` when maximum type safety outweighs DX friction.

**Sources**: [TypeScript - Astro Docs](https://docs.astro.build/en/guides/typescript/) (2024), [Announcing TypeScript 5.6](https://devblogs.microsoft.com/typescript/) (Sept 2024)

---

### Use TypeScript 5.6+ with Node 20 LTS for production
**Rule**: Set `engines` in `package.json` to enforce Node 20.11+ and TS 5.6+.

**Rationale**: TS 5.6 (Sept 2024) adds iterator helper methods crucial for rendering pipelines, `--noCheck` flag for faster dev builds, and `strictBuiltinIteratorReturn`. TS 5.7 (Nov 2024) includes ES2024 target and V8 compile caching. Node 20 LTS provides native fetch, improved performance, and long-term support through 2026.

**Snippet**:
```json
{
  "engines": {
    "node": ">=20.11.0",
    "pnpm": ">=9.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6.0"
  }
}
```

**When to deviate**: Use Node 18.18+ minimum for Astro 5.x compatibility, but prefer 20 LTS for production.

**Sources**: [Announcing TypeScript 5.6](https://devblogs.microsoft.com/typescript/announcing-typescript-5-6/) (Sept 2024), [Announcing TypeScript 5.7](https://devblogs.microsoft.com/typescript/announcing-typescript-5-7/) (Nov 2024)

---

### Type Solid component props with Component<P> generics
**Rule**: Use `Component<Props>`, `ParentComponent<Props>`, or `VoidComponent<Props>` for all Solid components; never destructure props directly.

**Rationale**: SolidJS props are reactive getters—destructuring breaks reactivity (common React migration pitfall). `ParentComponent` includes optional `children`, `VoidComponent` enforces no children. Always access via `props.name` or use `splitProps()` to preserve reactivity.

**Snippet**:
```typescript
import type { Component, ParentComponent } from "solid-js";
import { splitProps } from "solid-js";

interface ButtonProps {
  variant: "primary" | "secondary";
  onClick: () => void;
  disabled?: boolean;
}

const Button: Component<ButtonProps> = (props) => {
  // ❌ WRONG: const { variant } = props; // Breaks reactivity
  // ✅ CORRECT: Access directly or use splitProps
  const [local, others] = splitProps(props, ["variant"]);
  return <button {...others}>{props.children}</button>;
};
```

**When to deviate**: Never for reactive props; only safe for static config objects passed at initialization.

**Sources**: [TypeScript - Solid Docs](https://docs.solidjs.com/configuration/typescript) (2024)

---

### Type API responses with discriminated unions
**Rule**: Create generic API wrappers returning discriminated unions with `success` discriminant property; use type guards for exhaustive checking.

**Rationale**: Forces compile-time exhaustive error handling. The `success` property narrows union types automatically. Generic `<T>` provides type-safe responses without repetitive assertions.

**Snippet**:
```typescript
type ApiResponse<T> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: string };

async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` };
    }
    const data = await response.json() as T;
    return { success: true, data };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

// Usage with Solid
const [user] = createResource<User, string>(
  () => userId(),
  async (id) => {
    const result = await fetchApi<User>(`/api/users/${id}`);
    if (!result.success) throw new Error(result.error);
    return result.data; // TypeScript knows this exists
  }
);
```

**When to deviate**: Use standard try/catch for internal-only functions where external error handling is guaranteed.

**Sources**: [TypeScript Generic Data Fetch](https://dev.to/) (2024), [Narrowing in TypeScript](https://felt.com/) (2024)

---

### Leverage mapped types for DRY component APIs
**Rule**: Use mapped types with `as` clause key remapping and `Capitalize` utility for derived prop types.

**Rationale**: Reduces duplication in component interfaces. The `as` clause (TS 4.1+) enables key transformation, essential for event handler patterns.

**Snippet**:
```typescript
type WithHandlers<T> = {
  [K in keyof T as `on${Capitalize<string & K>}Change`]: (value: T[K]) => void;
};

interface FormFields {
  username: string;
  email: string;
}

type FormHandlers = WithHandlers<FormFields>;
// Results in: { onUsernameChange: (value: string) => void; onEmailChange: ... }
```

**When to deviate**: Use simple interfaces for straightforward prop types; mapped types add cognitive overhead for basic cases.

**Sources**: [TypeScript Mapped Types](https://refine.dev/) (2024)

---

### Configure moduleResolution: "bundler" for Vite/Astro
**Rule**: Use `moduleResolution: "bundler"` (TS 5.x+) with path aliases in `tsconfig.json`.

**Rationale**: `"bundler"` resolution aligns with Vite's module handling, supporting package.json `exports` fields. Path aliases reduce `../../` complexity.

**Snippet**:
```json
{
  "compilerOptions": {
    "moduleResolution": "bundler",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"]
    }
  }
}
```

**When to deviate**: Use `"node16"` for pure Node.js projects without Vite.

**Sources**: [Imports - Astro Docs](https://docs.astro.build/) (2024)

---

### Use declaration files for global types
**Rule**: Create `src/env.d.ts` with triple-slash references and `declare` statements; always `export {}` to convert to module.

**Rationale**: `.d.ts` files are ambient modules—top-level imports/exports break ambient status. Use `import()` type syntax or `export {}` to enable imports.

**Snippet**:
```typescript
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    userId: string;
    session: import("./auth").Session | null;
  }
}

declare module "*.svg" {
  const content: string;
  export default content;
}

export {};
```

**When to deviate**: Omit `export {}` only for pure ambient declaration files with no imports.

**Sources**: [TypeScript - Astro Docs](https://docs.astro.build/) (2024)

---

## 2. SolidJS

### Prefer createSignal for primitives, createStore for nested objects
**Rule**: Use `createSignal()` for primitives; use `createStore()` for nested objects requiring fine-grained per-property reactivity.

**Rationale**: `createSignal` has minimal overhead with read/write segregation. `createStore` provides fine-grained per-property tracking—only affected properties trigger updates.

**Snippet**:
```typescript
import { createSignal, createStore } from "solid-js";

// ✅ Primitives: Use signals
const [count, setCount] = createSignal(0);

// ✅ Nested objects: Use stores
const [user, setUser] = createStore({
  profile: { name: "John", age: 30 }
});

setUser("profile", "name", "Jane"); // Only triggers profile.name subscribers
```

**When to deviate**: Use signal for objects that always update entirely.

**Sources**: [Stores - Solid Docs](https://docs.solidjs.com/) (2024)

---

### Use createMemo for derived values, createEffect only for side effects
**Rule**: Use `createMemo()` for cached computations; reserve `createEffect()` exclusively for side effects; never set signals in effects.

**Rationale**: Effects run after DOM updates—setting signals causes extra render cycles. Memos cache results and act as reactivity filters.

**Snippet**:
```typescript
import { createSignal, createMemo, createEffect, onCleanup } from "solid-js";

const [volume, setVolume] = createSignal(0.7);

// ✅ CORRECT: Memo for derived values
const level = createMemo(() => 
  volume() > 0.8 ? "high" : volume() > 0.5 ? "medium" : "low"
);

// ✅ CORRECT: Effect for side effects
createEffect(() => {
  const timer = setInterval(() => console.log(volume()), 1000);
  onCleanup(() => clearInterval(timer));
});

// ❌ AVOID: Setting signals in effects
createEffect(() => {
  setLevel(volume() > 0.5 ? "high" : "low"); // WRONG
});
```

**When to deviate**: Use `onMount()` for one-time initialization.

**Sources**: [Memos - Solid Docs](https://docs.solidjs.com/) (2024)

---

### Never destructure props—use splitProps
**Rule**: Always access props via `props.name` or use `splitProps()`; never destructure at component top level.

**Rationale**: Props are reactive getters—destructuring evaluates them immediately and loses reactivity. This is the #1 React migration pitfall.

**Snippet**:
```typescript
import { Component, splitProps } from "solid-js";

interface Props {
  name: string;
  count: number;
}

const MyComponent: Component<Props> = (props) => {
  // ❌ WRONG: const { name } = props;
  
  // ✅ CORRECT: Direct access
  return <div>{props.name}: {props.count}</div>;
  
  // ✅ CORRECT: splitProps
  const [local, others] = splitProps(props, ["name", "count"]);
  return <div>{local.name}</div>;
};
```

**When to deviate**: Never for reactive props.

**Sources**: [Props - Solid Docs](https://docs.solidjs.com/) (2024)

---

### Use <For> for keyed lists
**Rule**: Use `<For each={array()}>` for lists; avoid `.map()`.

**Rationale**: `<For>` gives each item a stable reference, enabling fine-grained DOM updates without recreating nodes. `.map()` recreates all DOM on every update.

**Snippet**:
```typescript
import { For, createSignal } from "solid-js";

const [todos, setTodos] = createSignal([
  { id: 1, text: "Learn Solid" },
  { id: 2, text: "Build app" }
]);

// ✅ CORRECT
<For each={todos()}>
  {(todo, i) => <div>{todo.text} #{i() + 1}</div>}
</For>

// ❌ AVOID
{todos().map(todo => <div>{todo.text}</div>)}
```

**When to deviate**: Use `.map()` only for static lists that never change.

**Sources**: [Control Flow - Solid Docs](https://docs.solidjs.com/) (2024)

---

### Use <Show> for conditionals with type narrowing
**Rule**: Use `<Show when={condition()}>` for conditional rendering; use callback form for type narrowing.

**Rationale**: Declarative with lazy evaluation. Callback form provides TypeScript narrowing.

**Snippet**:
```typescript
import { Show, createResource } from "solid-js";

const [user] = createResource(fetchUser);

<Show when={user()} fallback={<div>Loading...</div>}>
  {(u) => <div>{u().name}</div>}
</Show>
```

**When to deviate**: Use `<Switch>`/`<Match>` for multiple conditions.

**Sources**: [Control Flow - Solid Docs](https://docs.solidjs.com/) (2024)

---

### Wrap async components in <ErrorBoundary>
**Rule**: Wrap all `createResource` usage in `<ErrorBoundary>`; isolate errors per island.

**Rationale**: Error boundaries provide fallback UI and prevent one island's error from crashing others.

**Snippet**:
```typescript
import { ErrorBoundary, Suspense, createResource } from "solid-js";

const [data] = createResource(fetchData);

<ErrorBoundary fallback={(err, reset) => (
  <div>Error: {err.message} <button onClick={reset}>Retry</button></div>
)}>
  <Suspense fallback={<div>Loading...</div>}>
    <DataDisplay data={data()} />
  </Suspense>
</ErrorBoundary>
```

**When to deviate**: Handle event errors with try/catch.

**Sources**: [Error Boundary - Solid Docs](https://docs.solidjs.com/) (2024)

---

### Pass server data as props from Astro
**Rule**: Fetch data in `.astro` files; pass as props to Solid islands; use `createResource` only for client-side refetching.

**Rationale**: Fetching in islands creates waterfalls. Astro's SSR fetches at build/request time.

**Snippet**:
```astro
---
// pages/user.astro
const user = await fetch('/api/user').then(r => r.json());
---
<Profile client:load user={user} />
```

```typescript
// Profile.tsx
const Profile: Component<{ user: User }> = (props) => {
  return <div>{props.user.name}</div>;
};
```

**When to deviate**: Use `createResource` for authenticated/user-specific data.

**Sources**: [Data Fetching - Astro Docs](https://docs.astro.build/) (2024)

---

### Use Astro file-based routing
**Rule**: Let Astro handle routing via `src/pages/`; use Solid Router only within islands for nested client-side navigation.

**Rationale**: Astro's file-based routing provides zero-JS navigation. Reserve Solid Router for client-side sections.

**Snippet**:
```
src/pages/
├── index.astro
├── blog/[slug].astro
└── dashboard.astro (contains Solid Router island)
```

**When to deviate**: Use SolidStart for full SPA applications.

**Sources**: [Routing - Astro Docs](https://docs.astro.build/) (2024)

---

### Manage state locally with signals
**Rule**: Keep state co-located with `createSignal()`; use Context for island-internal sharing; use global stores for cross-island coordination.

**Rationale**: Local signals provide easiest debugging. Context scopes to component tree. Global stores enable cross-island communication.

**Snippet**:
```typescript
// Local state (preferred)
function Counter() {
  const [count, setCount] = createSignal(0);
  return <button onClick={() => setCount(c => c + 1)}>{count()}</button>;
}

// Global store for cross-island
// store.ts
export const [globalUser, setGlobalUser] = createSignal<User | null>(null);
```

**When to deviate**: Use global stores when islands must share state.

**Sources**: [Context - Solid Docs](https://docs.solidjs.com/) (2024)

---

### Always use onCleanup for subscriptions
**Rule**: Call `onCleanup()` inside every `createEffect()` that creates subscriptions, timers, or event listeners.

**Rationale**: Astro islands unmount dynamically. Missing cleanup causes memory leaks.

**Snippet**:
```typescript
import { createEffect, onCleanup } from "solid-js";

createEffect(() => {
  const handler = () => console.log("resize");
  window.addEventListener("resize", handler);
  
  onCleanup(() => window.removeEventListener("resize", handler));
});
```

**When to deviate**: Never—always cleanup.

**Sources**: [Effects - Solid Docs](https://docs.solidjs.com/) (2024)

---

### Optimize with batch() for multiple updates
**Rule**: Use `batch()` to group multiple signal updates into a single reactive cycle.

**Rationale**: Multiple setters cause one update per setter. `batch()` triggers a single update.

**Snippet**:
```typescript
import { batch, createSignal } from "solid-js";

const [name, setName] = createSignal("");
const [age, setAge] = createSignal(0);

batch(() => {
  setName("John");
  setAge(30);
}); // Single reactive update
```

**When to deviate**: Unnecessary when updates naturally batched.

**Sources**: [batch - Solid Docs](https://docs.solidjs.com/) (2024)

---

### Use children() helper when accessing props.children multiple times
**Rule**: Call `children(() => props.children)` once and use the memo.

**Rationale**: `props.children` re-evaluates on each access, causing duplicate DOM nodes.

**Snippet**:
```typescript
import { children, ParentComponent } from "solid-js";

const List: ParentComponent = (props) => {
  const resolved = children(() => props.children);
  return <ul>{resolved.toArray().map((child, i) => <li>{child}</li>)}</ul>;
};
```

**When to deviate**: Omit for single pass-through in JSX.

**Sources**: [children API - Solid Docs](https://docs.solidjs.com/) (2024)

---

### Lazy load heavy components with client:visible
**Rule**: Use `client:visible` for below-fold islands, `client:idle` for non-critical, `client:load` only for critical features.

**Rationale**: Astro's hydration directives minimize shipped JavaScript. Combine with Solid's `lazy()` for code-splitting.

**Snippet**:
```astro
<Counter client:load /> <!-- Critical -->
<Newsletter client:visible /> <!-- Below-fold -->
<HeavyChart client:idle /> <!-- Defer -->
```

**When to deviate**: Use `client:only` for browser-only APIs.

**Sources**: [Islands - Astro Docs](https://docs.astro.build/) (2024)

---

## 3. UnoCSS

### Use uno.config.ts with preset-wind
**Rule**: Create `uno.config.ts` in project root with `presetWind()` for Tailwind compatibility; initialize UnoCSS before SolidJS in Astro config.

**Rationale**: Dedicated config enables IDE autocomplete. `presetWind()` provides ~95% Tailwind compatibility. Plugin ordering matters for extraction.

**Snippet**:
```typescript
// uno.config.ts
import { defineConfig, presetWind, presetIcons } from "unocss";

export default defineConfig({
  presets: [presetWind(), presetIcons({ cdn: "https://esm.sh/" })],
  shortcuts: [{ "btn": "px-4 py-2 rounded-lg shadow-md" }]
});
```

```typescript
// astro.config.mjs
import UnoCSS from "unocss/astro";
import solidJs from "@astrojs/solid-js";

export default defineConfig({
  integrations: [UnoCSS({ injectReset: true }), solidJs()], // UnoCSS FIRST
});
```

**When to deviate**: Use `presetUno()` for Bootstrap/Tachyons compatibility.

**Sources**: [UnoCSS Config](https://unocss.dev/guide/config-file) (2024)

---

### Prefer static class strings over dynamic interpolation
**Rule**: Map dynamic variants to static class strings via object lookups; use safelist only when truly dynamic.

**Rationale**: UnoCSS scans statically—dynamic interpolation isn't detected without safelist. Object mapping keeps utilities extractable.

**Snippet**:
```typescript
// ✅ RECOMMENDED
const buttonVariants = {
  primary: "bg-blue-500 hover:bg-blue-600 text-white",
  secondary: "bg-gray-500 hover:bg-gray-600 text-white"
} as const;

function Button(props: { variant: keyof typeof buttonVariants }) {
  return <button class={buttonVariants[props.variant]}>{props.children}</button>;
}

// ❌ REQUIRES SAFELIST
function DynamicButton(props: { color: string }) {
  return <button class={`bg-${props.color}-500`}>{props.children}</button>;
}
```

**When to deviate**: Use safelist for CMS-driven classes.

**Sources**: [UnoCSS Extracting](https://unocss.dev/guide/extracting) (2024)

---

### Use shortcuts for repeated patterns
**Rule**: Define shortcuts in `uno.config.ts` for repeated utility combinations.

**Rationale**: Shortcuts reduce class string length and enforce design system consistency. Expand at build time with no runtime overhead.

**Snippet**:
```typescript
export default defineConfig({
  shortcuts: [
    { "btn": "px-4 py-2 font-semibold rounded-lg shadow-md" },
    { "card": "bg-white p-6 rounded-lg shadow-md" },
    [/^btn-(.*)$/, ([, color]) => `btn bg-${color}-500 hover:bg-${color}-600 text-white`]
  ]
});
```

**When to deviate**: Avoid for one-off styles.

**Sources**: [UnoCSS Shortcuts](https://unocss.dev/config/shortcuts) (2024)

---

### Configure responsive variants and dark mode
**Rule**: Define breakpoints matching design system; use `dark: "class"` for JS-toggled dark mode.

**Rationale**: Consistent breakpoints prevent layout shifts. Class-based dark mode enables Solid-controlled toggling.

**Snippet**:
```typescript
export default defineConfig({
  presets: [presetWind({ dark: "class" })],
  theme: {
    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "1024px"
    }
  }
});
```

```tsx
<div class="text-sm md:text-base bg-white dark:bg-gray-800">
  Responsive + Dark
</div>
```

**When to deviate**: Use `dark: "media"` for CSS-only dark mode.

**Sources**: [UnoCSS Wind Preset](https://unocss.dev/presets/wind) (2024)

---

### Integrate CSS variables for runtime theming
**Rule**: Define theme colors as CSS variables in `theme` config; update variables at runtime in Solid.

**Rationale**: CSS variables enable runtime theming without regenerating utilities. Astro sets at build time, Solid updates client-side.

**Snippet**:
```typescript
export default defineConfig({
  theme: {
    colors: {
      brand: "#3B82F6",
      accent: "var(--accent-color)"
    }
  }
});
```

```css
:root {
  --accent-color: #3B82F6;
}
.dark {
  --accent-color: #60A5FA;
}
```

**When to deviate**: Use static colors when theming isn't required.

**Sources**: [UnoCSS Theme](https://unocss.dev/config/theme) (2024)

---

### Use preset-icons for zero-JS icons
**Rule**: Configure `presetIcons()` with CDN or local collections; reference as `class="i-{collection}-{icon}"`.

**Rationale**: CSS mask-based icons with no JavaScript bundle impact. 150k+ icons from Iconify.

**Snippet**:
```typescript
export default defineConfig({
  presets: [presetIcons({ scale: 1.2, cdn: "https://esm.sh/" })]
});
```

```tsx
<div class="i-carbon-logo-github text-2xl" />
```

**When to deviate**: Use SVG components for complex multi-color icons.

**Sources**: [Icons in Pure CSS](https://antfu.me/posts/icons-in-pure-css) (2021)

---

### Optimize scan targets
**Rule**: Configure `content.pipeline.include` to cover `.astro`, `.tsx`, and utility files; use `@unocss-include` for shared class objects.

**Rationale**: `.js`/`.ts` files aren't scanned by default—explicit inclusion prevents missing utilities.

**Snippet**:
```typescript
export default defineConfig({
  content: {
    pipeline: {
      include: [
        /\.(vue|svelte|[jt]sx|mdx?|astro)($|\?)/,
        "src/**/*.{js,ts}"
      ]
    }
  }
});
```

```typescript
// utils/classes.ts
// @unocss-include
export const cardStyles = "bg-white p-6 rounded-lg shadow-md";
```

**When to deviate**: Omit `.js`/`.ts` if no utilities defined there.

**Sources**: [UnoCSS Extracting](https://unocss.dev/guide/extracting) (2024)

---

### Prefer class-based over attributify for Solid
**Rule**: Use class-based utilities in Solid components; use attributify sparingly with TypeScript shim.

**Rationale**: Solid's JSX transform happens after UnoCSS extraction—attributify has edge cases.

**Snippet**:
```tsx
// ✅ RECOMMENDED
<button class="bg-blue-500 px-4 py-2 rounded">Click</button>

// ⚠️ Attributify (requires shim)
<button bg="blue-500" px="4" py="2" rounded="">Click</button>
```

**When to deviate**: Use attributify in Astro templates.

**Sources**: [UnoCSS GitHub Issue #878](https://github.com/unocss/unocss/issues/878) (2022)

---

### Migration: Tailwind → UnoCSS
**Rule**: Replace Tailwind with UnoCSS; use `presetWind()` for compatibility; remove PostCSS pipeline.

**Rationale**: 10-20x faster builds, instant HMR. `presetWind()` covers most Tailwind utilities.

**Snippet**:
```bash
pnpm remove tailwindcss postcss autoprefixer
pnpm add -D unocss @unocss/reset
```

```typescript
// uno.config.ts
import { defineConfig, presetWind } from "unocss";

export default defineConfig({
  presets: [presetWind()],
  theme: {
    colors: { brand: "#3B82F6" }
  }
});
```

**Key differences**: Opacity `bg-blue-500/50` works; forms require manual setup.

**Sources**: [Switching to UnoCSS](https://dev.to/akshay9677/switching-to-unocss-5hjo) (2024)

---

## 4. Integration: Astro + SolidJS + UnoCSS + TypeScript

### Initialize integrations: UnoCSS before SolidJS
**Rule**: Place UnoCSS integration before SolidJS in `integrations` array.

**Rationale**: UnoCSS must extract utilities before Solid's JSX transformation.

**Snippet**:
```typescript
export default defineConfig({
  integrations: [UnoCSS({ injectReset: true }), solidJs()], // Order matters
});
```

**When to deviate**: Never—order is critical.

**Sources**: [UnoCSS Astro](https://unocss.dev/integrations/astro) (2024)

---

### Type Solid props with JSX intrinsic types
**Rule**: Use `Component<Props>` with explicit interfaces; extend `JSX.HTMLAttributes<T>` for native wrappers.

**Rationale**: TypeScript ensures type safety. `splitProps()` enables type-safe prop spreading.

**Snippet**:
```typescript
import type { Component, JSX } from "solid-js";
import { splitProps } from "solid-js";

type ButtonProps = {
  variant: "primary" | "secondary";
} & JSX.HTMLAttributes<HTMLButtonElement>;

const Button: Component<ButtonProps> = (props) => {
  const [local, others] = splitProps(props, ["variant"]);
  return <button {...others} class={`btn-${local.variant}`}>{props.children}</button>;
};
```

**When to deviate**: Use plain interfaces for non-wrapper components.

**Sources**: [TypeScript - Solid Docs](https://docs.solidjs.com/configuration/typescript) (2024)

---

### Use client:* directives strategically
**Rule**: Default to `client:visible` for below-fold; use `client:idle` for non-critical; reserve `client:load` for critical features.

**Rationale**: Each directive impacts JavaScript budget differently. Minimize `client:load` to optimize Time to Interactive.

**Snippet**:
```astro
<Counter client:load /> <!-- Critical above-fold -->
<Newsletter client:visible /> <!-- Below-fold -->
<HeavyChart client:idle /> <!-- Non-critical -->
```

**When to deviate**: Use `client:only` for browser-only APIs.

**Sources**: [Client Directives - Astro Docs](https://docs.astro.build/en/reference/directives-reference/) (2024)

---

### Pass server-fetched data as props
**Rule**: Fetch data in `.astro` files; pass as props to avoid client-side waterfalls.

**Rationale**: Reduces Time to Interactive and avoids loading states on initial render.

**Snippet**:
```astro
---
const user = await fetch('/api/user').then(r => r.json());
---
<UserProfile client:load user={user} />
```

**When to deviate**: Use `createResource` for authenticated data.

**Sources**: [Data Fetching - Astro Docs](https://docs.astro.build/) (2024)

---

### Share state across islands with global stores
**Rule**: Export signal/store from shared module for cross-island communication.

**Rationale**: Astro islands are independent—global stores enable coordination.

**Snippet**:
```typescript
// stores/auth.ts
export const [user, setUser] = createSignal<User | null>(null);

// Island1.tsx and Island2.tsx import and use
```

**When to deviate**: Prefer local signals for isolated components.

**Sources**: Stack Overflow #72361046 (2024)

---

### Configure Vite for optimal code-splitting
**Rule**: Use Vite's `build.rollupOptions.output.manualChunks` to separate vendor code from app code.

**Rationale**: Improves caching and parallel downloads. Astro uses Vite internally.

**Snippet**:
```typescript
// astro.config.mjs
export default defineConfig({
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'solid': ['solid-js'],
            'vendor': ['lodash', 'date-fns']
          }
        }
      }
    }
  }
});
```

**When to deviate**: Let Astro handle chunking for simple sites.

**Sources**: Vite documentation (2024)

---

## 5. Performance

### Minimize shipped JavaScript with strategic hydration
**Rule**: Default to static rendering; add `client:*` directives only for truly interactive components; measure with Lighthouse (<100KB compressed JS budget).

**Rationale**: Each hydrated island adds JavaScript. Static Astro components render with zero client-side JS. Use performance budgets to enforce constraints.

**Snippet**:
```astro
<!-- ✅ Static (0 KB JS) -->
<StaticHeader />

<!-- ✅ Interactive only when needed -->
<SearchBar client:idle />
<Counter client:visible />

<!-- ❌ Avoid over-hydrating -->
<!-- Don't use client:load for everything -->
```

**When to deviate**: Use `client:load` for critical above-fold interactivity.

**Sources**: [Islands Architecture](https://docs.astro.build/en/concepts/islands/) (2024)

---

### Enable tree-shaking with ES modules
**Rule**: Use ES module imports/exports; avoid CommonJS; configure `"type": "module"` in package.json; use `sideEffects: false` in library package.json.

**Rationale**: ES modules enable static analysis for tree-shaking. Vite/Astro automatically tree-shake unused exports.

**Snippet**:
```json
// package.json
{
  "type": "module",
  "sideEffects": false
}
```

```typescript
// ✅ Tree-shakeable
import { specificFunction } from 'library';

// ❌ Not tree-shakeable
import * as library from 'library';
```

**When to deviate**: Some legacy libraries require CommonJS.

**Sources**: Vite documentation (2024)

---

### Lazy load routes and components with Solid's lazy()
**Rule**: Use `lazy()` for heavy components; wrap in `<Suspense>` with meaningful fallback.

**Rationale**: Code-splits component into separate chunk loaded on demand. Reduces initial bundle size.

**Snippet**:
```typescript
import { lazy, Suspense } from "solid-js";

const HeavyChart = lazy(() => import("./HeavyChart"));

export default function Dashboard() {
  return (
    <Suspense fallback={<div>Loading chart...</div>}>
      <HeavyChart />
    </Suspense>
  );
}
```

**When to deviate**: Don't lazy-load critical components or very small components.

**Sources**: [lazy - Solid Docs](https://docs.solidjs.com/) (2024)

---

### Leverage fine-grained reactivity to avoid over-rendering
**Rule**: Access signals at the finest granularity possible; use `createMemo()` as reactivity filters; avoid wrapping everything in components.

**Rationale**: Solid's core advantage—only affected DOM nodes update, not entire component trees. Unlike React, components run once, not on every state change.

**Snippet**:
```typescript
// ✅ Fine-grained: Only name text node updates
<div class="card">
  <h2>{user().name}</h2>
  <p>{user().bio}</p>
</div>

// ✅ Memo filters unnecessary updates
const isExpensive = createMemo(() => items().length > 1000);

// ❌ Over-componentization (unnecessary in Solid)
function NameDisplay(props) {
  return <span>{props.name}</span>;
}
```

**When to deviate**: Extract components for reusability, not performance.

**Sources**: [Thinking Granular](https://dev.to/ryansolid) (2024), [SolidJS vs React 19 Benchmarks](https://markaicode.com/) (2025)

---

### Optimize UnoCSS bundle with minimal presets
**Rule**: Include only needed presets; use `blocklist` to exclude unused utilities; configure narrow scan targets.

**Rationale**: Each preset adds utilities. Blocklist removes specific patterns. Narrow scans reduce extraction time.

**Snippet**:
```typescript
export default defineConfig({
  presets: [presetWind()], // Only what you need
  blocklist: ['container', /^debug-/],
  content: {
    pipeline: {
      include: ["src/**/*.{astro,tsx}"],
      exclude: ["node_modules", "dist"]
    }
  }
});
```

**Performance**: UnoCSS generates CSS in ~13ms vs Tailwind JIT ~1250ms (96x faster).

**When to deviate**: Include multiple presets if team uses varied utility patterns.

**Sources**: [UnoCSS GitHub](https://github.com/unocss/unocss) (2024)

---

### Use batch() to group Solid updates
**Rule**: Wrap multiple synchronous signal updates in `batch()` to trigger single reactive cycle.

**Rationale**: Prevents intermediate re-renders. Critical for forms with many fields or bulk state updates.

**Snippet**:
```typescript
import { batch } from "solid-js";

function updateForm(data: FormData) {
  batch(() => {
    setName(data.name);
    setEmail(data.email);
    setAge(data.age);
  }); // Single update instead of 3
}
```

**When to deviate**: Unnecessary for single setter or naturally batched updates.

**Sources**: [batch - Solid Docs](https://docs.solidjs.com/) (2024)

---

### Implement proper cleanup with onCleanup
**Rule**: Always cleanup subscriptions, timers, and event listeners in effects.

**Rationale**: Prevents memory leaks, especially critical for frequently mounted/unmounted islands.

**Snippet**:
```typescript
createEffect(() => {
  const ws = new WebSocket('wss://...');
  ws.onmessage = (msg) => setData(msg.data);
  
  onCleanup(() => ws.close());
});
```

**When to deviate**: Never—always cleanup resources.

**Sources**: [Effects - Solid Docs](https://docs.solidjs.com/) (2024)

---

## 6. Tooling & QA

### Use eslint-plugin-astro with TypeScript parser
**Rule**: Configure ESLint with `eslint-plugin-astro` and `@typescript-eslint/parser` for comprehensive linting.

**Rationale**: Astro requires special parsing for `.astro` files. Official plugin provides proper AST parsing.

**Snippet**:
```javascript
// eslint.config.mjs (ESLint v9 flat config)
import eslintPluginAstro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';

export default [
  ...tseslint.configs.strict,
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      'astro/no-set-html-directive': 'error',
    }
  }
];
```

**When to deviate**: Consider Biome for faster performance (partial Astro support as of v1.6+).

**Sources**: [eslint-plugin-astro](https://ota-meshi.github.io/eslint-plugin-astro/user-guide/) (2024)

---

### Test with Vitest + Container API + @solidjs/testing-library
**Rule**: Use Vitest with Astro's `getViteConfig()` helper; use Container API (4.9+) for Astro components; use `@solidjs/testing-library` for Solid components.

**Rationale**: Vitest is Vite-native with seamless integration. Container API enables native Astro component testing. Testing-library provides proper reactive context.

**Snippet**:
```typescript
// vitest.config.ts
/// <reference types="vitest" />
import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
```

```typescript
// Counter.test.tsx
import { render } from '@solidjs/testing-library';
import { expect, test } from 'vitest';

test('Counter increments', () => {
  const { getByRole } = render(() => <Counter />);
  const button = getByRole('button');
  button.click();
  expect(button).toHaveTextContent('1');
});
```

**When to deviate**: Use Playwright for E2E testing.

**Sources**: [Testing - Astro Docs](https://docs.astro.build/en/guides/testing/) (2024), [Astro 4.9](https://astro.build/blog/astro-490/) (2024)

---

### Run E2E tests with Playwright
**Rule**: Use Playwright with `webServer` configuration for automated server management.

**Rationale**: Cross-browser E2E testing with TypeScript support. `webServer` eliminates manual server management in CI.

**Snippet**:
```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321/',
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL: 'http://localhost:4321/',
  },
});
```

**When to deviate**: Use Cypress if team prefers its developer experience.

**Sources**: [Testing - Astro Docs](https://docs.astro.build/) (2024)

---

### Enforce type-checking in CI with astro check
**Rule**: Use `astro check` for validating `.astro` files; run separate `tsc --noEmit` for `.ts`/`.tsx` files.

**Rationale**: Astro check validates both Astro templates and TypeScript. Separate commands enable granular failure analysis.

**Snippet**:
```json
{
  "scripts": {
    "typecheck": "astro check && tsc --noEmit",
    "ci": "pnpm lint && pnpm typecheck && pnpm test && pnpm build"
  }
}
```

**When to deviate**: Combine into single command for simpler setups.

**Sources**: Astro documentation (2024)

---

### Structure CI for parallel execution
**Rule**: Separate lint, type-check, test, and build into independent CI jobs with caching.

**Rationale**: Parallel execution provides faster feedback. Caching speeds up subsequent runs.

**Snippet**:
```yaml
# .github/workflows/ci.yml
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
      - run: pnpm build
```

**When to deviate**: Use sequential execution for very simple projects.

**Sources**: GitHub Actions documentation (2024)

---

## 7. Security

### Prevent XSS with auto-escaping and linting
**Rule**: Rely on Solid's native auto-escaping; avoid `innerHTML` and `set:html`; enable `astro/no-set-html-directive` ESLint rule; implement CSP.

**Rationale**: Solid automatically escapes text in JSX. Dangerous patterns bypass escaping. Linting catches violations. CSP provides defense-in-depth.

**Snippet**:
```tsx
// ✅ SAFE: Auto-escaped
const SafeComponent = (props) => <div>{props.userInput}</div>;

// ❌ UNSAFE: Bypasses escaping
const UnsafeComponent = (props) => <div innerHTML={props.untrustedHTML}></div>;
```

```javascript
// eslint.config.mjs
{
  rules: {
    'astro/no-set-html-directive': 'error'
  }
}
```

**When to deviate**: Sanitize with DOMPurify when rendering trusted HTML.

**Sources**: [XSS in Astro - Snyk](https://security.snyk.io/vuln/SNYK-JS-ASTRO-7547139) (2024)

---

### Sanitize user HTML with DOMPurify
**Rule**: Use `isomorphic-dompurify` with strict allowlists for user-generated HTML content.

**Rationale**: When rendering user content from CMS or markdown, sanitization is critical. DOMPurify provides comprehensive XSS protection.

**Snippet**:
```typescript
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOW_DATA_ATTR: false
  });
}
```

**When to deviate**: Use markdown parsers with built-in sanitization for markdown content.

**Sources**: DOMPurify documentation (2024)

---

### Implement CSP with Astro 5.9+ experimental feature
**Rule**: Use Astro 5.9+ experimental CSP with hash-based policies; avoid `unsafe-inline`.

**Rationale**: CSP prevents XSS by whitelisting allowed scripts/styles. Astro 5.9 introduces native CSP with automatic hash generation.

**Snippet**:
```typescript
// astro.config.mjs (Astro 5.9+)
export default defineConfig({
  experimental: {
    csp: {
      hashFunction: 'sha256',
      directives: [
        'img-src: self https:',
        'font-src: self',
        'connect-src: self'
      ]
    }
  }
});
```

**For older Astro**:
```json
// vercel.json
{
  "headers": [{
    "source": "/(.*)",
    "headers": [{
      "key": "Content-Security-Policy",
      "value": "default-src 'self'; script-src 'self' 'sha256-...'"
    }]
  }]
}
```

**When to deviate**: Use permissive CSP in development, strict in production.

**Sources**: [Astro 5.9](https://astro.build/blog/astro-590/) (2025), [Experimental CSP](https://docs.astro.build/en/reference/experimental-flags/csp/) (2024)

---

### Audit dependencies regularly with pnpm audit
**Rule**: Run `pnpm audit` in CI; enable automated updates; verify lockfiles.

**Rationale**: Modern supply chain attacks target npm packages. Regular audits catch vulnerabilities early.

**Snippet**:
```json
{
  "scripts": {
    "audit": "pnpm audit --audit-level=moderate",
    "audit:fix": "pnpm audit --fix"
  }
}
```

```yaml
# .github/workflows/security.yml
- run: pnpm install --frozen-lockfile
- run: pnpm audit
```

**When to deviate**: Use lower audit levels for non-production projects.

**Sources**: pnpm documentation (2024)

---

### Use astro:env for secret management (4.10+)
**Rule**: Use Astro's `astro:env` API with schema validation to enforce server/client separation at build time.

**Rationale**: Astro 4.10+ provides compile-time guarantees that secrets never reach client bundles. Schema-based approach ensures type safety.

**Snippet**:
```typescript
// astro.config.mjs
import { defineConfig, envField } from "astro/config";

export default defineConfig({
  env: {
    schema: {
      DATABASE_URL: envField.string({
        context: "server",
        access: "secret"
      }),
      PUBLIC_API_URL: envField.string({
        context: "client",
        access: "public"
      })
    },
    validateSecrets: true
  }
});

// Usage
import { DATABASE_URL } from "astro:env/server"; // Server-only
import { PUBLIC_API_URL } from "astro:env/client"; // Client-safe
```

**When to deviate**: Use `import.meta.env.PUBLIC_*` for Astro <4.10.

**Sources**: [Environment variables - Astro Docs](https://docs.astro.build/en/guides/environment-variables/) (2024)

---

## 8. Ecosystem & Migration

### Evaluate packages with security and maintenance criteria
**Rule**: Prioritize official integrations; verify TypeScript support, maintenance status, bundle size, and SSR compatibility before adoption.

**Evaluation checklist**:
- ✅ Official Astro/Solid integration or endorsed
- ✅ Active maintenance (commits within 3 months)
- ✅ TypeScript definitions included
- ✅ Bundle size analyzed (bundlephobia.com)
- ✅ SSR/SSG compatibility stated
- ✅ No critical CVEs

**Recommended packages**:
- Astro: `@astrojs/solid-js`, `@astrojs/mdx`, `@astrojs/sitemap`
- SolidJS: `@solidjs/router`, official Solid libraries
- UnoCSS: `unocss`, `@unocss/preset-uno`, `@unocss/preset-icons`

**When to deviate**: Accept well-maintained community packages when official alternatives don't exist.

**Sources**: Astro Integrations directory, SolidJS ecosystem (2024)

---

### Use tested version combinations (2025 stack)
**Rule**: Adopt the recommended version matrix for production deployments.

**Recommended stack**:
```
Node.js:    20.x LTS (20.11+) or 22.x
TypeScript: 5.6+
Astro:      4.16+ or 5.x (5.9+ for CSP)
SolidJS:    1.8.x+ (1.9+ recommended)
UnoCSS:     0.62.x+
pnpm:       9.x+
```

**Snippet**:
```json
{
  "engines": {
    "node": ">=20.11.0",
    "pnpm": ">=9.0.0"
  },
  "dependencies": {
    "astro": "^5.9.0",
    "solid-js": "^1.9.0",
    "unocss": "^0.63.0"
  },
  "devDependencies": {
    "@astrojs/solid-js": "^4.0.0",
    "typescript": "^5.6.0"
  }
}
```

**When to deviate**: Pin exact versions for maximum stability in enterprise environments.

**Sources**: [Upgrade to Astro v5](https://docs.astro.build/en/guides/upgrade-to/v5/) (2024), official repositories

---

### Migrate Astro 4.x → 5.x with staged approach
**Rule**: Follow staged migration: update dependencies, review script handling changes, update MDX integration, test conditionally rendered scripts.

**Key changes**:
- Script handling no longer hoisted by default
- MDX integration requires v4.0.0+
- New CSP experimental feature
- Improved TypeScript support

**Snippet**:
```bash
# Update dependencies
pnpm update astro@latest @astrojs/solid-js@latest @astrojs/mdx@latest

# Test build
pnpm build
```

**When to deviate**: Stay on Astro 4.x if using unsupported integrations.

**Sources**: [Upgrade to Astro v5](https://docs.astro.build/en/guides/upgrade-to/v5/) (2024)

---

### Migrate React → SolidJS with pattern conversion
**Rule**: Replace hooks with primitives, remove dependency arrays, call signals as functions, use `class` not `className`.

**Key pattern conversions**:

```typescript
// React
import { useState, useEffect } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log(count);
  }, [count]); // Dependency array
  
  return <button className="btn" onClick={() => setCount(count + 1)}>
    {count}
  </button>;
}

// Solid
import { createSignal, createEffect } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);
  
  createEffect(() => {
    console.log(count()); // Auto-tracks, no deps
  });
  
  return <button class="btn" onClick={() => setCount(c => c + 1)}>
    {count()} {/* Call as function */}
  </button>;
}
```

**Key differences**:
- Hooks → Primitives: `useState` → `createSignal`, `useEffect` → `createEffect`
- No dependency arrays (automatic tracking)
- Signals are functions: `count()` not `count`
- Props are getters: No destructuring
- Native events: No synthetic events
- JSX: `class` not `className`

**When to deviate**: Incremental migration possible—keep React islands while converting to Solid.

**Sources**: SolidJS documentation (2024)

---

### Structure monorepos with pnpm workspaces + Turbo
**Rule**: Use pnpm workspaces for package management; add Turbo for task orchestration and caching; share `tsconfig` bases.

**Structure**:
```
monorepo/
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
├── apps/
│   └── website/          # Astro app
├── packages/
│   ├── ui/               # Shared Solid components
│   └── utils/
```

**Snippet**:
```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".astro/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "jsxImportSource": "solid-js"
  }
}
```

```json
// apps/website/package.json
{
  "dependencies": {
    "@repo/ui": "workspace:*"
  }
}
```

**When to deviate**: Use Nx for larger monorepos requiring advanced orchestration.

**Sources**: [pnpm Workspaces](https://pnpm.io/workspaces) (2024), [Setup Monorepo with PNPM | Nx](https://nx.dev/blog/setup-a-monorepo-with-pnpm-workspaces-and-speed-it-up-with-nx) (2024)

---

## Conclusion

This comprehensive guide provides production-ready patterns for the TypeScript + Astro + SolidJS + UnoCSS stack in 2025. **Key success factors**:

**TypeScript foundation**: Strict mode with TS 5.6+, discriminated unions for API responses, mapped types for DRY patterns, proper module resolution for Vite/Astro workspaces.

**SolidJS fine-grained reactivity**: Never destructure props, use `createSignal` for primitives and `createStore` for nested objects, leverage `<For>`/`<Show>` control flow, always cleanup with `onCleanup()`.

**UnoCSS zero-runtime utilities**: Static class strings over dynamic interpolation, shortcuts for design system consistency, preset-icons for zero-JS icons, proper scan target configuration.

**Integration patterns**: UnoCSS before SolidJS in config order, strategic `client:*` directives for JavaScript budget, server-fetched data as props to avoid waterfalls, global stores for cross-island state.

**Performance optimization**: Minimize shipped JavaScript with partial hydration, leverage Solid's fine-grained updates, implement proper code-splitting, use `batch()` for multiple updates.

**Production readiness**: ESLint with `eslint-plugin-astro`, Vitest + Container API + testing-library, Playwright for E2E, CSP with Astro 5.9+, `astro:env` for secrets management, dependency audits in CI.

**Recommended 2025 versions**: Node 20 LTS, TypeScript 5.6+, Astro 5.x, SolidJS 1.9+, UnoCSS 0.63+, pnpm 9+.

This stack delivers **exceptional performance** (Solid's fine-grained reactivity, UnoCSS's instant compilation), **excellent DX** (TypeScript strict typing, fast HMR), and **production-grade security** (CSP, automatic escaping, secret management). Follow these patterns for maintainable, performant, secure applications.