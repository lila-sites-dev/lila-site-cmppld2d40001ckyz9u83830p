// Tailwind v4 uses a PostCSS plugin; no Tailwind config file is needed — theme
// tokens are declared inline via `@theme` in app/globals.css and overridden at
// build time by the design tokens written by scripts/applyDesign.mjs.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
