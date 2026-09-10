import type { Article } from '@/lib/data-sources'

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Best available card/list excerpt — never returns placeholder text. */
export function getArticleExcerpt(article: Article, maxLen = 160): string | null {
  const record = article as Record<string, unknown>
  const raw =
    article.excerpt ||
    article.seo?.metaDescription ||
    article.meta?.metaDescription ||
    (typeof record.summary === 'string' ? record.summary : null) ||
    (typeof record.description === 'string' ? record.description : null) ||
    article.plainText ||
    null

  if (!raw || typeof raw !== 'string') return null
  const text = stripHtml(raw).trim()
  if (!text) return null
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text
}
