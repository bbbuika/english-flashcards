import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at 30% 30%, #2b1d10 0%, #0e0a07 70%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            background: 'rgba(0,0,0,0.4)',
            width: 280,
            height: 380,
            borderRadius: 28,
            top: 80,
            left: 130,
            transform: 'rotate(-10deg)',
            border: '2px solid #3a2e22',
          }}
        />
        <div
          style={{
            background: 'linear-gradient(180deg, #f3e0c2 0%, #c9a878 100%)',
            width: 280,
            height: 380,
            borderRadius: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid #8b6f47',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          }}
        >
          <div
            style={{
              fontSize: 200,
              fontWeight: 900,
              color: '#1c130b',
              fontFamily: 'serif',
              lineHeight: 1,
            }}
          >
            A
          </div>
        </div>
      </div>
    ),
    size,
  );
}
