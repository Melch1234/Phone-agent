const URGENCY_KEYWORDS = [
  'emergency', 'stranded', 'injured', 'injury',
  'accident', 'stuck', 'hurt', 'help me', 'urgent',
  'dangerous', 'lost', 'trapped', 'rescue',
]

export function containsUrgency(text: string): boolean {
  const lower = text.toLowerCase()
  return URGENCY_KEYWORDS.some(kw => lower.includes(kw))
}
