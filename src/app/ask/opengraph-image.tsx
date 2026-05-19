import { ImageResponse } from 'next/og';

export const alt = 'Ask me anything!';
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
          fontFamily: 'sans-serif',
          position: 'relative'
        }}
      >
        {/* Background grid */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(150, 150, 150, 0.15) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(150, 150, 150, 0.15) 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }} />
        
        {/* Dark Mode Q&A Card */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '60px 100px',
          backgroundColor: '#121212', // High contrast for the Ask page thumbnail
          borderRadius: '40px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.15)'
        }}>
          <h1 style={{ fontSize: 85, margin: 0, fontWeight: 800, letterSpacing: '-0.04em', color: '#ffffff' }}>
            Ask Ivan
          </h1>
          <p style={{ fontSize: 36, margin: '24px 0 0 0', fontWeight: 500, color: '#a1a1aa', letterSpacing: '-0.01em' }}>
            Send Ivan an anonymous message ✨
          </p>
          
          <div style={{ 
            display: 'flex', 
            marginTop: '45px', 
            padding: '16px 45px', 
            backgroundColor: '#ffffff', 
            color: '#121212', 
            borderRadius: '50px', 
            fontSize: 28, 
            fontWeight: 700 
          }}>
            ivanaffriandi.com/ask
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
