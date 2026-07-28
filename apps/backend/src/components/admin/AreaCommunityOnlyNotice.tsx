'use client';

/**
 * Shown on Editorial / Reviews when the area kind is `city`.
 * Those tabs hide every community-only field, which otherwise looks empty.
 */
export default function AreaCommunityOnlyNotice() {
  return (
    <div
      style={{
        marginBottom: '1.5rem',
        padding: '1rem 1.15rem',
        borderRadius: '4px',
        border: '1px solid var(--theme-elevation-150)',
        background: 'var(--theme-elevation-50)',
        color: 'var(--theme-text)',
        lineHeight: 1.5,
        maxWidth: '42rem',
      }}
    >
      <strong style={{ display: 'block', marginBottom: '0.35rem' }}>
        Not available for city areas
      </strong>
      Editorial and Reviews are for community areas only. Cities feed listings filters — they do not
      get detail-page copy. Switch Kind to Community on the Identity tab to edit these fields.
    </div>
  );
}
