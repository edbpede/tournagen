export const spacing = {
  '0': '0px',
  '0.5': '0.125rem',
  '1': '0.25rem',
  '1.5': '0.375rem',
  '2': '0.5rem',
  '2.5': '0.625rem',
  '3': '0.75rem',
  '3.5': '0.875rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '7': '1.75rem',
  '8': '2rem',
  '10': '2.5rem',
  '12': '3rem',
  '14': '3.5rem',
  '16': '4rem',
} as const;

export const radii = {
  sm: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  pill: '9999px',
} as const;

export const shadows = {
  soft: '0 10px 40px -18px rgba(26, 36, 52, 0.35)',
  card: '0 20px 50px -30px rgba(18, 47, 99, 0.45)',
  ring: '0 0 0 3px rgba(47, 111, 242, 0.18)',
} as const;

export const breakpoints = {
  xs: '480px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export type ScaleTokens = {
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadows;
  breakpoints: typeof breakpoints;
};
