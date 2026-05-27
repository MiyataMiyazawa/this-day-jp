export interface DayCard {
  date: string
  year: number
  title: string
  subtitle: string
  body: string
  tags: [string, string, string]
  wow: string
  source_title: string
}

const API_URL = import.meta.env.DEV
  ? '/api/today'
  : 'https://this-day-jp.vercel.app/api/today'

export async function fetchDayCard(): Promise<DayCard> {
  const res = await fetch(API_URL)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
