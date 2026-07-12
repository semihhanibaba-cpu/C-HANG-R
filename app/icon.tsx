import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 16,
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', // Vibrant Orange
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 900,
          borderRadius: '8px',
          border: '1.5px solid #ffffff',
          boxSizing: 'border-box',
          fontFamily: 'sans-serif',
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        HB
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
