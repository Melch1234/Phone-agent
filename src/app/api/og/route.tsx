import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: '#040d1f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px 100px',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: 'absolute', right: -120, top: -120, width: 640, height: 640, borderRadius: '50%', border: '1.5px solid rgba(242,106,31,0.2)', display: 'flex' }} />
        <div style={{ position: 'absolute', right: -60, top: -60, width: 440, height: 440, borderRadius: '50%', border: '1px solid rgba(242,106,31,0.12)', display: 'flex' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, width: 260, height: 260, borderRadius: '50%', border: '1px solid rgba(242,106,31,0.08)', display: 'flex' }} />

        {/* Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(242,106,31,0.12)',
          border: '1px solid rgba(242,106,31,0.35)',
          borderRadius: 100,
          padding: '8px 22px',
          marginBottom: 44,
          color: '#F26A1F',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
        }}>
          After-hours phone agent for tourism
        </div>

        {/* Brand name */}
        <div style={{
          fontSize: 128,
          fontWeight: 900,
          color: '#f0e8d8',
          letterSpacing: '-0.04em',
          lineHeight: 1,
          marginBottom: 28,
        }}>
          Ringo.
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 30,
          color: 'rgba(240,232,216,0.6)',
          lineHeight: 1.45,
          maxWidth: 700,
          display: 'flex',
        }}>
          Your guests don't keep office hours.{' '}
          <span style={{ color: '#F26A1F', marginLeft: 8 }}>Now you don't have to either.</span>
        </div>

        {/* Domain */}
        <div style={{
          position: 'absolute',
          bottom: 56,
          right: 100,
          color: 'rgba(240,232,216,0.25)',
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: '0.04em',
          display: 'flex',
        }}>
          ringo.travel
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
