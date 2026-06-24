/** Kaburlu Today contact details (matches Play Store listing) */
export const KABURLU_TODAY_PHONE_DISPLAY = '+91 9118191991'
export const KABURLU_TODAY_PHONE_TEL = '+919118191991'
export const KABURLU_TODAY_EDITORIAL_EMAIL = 'contact@kaburlutoday.com'

/**
 * Patch backend contact-us HTML with phone and editorial details.
 * Safe to run on already-patched content (idempotent).
 */
export function enhanceContactUsHtml(html: string): string {
  let out = html

  out = out.replace(
    /<h2>Phone<\/h2>\s*<p>Our phone number is currently not specified\. Please use email for the fastest response\.<\/p>/i,
    `<h2>Phone</h2>\n<p><a href="tel:${KABURLU_TODAY_PHONE_TEL}">${KABURLU_TODAY_PHONE_DISPLAY}</a></p>`,
  )

  if (!/Editorial Team[\s\S]*?9118191991/i.test(out)) {
    out = out.replace(
      /<h2>Editorial Team<\/h2>\s*<p>If you would like to contact our newsroom, please send your messages to:<\/p>\s*<p><a href="mailto:contact@kaburlutoday\.com">contact@kaburlutoday\.com<\/a><\/p>/i,
      `<h2>Editorial Team</h2>\n<p>If you would like to contact our newsroom, please send your messages to:</p>\n<p><strong>Phone:</strong> <a href="tel:${KABURLU_TODAY_PHONE_TEL}">${KABURLU_TODAY_PHONE_DISPLAY}</a><br><strong>Email:</strong> <a href="mailto:${KABURLU_TODAY_EDITORIAL_EMAIL}">${KABURLU_TODAY_EDITORIAL_EMAIL}</a></p>`,
    )
  }

  return out
}
