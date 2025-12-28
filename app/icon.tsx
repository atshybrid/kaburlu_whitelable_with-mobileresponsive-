import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const size = {
  width: 64,
  height: 64,
}

export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#ffffff',
          color: '#111827',
          fontSize: 40,
          fontWeight: 800,
          borderRadius: 12,
          border: '1px solid #e5e7eb',
        }}
      >
        K
      </div>
    ),
    { ...size },
  )
}
