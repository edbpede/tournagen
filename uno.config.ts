import {
  defineConfig,
  presetIcons,
  presetWind,
  transformerVariantGroup,
} from "unocss";
import { colors } from "./src/lib/design-system/colors";
import { componentShortcuts } from "./src/lib/design-system/shortcuts";
import {
  breakpoints,
  radii,
  shadows,
  spacing,
} from "./src/lib/design-system/scale";
import { typography } from "./src/lib/design-system/typography";

export default defineConfig({
  presets: [
    presetWind({ dark: "class" }),
    presetIcons({ cdn: "https://esm.sh/", scale: 1.1 }),
  ],
  theme: {
    colors: {
      brand: colors.brand,
      accent: colors.accent,
      neutral: colors.neutral,
      surface: colors.surface,
      success: colors.status.success,
      warning: colors.status.warning,
      danger: colors.status.danger,
      info: colors.status.info,
    },
    fontFamily: {
      sans: typography.fontFamilies.sans,
      display: typography.fontFamilies.display,
      mono: typography.fontFamilies.mono,
    },
    fontSize: typography.fontSizes,
    spacing,
    borderRadius: radii,
    boxShadow: shadows,
    breakpoints,
  },
  shortcuts: componentShortcuts,
  content: {
    pipeline: {
      include: ["src/**/*.{astro,tsx,ts}"],
      exclude: ["node_modules", "dist"],
    },
  },
  transformers: [transformerVariantGroup()],
});
