/**
 * Seeded design-exploration controls. The floating switcher flips three
 * attributes on <html> — `data-theme` (colors), `data-font` (typeface pairing),
 * `data-radius` (corner roundness) — each with a matching block in globals.css.
 * All three are temporary client-showcase knobs: once the client picks, delete
 * this module, the switcher, and the extra [data-*] blocks + fonts.
 *
 * Keep these lists in sync with the [data-theme]/[data-font]/[data-radius]
 * blocks in globals.css and the fonts loaded in app/layout.tsx.
 */

// ---------------------------------------------------------------------------
// Colors
// ---------------------------------------------------------------------------
export const THEMES = [
  { key: 'concierge', label: 'Concierge', mood: 'Navy · Ivory · Gold', swatch: '#ffb703' },
  { key: 'coastal', label: 'Coastal', mood: 'Aqua · Deep Ocean', swatch: '#5fd3d0' },
  { key: 'sand', label: 'Sand', mood: 'Warm Boutique', swatch: '#e2cda8' },
  { key: 'shoreline', label: 'Shoreline', mood: 'Soft Pastel', swatch: '#bad8ce' },
  { key: 'seaglass', label: 'Sea Glass', mood: 'Breezy Sea-Glass · Teal', swatch: '#7ec7c2' },
  { key: 'harbor', label: 'Harbor', mood: 'Moody Maritime · Tan', swatch: '#d9b08c' },
  { key: 'saltair', label: 'Salt Air', mood: 'Minimal · Muted Aqua', swatch: '#5e8c8a' },
  { key: 'pebble', label: 'Pebble & Foam', mood: 'Cool · Slate Blue-Green', swatch: '#2d6a7a' },
  { key: 'dune', label: 'Dune House', mood: 'Warm Neutral · Driftwood', swatch: '#bfa38a' },
  { key: 'tidepool', label: 'Tidepool', mood: 'Soft Pastel · Seafoam', swatch: '#b8e1dd' },
  { key: 'lighthouse', label: 'Lighthouse', mood: 'Classic Nautical · Brick', swatch: '#c04b3a' },
  {
    key: 'turquoise',
    label: 'Turquoise Coast',
    mood: 'Vivid Coastal Turquoise',
    swatch: '#1fc3ba',
  },
  { key: 'cove', label: 'Coastal Cove', mood: 'Aqua · Sand · Coral', swatch: '#64b5c1' },
  {
    key: 'butter',
    label: 'Butter & Turquoise',
    mood: 'Buttery Gold · Turquoise',
    swatch: '#40e0d0',
  },
  {
    key: 'coastalblues',
    label: 'Coastal Blues',
    mood: 'Monochrome Ocean Blues',
    swatch: '#2c7da0',
  },
] as const;

export type ThemeKey = (typeof THEMES)[number]['key'];

// ---------------------------------------------------------------------------
// Typeface pairings (display serif × body sans). `serifVar`/`sansVar` are the
// next/font CSS variables set on <html> in app/layout.tsx; the [data-font]
// blocks in globals.css remap --ui-serif/--ui-sans to them.
// ---------------------------------------------------------------------------
export const FONTS = [
  {
    key: 'playfair',
    label: 'Playfair · Manrope',
    note: 'Elegant serif — default',
    serifVar: '--font-playfair',
    sansVar: '--font-manrope',
  },
  {
    key: 'montserrat',
    label: 'Montserrat · Manrope',
    note: 'Modern premium',
    serifVar: '--font-montserrat',
    sansVar: '--font-manrope',
  },
  {
    key: 'roboto',
    label: 'Roboto',
    note: 'Clean & trusted',
    serifVar: '--font-roboto',
    sansVar: '--font-roboto',
  },
  {
    key: 'poppins',
    label: 'Poppins · Manrope',
    note: 'Friendly geometric',
    serifVar: '--font-poppins',
    sansVar: '--font-manrope',
  },
  {
    key: 'jakarta',
    label: 'Plus Jakarta Sans',
    note: 'Contemporary premium',
    serifVar: '--font-jakarta',
    sansVar: '--font-jakarta',
  },
  {
    key: 'outfit',
    label: 'Outfit · Manrope',
    note: 'Sleek minimal',
    serifVar: '--font-outfit',
    sansVar: '--font-manrope',
  },
] as const;

export type FontKey = (typeof FONTS)[number]['key'];

// ---------------------------------------------------------------------------
// Corner roundness — overrides --radius; the rounded-* scale derives from it.
// ---------------------------------------------------------------------------
export const RADII = [
  { key: 'none', label: 'None' },
  { key: 'sm', label: 'Small' },
  { key: 'md', label: 'Medium' },
  { key: 'lg', label: 'Large' },
  { key: 'full', label: 'Full' },
] as const;

export type RadiusKey = (typeof RADII)[number]['key'];

// ---------------------------------------------------------------------------
// Defaults + persistence
// ---------------------------------------------------------------------------
export const DEFAULT_THEME: ThemeKey = 'concierge';
export const DEFAULT_FONT: FontKey = 'playfair';
export const DEFAULT_RADIUS: RadiusKey = 'md';

export const THEME_STORAGE_KEY = 'mvp-theme';
export const FONT_STORAGE_KEY = 'mvp-font';
export const RADIUS_STORAGE_KEY = 'mvp-radius';

/**
 * Inline, pre-paint script that applies the active theme/font/radius before
 * first paint to avoid a flash of the defaults (FOUC). For each control a
 * `?theme=`/`?font=`/`?radius=` query param wins (and is persisted, so links are
 * shareable/screenshot-friendly), then the stored value, then the default.
 * Stringified into <head>.
 */
export const designFoucScript = `(function(){
  function pick(attr,param,keys,fallback,store,sp){
    try{
      var q=sp.get(param);
      var v=(q&&keys.indexOf(q)>-1)?q:localStorage.getItem(store);
      var k=keys.indexOf(v)>-1?v:fallback;
      document.documentElement.setAttribute(attr,k);
      if(q&&keys.indexOf(q)>-1){localStorage.setItem(store,q);}
    }catch(e){document.documentElement.setAttribute(attr,fallback);}
  }
  var sp=new URLSearchParams(location.search);
  pick('data-theme','theme',['${THEMES.map((t) => t.key).join("','")}'],'${DEFAULT_THEME}','${THEME_STORAGE_KEY}',sp);
  pick('data-font','font',['${FONTS.map((f) => f.key).join("','")}'],'${DEFAULT_FONT}','${FONT_STORAGE_KEY}',sp);
  pick('data-radius','radius',['${RADII.map((r) => r.key).join("','")}'],'${DEFAULT_RADIUS}','${RADIUS_STORAGE_KEY}',sp);
})();`;
