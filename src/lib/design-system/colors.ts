export const brand = {
  50: '#edf3ff',
  100: '#d8e6ff',
  200: '#b5ceff',
  300: '#83acff',
  400: '#4f88fb',
  500: '#2f6ff2',
  600: '#2156c7',
  700: '#1b469d',
  800: '#153777',
  900: '#122f63',
} as const;

export const accent = {
  50: '#fff7ed',
  100: '#ffebd7',
  200: '#ffd6ae',
  300: '#ffb971',
  400: '#ff9a33',
  500: '#f07900',
  600: '#ca6200',
  700: '#9c4c04',
  800: '#7f3d07',
  900: '#6b320a',
} as const;

export const neutral = {
  50: '#f7f8fa',
  100: '#edf1f5',
  200: '#d9e0e8',
  300: '#c6d0dd',
  400: '#9aa6b7',
  500: '#738099',
  600: '#566178',
  700: '#3d485c',
  800: '#2a3345',
  900: '#1b2233',
} as const;

export const surface = {
  50: '#f9fbff',
  100: '#f2f5fb',
  200: '#e5ebf5',
  300: '#d4deeb',
  400: '#aebed1',
  500: '#7c90a8',
} as const;

export const status = {
  success: '#16a34a',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0284c7',
} as const;

export const colors = {
  brand,
  accent,
  neutral,
  surface,
  status,
} as const;

export type ColorPalette = typeof colors;
