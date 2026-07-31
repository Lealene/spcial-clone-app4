import { ImageResponse } from 'next/og';

/** Facebook/X/LinkedIn all crop to this; anything else gets letterboxed. */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };
export const OG_IMAGE_CONTENT_TYPE = 'image/png';

// Hardcoded rather than read from the theme: Satori resolves no CSS variables
// and no stylesheet, so every value has to be literal at render time.
const PRIMARY = '#11355c';
const PRIMARY_DEEP = '#0c2540';
const ACCENT = '#3cb6b3';
const SURFACE = '#faf6f0';

export type OgCardProps = {
  /** Small uppercase line above the title, e.g. the community name. */
  eyebrow?: string;
  title: string;
  /** Short facts rendered as pills, e.g. "4 bed", "3,200 sq ft". */
  facts?: string[];
  /** Large emphasised value on the right, e.g. the price. */
  highlight?: string;
  /** Absolute URL of the background photo. Falls back to a flat gradient. */
  imageUrl?: string;
  brandName: string;
};

/**
 * One card layout for every social surface. Kept deliberately plain — Satori
 * supports a subset of flexbox and no grid, and a failed OG render is a blank
 * share preview rather than a visible error.
 */
export function renderOgCard({
  eyebrow,
  title,
  facts = [],
  highlight,
  imageUrl,
  brandName,
}: OgCardProps): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        backgroundColor: PRIMARY_DEEP,
        // Spread, never `backgroundImage: undefined` — Satori reads the key if
        // it is present at all and throws on the undefined value.
        ...(imageUrl
          ? {
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: `${OG_IMAGE_SIZE.width}px ${OG_IMAGE_SIZE.height}px`,
              backgroundPosition: 'center',
            }
          : {}),
      }}
    >
      {/* Scrim: photos are unpredictable, and white text needs a floor. */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
          padding: '56px 64px 52px',
          background: `linear-gradient(to top, ${PRIMARY_DEEP}f2 0%, ${PRIMARY}cc 55%, transparent 100%)`,
        }}
      >
        {eyebrow ? (
          <div
            style={{
              display: 'flex',
              color: ACCENT,
              fontSize: 26,
              letterSpacing: 3,
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            {eyebrow}
          </div>
        ) : null}

        <div
          style={{
            display: 'flex',
            color: SURFACE,
            fontSize: 60,
            fontWeight: 800,
            lineHeight: 1.1,
            // Two lines of a long street address is the realistic worst case.
            maxWidth: 980,
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 14 }}>
            {facts.slice(0, 4).map((fact) => (
              <div
                key={fact}
                style={{
                  display: 'flex',
                  padding: '10px 20px',
                  borderRadius: 999,
                  border: `1px solid ${SURFACE}55`,
                  color: SURFACE,
                  fontSize: 26,
                }}
              >
                {fact}
              </div>
            ))}
          </div>

          {highlight ? (
            <div style={{ display: 'flex', color: SURFACE, fontSize: 46, fontWeight: 700 }}>
              {highlight}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 10,
            color: `${SURFACE}cc`,
            fontSize: 24,
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}
        >
          <div style={{ display: 'flex', width: 34, height: 3, backgroundColor: ACCENT }} />
          {brandName}
        </div>
      </div>
    </div>,
    OG_IMAGE_SIZE,
  );
}
