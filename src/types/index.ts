export interface Operator {
  id: string
  business_name: string
  owner_name: string
  email: string
  alert_phone: string
  twilio_number: string | null
  greeting: string | null
  faq: string
  active: boolean
  plan: 'starter' | 'growth' | 'agency'
  dashboard_token: string
  created_at: string
}

export interface Lead {
  name: string
  party_size: number | null
  tour_date: string | null
  notes: string | null
}

export interface Call {
  id: string
  operator_id: string
  caller_number: string
  duration_seconds: number
  transcript: string
  summary: string
  urgent: boolean
  leads: Lead[]
  created_at: string
}

export interface OnboardPayload {
  business_name: string
  owner_name: string
  tour_types: string[]
  location: string
  faq: string
  email: string
  alert_phone: string
  greeting: string
}

export interface CallSummary {
  summary: string
  leads: Lead[]
}
