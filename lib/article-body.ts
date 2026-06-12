/**
 * Resolve article body HTML from various backend field shapes.
 */
import type { Article } from '@/lib/data-sources'

function str(v: unknown): string | undefined {
  const s = typeof v === 'string' ? v.trim() : ''
  return s || undefined
}

function obj(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : undefined
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function looksLikeHtml(s: string): boolean {
  return /<\s*([a-z][\w:-]*)\b/i.test(s)
}

function textToParagraphHtml(text: string): string {
  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) return ''
  return normalized
    .split(/\n\s*\n+/g)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
    .join('')
}

function wrapLooseHtml(html: string): string {
  if (/<\s*\/\s*p\s*>/i.test(html)) return html
  if (looksLikeHtml(html)) return `<div class="article-paragraph">${html}</div>`
  return `<p>${escapeHtml(html)}</p>`
}

function stripLeadingH1(html: string): string {
  return html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '')
}

/** Kaburlu API blocks: { subhead?, paragraphs: string[] } */
function blocksToArticleHtml(blocks: unknown): string | undefined {
  if (!Array.isArray(blocks) || blocks.length === 0) return undefined

  const out: string[] = []
  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue
    const b = block as Record<string, unknown>

    const subhead = str(b.subhead)
    if (subhead) out.push(`<h2>${escapeHtml(subhead)}</h2>`)

    const paras = Array.isArray(b.paragraphs) ? b.paragraphs : []
    for (const p of paras) {
      if (typeof p !== 'string') continue
      const t = p.trim()
      if (t) out.push(`<p>${escapeHtml(t).replace(/\n/g, '<br />')}</p>`)
    }

    // Legacy simple block format
    const type = String(b.type || b.kind || '').toLowerCase()
    const text = str(b.text) || str(b.content) || str(b.value) || ''
    if (text && paras.length === 0) {
      if (type === 'heading' || type === 'h2') out.push(`<h2>${escapeHtml(text)}</h2>`)
      else out.push(`<p>${escapeHtml(text).replace(/\n/g, '<br />')}</p>`)
    }
  }

  return out.length > 0 ? out.join('') : undefined
}

function normalizePrimaryHtml(raw: string): string {
  const html = looksLikeHtml(raw) ? raw : textToParagraphHtml(raw)
  return stripLeadingH1(wrapLooseHtml(html)).trim()
}

/** Extract full article body from any supported backend shape */
export function resolveArticleBodyHtml(
  article: Article,
  opts?: { skipExcerptFallback?: boolean; skipHighlightsFallback?: boolean },
): string {
  const a = article as Record<string, unknown>
  const contentObj = obj(a.content) || obj(a.contentData)

  const contentCandidate =
    str(a.content_html) ||
    str(a.contentHtml) ||
    str(a.body_html) ||
    str(a.bodyHtml) ||
    str(a.description_html) ||
    str(a.descriptionHtml) ||
    str(a.html) ||
    (typeof a.content === 'string' ? str(a.content) : undefined) ||
    str(a.body) ||
    str(contentObj?.content_html) ||
    str(contentObj?.contentHtml) ||
    str(contentObj?.contentHTML) ||
    str(contentObj?.html) ||
    str(contentObj?.rendered) ||
    str(contentObj?.value) ||
    str(obj(a.body)?.html) ||
    str(obj(a.body)?.rendered) ||
    str(article.plainText) ||
    (Array.isArray(a.paragraphs)
      ? (a.paragraphs as unknown[])
          .filter((p) => typeof p === 'string')
          .map((p) => `<p>${escapeHtml(String(p))}</p>`)
          .join('')
      : undefined)

  if (contentCandidate) {
    const primary = normalizePrimaryHtml(contentCandidate)
    if (primary) return primary
  }

  const blocks = a.contentBlocks || contentObj?.blocks
  const blocksHtml = blocksToArticleHtml(blocks)
  if (blocksHtml) {
    const primary = stripLeadingH1(blocksHtml).trim()
    if (primary) return primary
  }

  const plainFromContent = str(contentObj?.plainText)
  if (plainFromContent) {
    const primary = normalizePrimaryHtml(plainFromContent)
    if (primary) return primary
  }

  const highlights = (article.highlights || []).filter(Boolean)
  const excerpt = str(article.excerpt) || str(article.subtitle)
  const plainText = str(article.plainText)

  // Preferred fallbacks (respect skip flags when insights boxes already show these)
  if (!opts?.skipHighlightsFallback && highlights.length > 0) {
    return highlights.map((h) => `<p>${escapeHtml(h)}</p>`).join('')
  }
  if (!opts?.skipExcerptFallback && excerpt) {
    return `<p>${escapeHtml(excerpt)}</p>`
  }

  // Last resort: never leave article body empty when any text exists
  if (highlights.length > 0) {
    return highlights.map((h) => `<p>${escapeHtml(h)}</p>`).join('')
  }
  if (excerpt) return `<p>${escapeHtml(excerpt)}</p>`
  if (plainText) return normalizePrimaryHtml(plainText)

  return ''
}
