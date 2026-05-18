import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  const imgBuffer = readFileSync(join(process.cwd(), 'public', 'og-bg.jpg'))
  const imgData = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`

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
        {/* Background photo */}
        <img
          src={imgData}
          alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Dark overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(4,13,31,0.88) 0%, rgba(4,13,31,0.65) 100%)', display: 'flex' }} />

        {/* Content */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 100px', width: '100%', height: '100%' }}>

          {/* Badge */}
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
            color: 'rgba(240,232,216,0.75)',
            lineHeight: 1.45,
            maxWidth: 620,
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
