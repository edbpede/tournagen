export const componentShortcuts = {
  btn: "inline-flex items-center justify-center gap-2 rounded-lg border font-semibold transition-all duration-150 shadow-soft focus-visible:(outline-none ring-2 ring-brand-200 ring-offset-2 ring-offset-surface-50) disabled:(opacity-60 cursor-not-allowed)",
  "btn-primary":
    "btn bg-brand-600 text-white border-brand-600 hover:bg-brand-700 active:bg-brand-800",
  "btn-secondary":
    "btn bg-white text-brand-700 border-neutral-200 hover:(border-brand-300 text-brand-800 shadow-card)",
  "btn-ghost":
    "btn bg-transparent text-brand-700 border-transparent hover:(bg-brand-50 text-brand-800)",
  input:
    "w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-neutral-900 shadow-[inset_0_1px_0_rgba(17,24,39,0.04)] focus:(border-brand-500 ring-2 ring-brand-200 outline-none) placeholder:text-neutral-400",
  card: "rounded-xl border border-neutral-200/80 bg-white/95 shadow-card backdrop-blur-sm",
  surface: "bg-surface-50 text-neutral-900",
  "section-heading":
    "flex items-center justify-between gap-3 text-neutral-800 text-lg font-semibold tracking-tight",
  pill: "inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 border border-brand-100",
  "badge-accent":
    "inline-flex items-center rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-800",
  "tournament-card":
    "card border-brand-100 hover:(border-brand-200 shadow-soft translate-y-[-2px]) transition-all duration-200",
  "bracket-match":
    "grid gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-soft data-[state=bye]:opacity-70",
  "bracket-connector": "h-px w-full bg-neutral-200",
  "field-group": "space-y-2",
  "input-label": "text-sm font-medium text-neutral-700",
} as const;

export type ShortcutTuple = keyof typeof componentShortcuts;
