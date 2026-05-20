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
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Shadow card */}
        <div
          style={{
            position: 'absolute',
            background: 'rgba(0,0,0,0.18)',
            width: 295,
            height: 195,
            borderRadius: 24,
            top: 170,
            left: 80,
            transform: 'rotate(-8deg)',
          }}
        />
        {/* Front card */}
        <div
          style={{
            background: 'white',
            width: 290,
            height: 190,
            borderRadius: 22,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            marginTop: -10,
          }}
        >
          <div style={{ fontSize: 88, fontWeight: 900, color: '#4f46e5', lineHeight: 1 }}>
            Aa
          </div>
          <div style={{ width: 180, height: 8, background: '#e0e7ff', borderRadius: 4 }} />
          <div style={{ width: 130, height: 6, background: '#e0e7ff', borderRadius: 3 }} />
        </div>
      </div>
    ),
    size,
  );
}
