'use client'
import { useEffect } from 'react'

export function LandingClient() {
  useEffect(() => {
    // Stars
    const starsCt = document.getElementById('stars')
    if (starsCt) {
      for (let i = 0; i < 130; i++) {
        const s = document.createElement('div')
        s.className = 'star'
        const sz = (Math.random() * 2.2 + 0.4).toFixed(1)
        const x = (Math.random() * 100).toFixed(1)
        const y = (Math.random() * 58).toFixed(1)
        const dur = (Math.random() * 3 + 2).toFixed(1)
        const dly = (Math.random() * 5).toFixed(1)
        const lo = (Math.random() * 0.15 + 0.05).toFixed(2)
        const hi = (Math.random() * 0.5 + 0.35).toFixed(2)
        s.style.cssText = `width:${sz}px;height:${sz}px;left:${x}%;top:${y}%;--dur:${dur}s;--dly:${dly}s;--lo:${lo};--hi:${hi}`
        starsCt.appendChild(s)
      }
    }

    // Nav scroll
    const nav = document.getElementById('nav')
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })

    // Scroll reveal
    const revEls = document.querySelectorAll('.rev')
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = parseInt((e.target as HTMLElement).dataset.delay || '0')
          setTimeout(() => e.target.classList.add('on'), delay)
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
    revEls.forEach(el => io.observe(el))

    // Mobile nav
    const burger = document.getElementById('burger')
    const navLinks = document.getElementById('navLinks')
    const handleBurger = () => {
      const open = navLinks?.classList.toggle('open')
      if (burger) burger.textContent = open ? 'Close' : 'Menu'
    }
    burger?.addEventListener('click', handleBurger)
    navLinks?.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open')
        if (burger) burger.textContent = 'Menu'
      })
    })

    // Parallax
    const handleParallax = () => {
      const y = window.scrollY
      document.querySelectorAll('#hero .mt').forEach((el, i) => {
        ;(el as HTMLElement).style.transform = `translateY(${y * 0.025 * (i + 1)}px)`
      })
    }
    window.addEventListener('scroll', handleParallax, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', handleParallax)
      burger?.removeEventListener('click', handleBurger)
    }
  }, [])

  return null
}
