import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: '#0d1117',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          fontWeight: 700,
          fontSize: 20,
          color: '#F7931A',
          letterSpacing: '-1px',
        }}
      >
        S
      </div>
    ),
    { ...size }
  )
}
