export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000/api/v1'

export async function fetchJSON(url:string, opts:RequestInit={}) {
  const res = await fetch(url, opts)
  if (!res.ok) throw new Error('Fetch error: ' + res.status)
  return res.json()
}
