'use client'

import { useRef, useState, useEffect } from 'react'

interface Line {
  speaker: 'caller' | 'agent'
  text: string
  startTime: number
}

// startTime values are placeholders — update after running scripts/generate-demo-audio.ts
const TRANSCRIPT: Line[] = [
  { speaker: 'caller', text: "Hi, I'm trying to book a whale watching tour for this Saturday — I called earlier but no one picked up.", startTime: 0 },
  { speaker: 'agent',  text: "Hey there! You've reached Island Adventures after hours. I'm the AI assistant — happy to help. Saturday whale watching, got it. How many people will be joining?", startTime: 0 },
  { speaker: 'caller', text: "Just two of us, me and my wife.", startTime: 0 },
  { speaker: 'agent',  text: "Perfect. Can I grab your name and a good number so the team can confirm your spot first thing tomorrow morning?", startTime: 0 },
  { speaker: 'caller', text: "Sure — Mike Thompson, 555-234-7890.", startTime: 0 },
  { speaker: 'agent',  text: "Got it, Mike. I've noted two guests for Saturday. Someone will call you back before 9 AM to confirm availability and take payment. Anything else tonight?", startTime: 0 },
  { speaker: 'caller', text: "No, that's great. Thanks.", startTime: 0 },
  { speaker: 'agent',  text: "Enjoy your evening, Mike. We'll be in touch tomorrow.", startTime: 0 },
]

function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

export default function DemoPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying]         = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]       = useState(0)
  const [activeLine, setActiveLine]   = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onTime = () => {
      setCurrentTime(audio.currentTime)
      let idx = 0
      for (let i = 0; i < TRANSCRIPT.length; i++) {
        if (audio.currentTime >= TRANSCRIPT[i].startTime) idx = i
      }
      setActiveLine(idx)
    }
    const onMeta  = () => setDuration(audio.duration)
    const onEnded = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause() } else { audio.play() }
    setPlaying(p => !p)
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  const activeSpeaker = TRANSCRIPT[activeLine]?.speaker

  return (
    <div className="v2-demo-card">
      <audio ref={audioRef} src="/demo-call.wav" preload="metadata" />

      <div className="v2-demo-speakers">
        <span className={`v2-demo-chip${activeSpeaker === 'caller' ? ' v2-demo-chip--active' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>
          Caller
        </span>
        <span className="v2-demo-chip-divider">·</span>
        <span className={`v2-demo-chip${activeSpeaker === 'agent' ? ' v2-demo-chip--active' : ''}`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
          AI Agent
        </span>
      </div>

      <div className="v2-demo-controls">
        <button className="v2-demo-play" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          {playing ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <div className="v2-demo-progress" onClick={seek} role="slider" aria-label="Seek">
          <div className="v2-demo-progress-fill" style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }} />
        </div>
        <span className="v2-demo-time">{fmt(currentTime)} / {fmt(duration)}</span>
      </div>

      <div className="v2-demo-transcript">
        {TRANSCRIPT.map((line, i) => (
          <div key={i} className={`v2-demo-line${i === activeLine && (playing || currentTime > 0) ? ' v2-demo-line--active' : ' v2-demo-line--inactive'}`}>
            <span className="v2-demo-line-label">{line.speaker === 'caller' ? 'Caller' : 'AI Agent'}</span>
            <span className="v2-demo-line-text">{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
