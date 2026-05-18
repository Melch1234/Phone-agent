import { ImageResponse } from 'next/og'
import { OG_BG } from '../lib/og-bg'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <img
          src={OG_BG}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(4,13,31,0.95) 0%, rgba(4,13,31,0.55) 100%)', display: 'flex' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', padding: '80px 100px', width: '100%', height: '100%' }}>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(242,106,31,0.15)',
            border: '1px solid rgba(242,106,31,0.4)',
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

          <div style={{
            fontSize: 30,
            color: 'rgba(240,232,216,0.75)',
            lineHeight: 1.45,
            maxWidth: 620,
            display: 'flex',
          }}>
            Your guests don't keep office hours.{' '}
            <span style={{ color: '#F26A1F', marginLeft: 8 }}>Now you don't have to either.</span>
          </div>

          <div style={{
            position: 'absolute',
            bottom: 56,
            left: 100,
            color: 'rgba(240,232,216,0.35)',
            fontSize: 20,
            fontWeight: 500,
            letterSpacing: '0.04em',
            display: 'flex',
          }}>
            ringo.travel
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
