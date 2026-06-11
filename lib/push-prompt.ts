/** Open the push notification subscribe modal (used by bell icon + auto-prompt). */
export const PUSH_PROMPT_OPEN = 'kaburlu:push-prompt-open'

export function openPushPrompt() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(PUSH_PROMPT_OPEN))
}
