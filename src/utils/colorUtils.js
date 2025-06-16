// colorUtils.js
// Utility for generating high-contrast colors for shapes

/**
 * Generates a high-contrast color in HSL format, avoiding low-contrast colors for both light and dark themes.
 * @param {'light'|'dark'} theme - The current theme ('light' or 'dark').
 * @returns {string} - A CSS color string (e.g., 'hsl(210, 90%, 45%)')
 */
export function getHighContrastColor(theme = 'light') {
  // Use a curated set of high-contrast HSL values
  // These are visually distinct and work on both light and dark backgrounds
  const palette = [
    [210, 90, 45], // blue
    [0, 80, 50],   // red
    [45, 100, 50], // yellow
    [130, 60, 40], // green
    [280, 60, 55], // purple
    [25, 90, 55],  // orange
    [180, 80, 40], // teal
    [330, 70, 55], // magenta
    [90, 60, 45],  // lime
    [200, 40, 60], // sky
    [350, 60, 50], // pink
    [40, 80, 45],  // gold
  ];

  // For dark theme, slightly increase lightness for better visibility
  const lightnessAdjust = theme === 'dark' ? 10 : 0;

  // Pick a random color from the palette
  const idx = Math.floor(Math.random() * palette.length);
  const [h, s, l] = palette[idx];
  return `hsl(${h}, ${s}%, ${l + lightnessAdjust}%)`;
}

/**
 * Optionally, allow deterministic color assignment by index (for shape type consistency)
 */
export function getPaletteColorByIndex(index, theme = 'light') {
  const palette = [
    [210, 90, 45], [0, 80, 50], [45, 100, 50], [130, 60, 40],
    [280, 60, 55], [25, 90, 55], [180, 80, 40], [330, 70, 55],
    [90, 60, 45], [200, 40, 60], [350, 60, 50], [40, 80, 45],
  ];
  const lightnessAdjust = theme === 'dark' ? 10 : 0;
  const [h, s, l] = palette[index % palette.length];
  return `hsl(${h}, ${s}%, ${l + lightnessAdjust}%)`;
}
