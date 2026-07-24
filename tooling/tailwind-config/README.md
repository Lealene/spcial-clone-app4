# @mvp-realty/tailwind-config

Tailwind v4 CSS-first design tokens for the monorepo.

## Usage

```css
/* apps/<app>/src/app/globals.css */
@import 'tailwindcss';
@import '@mvp-realty/tailwind-config/theme.css';
```

## Status

This package owns the locked Sand design system: semantic role tokens, the shadcn token bridge, medium radius, Manrope font channels, shared shadows, and shared animation token names. App CSS should stay thin and hold only imports, shared source scanning directives, base rules, and app-only keyframes.
