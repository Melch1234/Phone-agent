import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest) {
  const bgData = fs.readFileSync(path.join(process.cwd(), 'public', 'og-bg.jpg'))
  const bgSrc = `data:image/jpeg;base64,${bgData.toString('base64')}`

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
        <img alt="" src={bgSrc} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to left, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.15) 100%)', display: 'flex' }} />

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
            color: '#0a0a0a',
            letterSpacing: '-0.04em',
            lineHeight: 1,
            marginBottom: 28,
          }}>
            Ringo.
          </div>

          <div style={{
            fontSize: 30,
            color: 'rgba(10,10,10,0.7)',
            lineHeight: 1.45,
            maxWidth: 620,
            display: 'flex',
          }}>
            Your guests don't keep office hours.{' '}
            <span style={{ color: '#0a0a0a', marginLeft: 8 }}>Now you don't have to either.</span>
          </div>

          <div style={{
            position: 'absolute',
            bottom: 56,
            left: 100,
            color: 'rgba(10,10,10,0.35)',
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
