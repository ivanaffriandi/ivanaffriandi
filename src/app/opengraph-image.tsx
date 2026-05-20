import { ImageResponse } from 'next/og';

export const alt = 'Ivan Affriandi';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #f5f3ef 0%, #e8e4dc 40%, #d4cfc5 100%)',
          position: 'relative',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Large background monogram watermark */}
        <div style={{
          position: 'absolute',
          top: '-80px',
          right: '-60px',
          fontSize: '520px',
          fontWeight: 900,
          color: 'rgba(0,0,0,0.04)',
          letterSpacing: '-0.05em',
          lineHeight: 1,
          userSelect: 'none',
          display: 'flex',
        }}>
          IA
        </div>

        {/* Thin top accent bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: 'linear-gradient(90deg, #1a1a1a 0%, #6b6358 50%, #b4a08a 100%)',
          display: 'flex',
        }} />

        {/* Bottom content block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10 }}>
          {/* Eyebrow label */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <div style={{
              width: '32px',
              height: '3px',
              background: '#1a1a1a',
              borderRadius: '2px',
              display: 'flex',
            }} />
            <span style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#6b6358',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}>
              Personal
            </span>
          </div>

          {/* Main name — full, bold, large */}
          <h1 style={{
            fontSize: '112px',
            fontWeight: 900,
            letterSpacing: '-0.04em',
            color: '#1a1a1a',
            margin: 0,
            lineHeight: 0.95,
          }}>
            Ivan Affriandi
          </h1>

          {/* Tagline */}
          <p style={{
            fontSize: '28px',
            fontWeight: 500,
            color: '#6b6358',
            margin: 0,
            letterSpacing: '-0.01em',
          }}>
            Writing, moments & thoughts — ivanaffriandi.com
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
