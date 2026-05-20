import { ImageResponse } from 'next/og';

export const alt = 'Ask Ivan — Ask me anything anonymously.';
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
          background: 'linear-gradient(135deg, #0f0f10 0%, #18181b 50%, #1e1c1a 100%)',
          position: 'relative',
          fontFamily: 'sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Large "ASK" outline watermark — modern minimalism */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-80px',
          fontSize: '420px',
          fontWeight: 900,
          color: 'transparent',
          letterSpacing: '-0.06em',
          lineHeight: 1,
          userSelect: 'none',
          display: 'flex',
          WebkitTextStroke: '2px rgba(255,255,255,0.1)',
        }}>
          ASK
        </div>

        {/* Thin top accent bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '5px',
          background: 'linear-gradient(90deg, #e8e4dc 0%, #b4a08a 50%, #6b6358 100%)',
          display: 'flex',
        }} />

        {/* Bottom content block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 10 }}>
          {/* Eyebrow label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '3px', background: '#e8e4dc', borderRadius: '2px', display: 'flex' }} />
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#a09e9b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              Anonymous Q&amp;A
            </span>
          </div>

          {/* Main title */}
          <h1 style={{ fontSize: '120px', fontWeight: 900, letterSpacing: '-0.04em', color: '#f5f3ef', margin: 0, lineHeight: 0.95 }}>
            Ask Ivan
          </h1>

          {/* Tagline */}
          <p style={{ fontSize: '30px', fontWeight: 500, color: '#a09e9b', margin: 0, letterSpacing: '-0.01em' }}>
            Ask me anything anonymously — ivanaffriandi.com/ask
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
