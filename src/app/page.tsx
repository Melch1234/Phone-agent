import { LandingClient } from './LandingClient'

export default function Home() {
  return (
    <>
      <LandingClient />

      {/* NAV */}
      <nav id="nav">
        <a className="nav-logo" href="/">Tour <em>Agent</em></a>
        <ul className="nav-links" id="navLinks">
          <li><a href="#how">How it works</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#who">Who it&apos;s for</a></li>
          <li><a href="#pricing">Pricing</a></li>
          <li><a className="nav-pill" href="/onboard">Get Started</a></li>
        </ul>
        <button className="nav-burger" id="burger">Menu</button>
      </nav>

      {/* HERO */}
      <section id="hero">
        <div className="hero-sky"></div>
        <div className="stars" id="stars"></div>
        <div className="sun-orb"></div>
        <div className="sun-glow"></div>
        <div className="mountains" aria-hidden="true">
          <div className="mt mt-1"></div>
          <div className="mt mt-2"></div>
          <div className="mt mt-3"></div>
          <div className="mt mt-4"></div>
        </div>
        <div className="hero-fade"></div>

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            AI-Powered &middot; Always On &middot; Tourism-Ready
          </div>
          <h1 className="hero-h1">
            Never miss an<br />after-hours call <em>again.</em>
          </h1>
          <p className="hero-sub">
            An AI voice agent answers every after-hours call, captures bookings and enquiries, and delivers a structured morning briefing to your team. Built for adventure tour operators, whale watchers, and travel experiences of every kind.
          </p>
          <div className="hero-actions">
            <a href="/onboard" className="btn-primary">
              Get Started Free
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </a>
            <a href="#how" className="btn-ghost">
              See how it works
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v10M4 9l4 4 4-4" /></svg>
            </a>
          </div>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <div className="scroll-bar"></div>
          <span>Scroll</span>
        </div>
      </section>

      {/* RIDGE: hero → problem */}
      <svg className="ridge" viewBox="0 0 1440 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ background: 'var(--midnight)' }}>
        <path d="M0,56 L0,36 L60,14 L120,32 L180,8 L240,28 L300,10 L360,34 L420,6 L480,26 L540,12 L600,36 L660,8 L720,30 L780,16 L840,38 L900,10 L960,32 L1020,18 L1080,42 L1140,10 L1200,30 L1260,16 L1320,38 L1380,20 L1440,36 L1440,56 Z" fill="#0c2d3f" />
      </svg>

      {/* PROBLEM */}
      <section className="section" id="problem">
        <div className="wrap">
          <div className="problem-layout">
            <div className="rev">
              <p className="eyebrow">The Problem</p>
              <h2 className="problem-quote">
                Your tours end<br />at <em>sunset.</em><br />Your customers&apos;<br />questions don&apos;t.
              </h2>
            </div>
            <div className="stat-stack">
              <div className="stat-row rev" data-delay="80">
                <div className="stat-n">67%</div>
                <div className="stat-t">
                  <strong>of booking enquiries arrive after business hours</strong>
                  <p>Travellers research and decide when they&apos;re relaxed — evenings, weekends, and holidays.</p>
                </div>
              </div>
              <div className="stat-row rev" data-delay="160">
                <div className="stat-n">3×</div>
                <div className="stat-t">
                  <strong>more likely to book with the first operator who responds</strong>
                  <p>Speed-to-response is the single biggest driver of conversion in tourism.</p>
                </div>
              </div>
              <div className="stat-row rev" data-delay="240">
                <div className="stat-n">$0</div>
                <div className="stat-t">
                  <strong>earned on every missed after-hours call</strong>
                  <p>Every voicemail that goes unanswered is a booking that goes to your competitor.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pain-grid">
            <div className="pain-card rev" data-delay="0">
              <div className="pain-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015.2 16.9a19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
              </div>
              <h3>Calls go to voicemail</h3>
              <p>Staff clock off at 5pm. Excited travellers calling about tomorrow&apos;s tour hit a generic voicemail and move on to the next operator.</p>
            </div>
            <div className="pain-card rev" data-delay="100">
              <div className="pain-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              </div>
              <h3>Morning catch-up chaos</h3>
              <p>Your team arrives to a flood of missed calls and half-formed enquiries, spending the first two hours just figuring out who needs what.</p>
            </div>
            <div className="pain-card rev" data-delay="200">
              <div className="pain-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
              </div>
              <h3>No safety net for urgency</h3>
              <p>A guest stranded at the trailhead, a last-minute group cancellation — urgent calls after hours have no path to a real response until morning.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RIDGE: problem → how */}
      <svg className="ridge" viewBox="0 0 1440 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ background: '#0c2d3f' }}>
        <path d="M0,56 L0,42 L80,18 L160,36 L240,12 L320,34 L400,16 L480,40 L560,8 L640,28 L720,14 L800,36 L880,10 L960,30 L1040,18 L1120,40 L1200,14 L1280,34 L1360,20 L1440,36 L1440,56 Z" fill="#1c1206" />
      </svg>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="wrap">
          <div className="how-top">
            <div className="rev">
              <p className="eyebrow">How it works</p>
              <h2 className="section-h2">Set up in a morning.<br />Running <em>tonight.</em></h2>
            </div>
            <p className="section-sub rev" data-delay="120">
              No complex integrations. No IT department. Forward your existing number, paste in your tour FAQ, and let the agent handle every after-hours call from tonight.
            </p>
          </div>
          <div className="steps">
            <div className="step rev" data-delay="0">
              <div className="step-num">01</div>
              <div className="step-icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14" /></svg>
              </div>
              <h3>Call arrives</h3>
              <p>A traveller calls your number after hours. Instead of voicemail, they&apos;re instantly connected to your AI agent — which sounds like a knowledgeable, friendly local.</p>
            </div>
            <div className="step rev" data-delay="120">
              <div className="step-num">02</div>
              <div className="step-icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
              </div>
              <h3>AI handles everything</h3>
              <p>It answers tour questions, captures names and party sizes, notes special requests, and flags anything urgent for immediate SMS escalation.</p>
            </div>
            <div className="step rev" data-delay="240">
              <div className="step-num">03</div>
              <div className="step-icon">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
              </div>
              <h3>You wake up ready</h3>
              <p>Before your team arrives, a structured briefing email lands in your inbox — every call summarised, every lead flagged, every urgency highlighted.</p>
            </div>
          </div>
        </div>
      </section>

      {/* RIDGE: how → features */}
      <svg className="ridge" viewBox="0 0 1440 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ background: '#1c1206' }}>
        <path d="M0,56 L0,36 L60,52 L120,24 L180,46 L240,16 L300,40 L360,14 L420,36 L480,20 L540,44 L600,12 L660,36 L720,24 L780,48 L840,18 L900,40 L960,18 L1020,44 L1080,14 L1140,38 L1200,20 L1260,46 L1320,24 L1380,44 L1440,28 L1440,56 Z" fill="#0d2a1a" />
      </svg>

      {/* FEATURES */}
      <section className="section" id="features">
        <div className="wrap">
          <div className="feat-layout">
            <div className="feat-intro rev">
              <p className="eyebrow">Features</p>
              <h2 className="section-h2">Built for the<br /><em>outdoors</em> business</h2>
              <p className="section-sub" style={{ margin: '1rem 0 2rem' }}>
                Tourism isn&apos;t a 9-to-5 industry. Your AI agent isn&apos;t either. Every feature is designed around the realities of running tours, experiences, and outdoor adventures.
              </p>
              <a href="/onboard" className="btn-primary" style={{ display: 'inline-flex' }}>
                Get set up today
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
              </a>
            </div>
            <div className="feat-grid">
              <div className="feat-card rev" data-delay="40">
                <div className="feat-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 015.2 16.9a19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg></div>
                <h4>24/7 Live Voice Agent</h4>
                <p>Natural, conversational AI that sounds human. Always on, never tired.</p>
              </div>
              <div className="feat-card rev" data-delay="90">
                <div className="feat-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg></div>
                <h4>Morning Briefing Emails</h4>
                <p>Every call summarised and delivered before your team starts the day.</p>
              </div>
              <div className="feat-card rev" data-delay="140">
                <div className="feat-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg></div>
                <h4>Urgent SMS Escalation</h4>
                <p>Real emergencies trigger an immediate SMS to your on-call phone — no delays.</p>
              </div>
              <div className="feat-card rev" data-delay="190">
                <div className="feat-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg></div>
                <h4>Tour FAQ Engine</h4>
                <p>Trains on your tour details, pricing, policies, and meeting points in minutes.</p>
              </div>
              <div className="feat-card rev" data-delay="240">
                <div className="feat-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg></div>
                <h4>Lead Capture</h4>
                <p>Names, group sizes, dates, special requests — all captured automatically.</p>
              </div>
              <div className="feat-card rev" data-delay="290">
                <div className="feat-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg></div>
                <h4>White-Labelled</h4>
                <p>Sounds like part of your team. Custom greetings, your name, your tone.</p>
              </div>
              <div className="feat-card rev" data-delay="340">
                <div className="feat-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg></div>
                <h4>Multi-Tour Support</h4>
                <p>Handles multiple tours, departure times, and seasonal pricing in one agent.</p>
              </div>
              <div className="feat-card rev" data-delay="390">
                <div className="feat-icon"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg></div>
                <h4>Any Number</h4>
                <p>Landlines, mobiles, Twilio — forward your line or get a new dedicated number.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIDGE: features → who */}
      <svg className="ridge" viewBox="0 0 1440 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ background: '#0d2a1a' }}>
        <path d="M0,56 L0,48 L80,32 L160,50 L240,26 L320,46 L400,20 L480,44 L560,16 L640,38 L720,24 L800,46 L880,14 L960,36 L1040,20 L1120,46 L1200,26 L1280,48 L1360,28 L1440,44 L1440,56 Z" fill="#f5ece0" />
      </svg>

      {/* WHO IT'S FOR */}
      <section className="section" id="who">
        <div className="wrap">
          <div className="rev">
            <p className="eyebrow">Who It&apos;s For</p>
            <h2 className="section-h2" style={{ color: 'var(--midnight)' }}>Built for every kind<br />of <em>adventure</em></h2>
            <p className="section-sub">
              Whether your guests are conquering peaks, exploring reefs, or discovering culture — your AI agent is ready to take their call.
            </p>
          </div>
          <div className="industry-grid">
            <div className="ind-card rev" data-delay="0">
              <div className="ind-bg bg-mountain"></div>
              <div className="ind-overlay"></div>
              <div className="ind-body">
                <div className="ind-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 17l6-8 4 5 3-4 5 7" /></svg></div>
                <h3>Mountain &amp; Hiking Tours</h3>
                <p>Altitude, difficulty, what-to-bring, weather policies</p>
              </div>
            </div>
            <div className="ind-card rev" data-delay="70">
              <div className="ind-bg bg-ocean"></div>
              <div className="ind-overlay"></div>
              <div className="ind-body">
                <div className="ind-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 12C2 12 5 5 12 5s10 7 10 7-3 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg></div>
                <h3>Whale Watching &amp; Marine</h3>
                <p>Season info, sighting rates, seasickness queries</p>
              </div>
            </div>
            <div className="ind-card rev" data-delay="140">
              <div className="ind-bg bg-desert"></div>
              <div className="ind-overlay"></div>
              <div className="ind-body">
                <div className="ind-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" /></svg></div>
                <h3>Safari &amp; Desert Tours</h3>
                <p>Wildlife schedules, packing lists, guide experience</p>
              </div>
            </div>
            <div className="ind-card rev" data-delay="0">
              <div className="ind-bg bg-water"></div>
              <div className="ind-overlay"></div>
              <div className="ind-body">
                <div className="ind-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 12h4l3-9 4 18 3-9h6" /></svg></div>
                <h3>Kayaking &amp; Water Sports</h3>
                <p>Water conditions, skill levels, equipment hire</p>
              </div>
            </div>
            <div className="ind-card rev" data-delay="70">
              <div className="ind-bg bg-forest"></div>
              <div className="ind-overlay"></div>
              <div className="ind-body">
                <div className="ind-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg></div>
                <h3>Rainforest &amp; Wildlife</h3>
                <p>Birdwatching seasons, guided vs self-guided, access</p>
              </div>
            </div>
            <div className="ind-card rev" data-delay="140">
              <div className="ind-bg bg-canyon"></div>
              <div className="ind-overlay"></div>
              <div className="ind-body">
                <div className="ind-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polygon points="12 2 2 22 22 22" /></svg></div>
                <h3>Zip-line &amp; Adventure Parks</h3>
                <p>Age limits, group bookings, weather cancellation</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIDGE: who → stats */}
      <svg className="ridge" viewBox="0 0 1440 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ background: '#f5ece0' }}>
        <path d="M0,56 L0,40 L60,20 L120,44 L180,14 L240,38 L300,18 L360,42 L420,10 L480,36 L540,22 L600,48 L660,8 L720,32 L780,18 L840,44 L900,16 L960,38 L1020,26 L1080,48 L1140,14 L1200,36 L1260,20 L1320,46 L1380,26 L1440,42 L1440,56 Z" fill="var(--midnight)" />
      </svg>

      {/* STATS */}
      <section id="stats">
        <div className="wrap">
          <div className="stats-grid">
            <div className="stat-big rev" data-delay="0">
              <div className="stat-big-n">24/7</div>
              <div className="stat-big-l">Always available<br />never voicemail</div>
            </div>
            <div className="stat-big rev" data-delay="100">
              <div className="stat-big-n">&lt; 2s</div>
              <div className="stat-big-l">Time to first<br />spoken response</div>
            </div>
            <div className="stat-big rev" data-delay="200">
              <div className="stat-big-n">100%</div>
              <div className="stat-big-l">Calls answered<br />no matter when</div>
            </div>
            <div className="stat-big rev" data-delay="300">
              <div className="stat-big-n">1 day</div>
              <div className="stat-big-l">Average time<br />to go live</div>
            </div>
          </div>
        </div>
      </section>

      {/* RIDGE: stats → pricing */}
      <svg className="ridge" viewBox="0 0 1440 56" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style={{ background: 'var(--midnight)' }}>
        <path d="M0,56 L0,36 L80,14 L160,38 L240,16 L320,40 L400,10 L480,34 L560,20 L640,46 L720,16 L800,38 L880,24 L960,48 L1040,18 L1120,40 L1200,16 L1280,38 L1360,24 L1440,44 L1440,56 Z" fill="#070512" />
      </svg>

      {/* PRICING */}
      <section className="section" id="pricing">
        <div className="wrap">
          <div className="pricing-head rev">
            <p className="eyebrow">Pricing</p>
            <h2 className="section-h2">Simple pricing,<br />serious <em>results</em></h2>
            <p style={{ opacity: '.55', marginTop: '.6rem', fontSize: '.95rem' }}>No contracts. Cancel any time.</p>
          </div>
          <div className="pricing-grid">
            <div className="p-card rev" data-delay="0">
              <p className="p-tier">Starter</p>
              <p className="p-name">Solo Operator</p>
              <div className="p-price"><p className="p-amt"><sup>$</sup>97</p><p className="p-per">per month</p></div>
              <ul className="p-feats">
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Up to 200 calls / month</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>1 tour profile / FAQ</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Daily email briefing</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Urgent SMS alerts</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Email support</li>
              </ul>
              <a href="/onboard" className="p-cta border">Get started</a>
            </div>

            <div className="p-card featured rev" data-delay="120">
              <div className="feat-badge">Most Popular</div>
              <p className="p-tier">Growth</p>
              <p className="p-name">Tour Operator</p>
              <div className="p-price"><p className="p-amt"><sup>$</sup>197</p><p className="p-per">per month</p></div>
              <ul className="p-feats">
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Up to 600 calls / month</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>5 tour profiles / FAQs</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Real-time call summaries</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Multi-language support</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Priority support</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Custom agent voice &amp; tone</li>
              </ul>
              <a href="/onboard" className="p-cta solid">Get started</a>
            </div>

            <div className="p-card rev" data-delay="240">
              <p className="p-tier">Agency</p>
              <p className="p-name">Multi-Operator</p>
              <div className="p-price"><p className="p-amt"><sup>$</sup>397</p><p className="p-per">per month</p></div>
              <ul className="p-feats">
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Unlimited calls</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Unlimited tour profiles</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Up to 10 client accounts</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>White-label dashboard</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>API access</li>
                <li><span className="chk"><svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="2,6 5,9 10,3" /></svg></span>Dedicated account manager</li>
              </ul>
              <a href="/onboard" className="p-cta border">Get started</a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta">
        <div className="cta-sky"></div>
        <div className="cta-mts" aria-hidden="true">
          <div className="cta-m1"></div>
          <div className="cta-m2"></div>
        </div>
        <div className="cta-content rev">
          <p className="eyebrow">Ready to start?</p>
          <h2 className="cta-h2">Your next booking<br />is calling <em>tonight.</em></h2>
          <p className="cta-sub">Set up your AI agent this afternoon. By tonight, you&apos;ll never miss an after-hours call again.</p>
          <div className="hero-actions">
            <a href="/onboard" className="btn-primary">
              Start Your Free Setup
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3>Tour <em>Agent</em></h3>
              <p>AI-powered after-hours call handling for tourism and adventure operators. Never miss a booking enquiry again.</p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#how">How it works</a></li>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="/onboard">Get started</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Adventures</h4>
              <ul>
                <li><a href="#who">Mountain Tours</a></li>
                <li><a href="#who">Marine &amp; Whale Watching</a></li>
                <li><a href="#who">Water Sports</a></li>
                <li><a href="#who">Safari &amp; Wildlife</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Contact</a></li>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-base">
            <span>&copy; 2026 Tour Agent. All rights reserved.</span>
            <span>Built on Twilio + OpenAI</span>
          </div>
        </div>
      </footer>
    </>
  )
}
