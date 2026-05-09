import { describe, it, expect } from 'vitest'
import { containsUrgency } from '../src/lib/urgency'

describe('containsUrgency', () => {
  it('detects emergency keyword', () => {
    expect(containsUrgency('this is an emergency')).toBe(true)
  })
  it('detects stranded keyword', () => {
    expect(containsUrgency("we're stranded at the trailhead")).toBe(true)
  })
  it('detects injured keyword', () => {
    expect(containsUrgency('someone is injured')).toBe(true)
  })
  it('is case-insensitive', () => {
    expect(containsUrgency('EMERGENCY')).toBe(true)
  })
  it('returns false for normal booking queries', () => {
    expect(containsUrgency('hi, i want to book the 3-day hike for july 12')).toBe(false)
  })
  it('returns false for empty string', () => {
    expect(containsUrgency('')).toBe(false)
  })
})
