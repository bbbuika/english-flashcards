import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            background: 'rgba(0,0,0,0.18)',
            width: 104,
            height: 68,
            borderRadius: 10,
            top: 62,
            left: 28,
            transform: 'rotate(-8deg)',
          }}
        />
        <div
          style={{
            background: 'white',
            width: 102,
            height: 66,
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
            marginTop: -4,
          }}
        >
          <div style={{ fontSize: 30, fontWeight: 900, color: '#4f46e5', lineHeight: 1 }}>Aa</div>
          <div style={{ width: 62, height: 3, background: '#e0e7ff', borderRadius: 2 }} />
          <div style={{ width: 44, height: 2, background: '#e0e7ff', borderRadius: 1 }} />
        </div>
      </div>
    ),
    size,
  );
}
