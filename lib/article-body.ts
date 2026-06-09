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
    str(contentObj?.plainText) ||
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
    const raw = looksLikeHtml(contentCandidate)
      ? contentCandidate
      : textToParagraphHtml(contentCandidate)
    return stripLeadingH1(wrapLooseHtml(raw))
  }

  // Content blocks (structured CMS)
  const blocks = a.contentBlocks || contentObj?.blocks
  if (Array.isArray(blocks) && blocks.length > 0) {
    const html = blocks
      .map((block) => {
        if (!block || typeof block !== 'object') return ''
        const b = block as Record<string, unknown>
        const type = String(b.type || b.kind || '').toLowerCase()
        const text = str(b.text) || str(b.content) || str(b.value) || ''
        if (!text) return ''
        if (type === 'heading' || type === 'h2') return `<h2>${escapeHtml(text)}</h2>`
        return `<p>${escapeHtml(text).replace(/\n/g, '<br />')}</p>`
      })
      .filter(Boolean)
      .join('')
    if (html) return html
  }

  // Fallback: highlights → paragraphs (skip if already shown in insights box)
  const highlights = (article.highlights || []).filter(Boolean)
  if (!opts?.skipHighlightsFallback && highlights.length > 0) {
    return highlights.map((h) => `<p>${escapeHtml(h)}</p>`).join('')
  }

  // Fallback: excerpt / summary (skip if already shown in summary box)
  const excerpt = str(article.excerpt) || str(article.subtitle)
  if (!opts?.skipExcerptFallback && excerpt) return `<p>${escapeHtml(excerpt)}</p>`

  return ''
}
