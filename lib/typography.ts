/** CSS ::first-letter drop caps break Indic/complex scripts (Telugu matras show as ◌). */
export function supportsDropCap(lang?: string | null): boolean {
  const code = String(lang || 'te').trim().toLowerCase().split('-')[0]
  return code === 'en' || code === 'latin'
}
