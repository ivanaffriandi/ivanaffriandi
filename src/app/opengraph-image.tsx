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
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
          color: '#121212',
          fontFamily: 'sans-serif',
          position: 'relative'
        }}
      >
        {/* Subtle grid pattern background to match the Swiss / Archival theme */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(150, 150, 150, 0.15) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(150, 150, 150, 0.15) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }} />
        
        {/* Glassmorphic central card */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '50px 100px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '35px',
          border: '1px solid rgba(150,150,150,0.2)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.05)'
        }}>
          <h1 style={{ fontSize: 90, margin: 0, fontWeight: 800, letterSpacing: '-0.04em', color: '#121212' }}>
            Ivan Affriandi
          </h1>
          <p style={{ fontSize: 36, margin: '20px 0 0 0', fontWeight: 500, color: '#86868b', letterSpacing: '-0.01em' }}>
            Studio & Journal
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
