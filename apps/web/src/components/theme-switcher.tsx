'use client';

import { useEffect, useState } from 'react';
import { Check, SlidersHorizontal, X } from 'lucide-react';

import { cn } from '@mvp-realty/ui/lib/utils';
import {
  DEFAULT_FONT,
  DEFAULT_RADIUS,
  DEFAULT_THEME,
  FONT_STORAGE_KEY,
  FONTS,
  RADII,
  RADIUS_STORAGE_KEY,
  THEME_STORAGE_KEY,
  THEMES,
  type FontKey,
  type RadiusKey,
  type ThemeKey,
} from '@/lib/themes';

/** Tiny px previews of each radius preset for the corner swatches. */
const RADIUS_PREVIEW: Record<RadiusKey, number> = { none: 0, sm: 3, md: 6, lg: 11, full: 16 };

function persist(attr: string, storageKey: string, value: string) {
  document.documentElement.setAttribute(attr, value);
  try {
    localStorage.setItem(storageKey, value);
  } catch {
    /* ignore private-mode storage errors */
  }
}

/**
 * Floating design-exploration switcher — lets the client play with color
 * (`data-theme`), typeface (`data-font`), and corner roundness (`data-radius`).
 * Persists each to localStorage; the FOUC script in <head> applies them before
 * paint. Temporary: strip this (and the extra fonts / [data-*] blocks) once the
 * client locks a direction.
 */
export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeKey>(DEFAULT_THEME);
  const [font, setFont] = useState<FontKey>(DEFAULT_FONT);
  const [radius, setRadius] = useState<RadiusKey>(DEFAULT_RADIUS);

  // Sync from the DOM (the FOUC script already applied the stored values).
  useEffect(() => {
    const el = document.documentElement;
    const t = el.getAttribute('data-theme') as ThemeKey | null;
    const f = el.getAttribute('data-font') as FontKey | null;
    const r = el.getAttribute('data-radius') as RadiusKey | null;
    if (t) setTheme(t);
    if (f) setFont(f);
    if (r) setRadius(r);
  }, []);

  function chooseTheme(key: ThemeKey) {
    setTheme(key);
    persist('data-theme', THEME_STORAGE_KEY, key);
  }
  function chooseFont(key: FontKey) {
    setFont(key);
    persist('data-font', FONT_STORAGE_KEY, key);
  }
  function chooseRadius(key: RadiusKey) {
    setRadius(key);
    persist('data-radius', RADIUS_STORAGE_KEY, key);
  }

  return (
    <div className="fixed right-5 bottom-5 z-[100] print:hidden">
      {open && (
        <div className="border-line bg-surface shadow-lift mb-3 flex max-h-[min(80vh,640px)] w-72 flex-col overflow-hidden rounded-xl border">
          <div className="border-line-soft flex items-center justify-between border-b px-4 py-3">
            <span className="text-muted font-sans text-xs font-bold tracking-[0.18em] uppercase">
              Customize
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close customizer"
              className="text-muted hover:text-ink transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {/* Palette */}
            <section className="border-line-soft border-b p-2">
              <p className="text-muted px-2 pt-1 pb-1 font-sans text-[11px] font-bold tracking-[0.14em] uppercase">
                Palette
              </p>
              <ul>
                {THEMES.map((t) => {
                  const active = t.key === theme;
                  return (
                    <li key={t.key}>
                      <button
                        type="button"
                        onClick={() => chooseTheme(t.key)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
                          active ? 'bg-surface-muted' : 'hover:bg-surface-muted/60',
                        )}
                      >
                        <span
                          className="size-5 shrink-0 rounded-full ring-1 ring-black/10"
                          style={{ background: t.swatch }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="text-ink block truncate font-sans text-[13px] font-bold">
                            {t.label}
                          </span>
                          <span className="text-muted block truncate font-sans text-[11px]">
                            {t.mood}
                          </span>
                        </span>
                        {active && <Check className="text-accent-deep size-4 shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Typeface */}
            <section className="border-line-soft border-b p-2">
              <p className="text-muted px-2 pt-1 pb-1 font-sans text-[11px] font-bold tracking-[0.14em] uppercase">
                Typeface
              </p>
              <ul>
                {FONTS.map((f) => {
                  const active = f.key === font;
                  return (
                    <li key={f.key}>
                      <button
                        type="button"
                        onClick={() => chooseFont(f.key)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors',
                          active ? 'bg-surface-muted' : 'hover:bg-surface-muted/60',
                        )}
                      >
                        <span
                          className="border-line bg-surface-soft text-ink grid size-7 shrink-0 place-items-center rounded-md border text-[16px] leading-none"
                          style={{ fontFamily: `var(${f.serifVar})` }}
                          aria-hidden
                        >
                          Aa
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className="text-ink block truncate text-[14px] font-semibold"
                            style={{ fontFamily: `var(${f.serifVar})` }}
                          >
                            {f.label}
                          </span>
                          <span className="text-muted block truncate font-sans text-[11px]">
                            {f.note}
                          </span>
                        </span>
                        {active && <Check className="text-accent-deep size-4 shrink-0" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Corners */}
            <section className="p-3">
              <p className="text-muted px-1 pb-2 font-sans text-[11px] font-bold tracking-[0.14em] uppercase">
                Corners
              </p>
              <div className="flex gap-1.5">
                {RADII.map((r) => {
                  const active = r.key === radius;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => chooseRadius(r.key)}
                      aria-pressed={active}
                      title={r.label}
                      className={cn(
                        'flex flex-1 flex-col items-center gap-1.5 rounded-md border px-1 py-2 transition-colors',
                        active
                          ? 'border-accent-deep bg-surface-muted'
                          : 'border-line hover:bg-surface-muted/60',
                      )}
                    >
                      <span
                        className="border-primary bg-surface-soft size-6 border-2"
                        style={{ borderRadius: RADIUS_PREVIEW[r.key] }}
                        aria-hidden
                      />
                      <span className="text-ink-soft font-sans text-[10px] font-bold">
                        {r.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Customize design"
        aria-expanded={open}
        className="bg-primary text-on-primary shadow-lift flex items-center gap-2 rounded-full px-5 py-3.5 font-sans text-sm font-bold transition-transform hover:-translate-y-0.5"
      >
        <SlidersHorizontal className="size-4" />
        <span className="hidden sm:inline">Customize</span>
      </button>
    </div>
  );
}
