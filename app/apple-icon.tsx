import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          fontSize: 84,
          background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', // Vibrant Orange
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 950,
          borderRadius: '40px',
          border: '8px solid #ffffff',
          boxSizing: 'border-box',
          fontFamily: 'sans-serif',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
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
