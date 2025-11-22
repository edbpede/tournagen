export const fontFamilies = {
  sans: '"Space Grotesk", "Inter", "Helvetica Neue", Arial, sans-serif',
  display: '"Clash Display", "Space Grotesk", "Inter", "Helvetica Neue", Arial, sans-serif',
  mono: '"DM Mono", "SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
} as const;

export const fontSizes = {
  xs: ['0.75rem', '1.1rem'],
  sm: ['0.875rem', '1.35rem'],
  base: ['1rem', '1.5rem'],
  md: ['1.125rem', '1.65rem'],
  lg: ['1.25rem', '1.8rem'],
  xl: ['1.5rem', '2.1rem'],
  '2xl': ['1.75rem', '2.35rem'],
  '3xl': ['2rem', '2.6rem'],
  '4xl': ['2.5rem', '3.1rem'],
} as const;

export const typography = {
  fontFamilies,
  fontSizes,
} as const;

export type TypographyScale = typeof typography;
