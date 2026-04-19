/**
 * 🤖 Kaburlu AI Agent
 *
 * Autonomous agent that acts as a virtual employee managing the news platform.
 * Handles:
 *   — Article enhancement   (excerpt, highlights, SEO meta, reading time)
 *   — Backend health checks (detects outages, measures latency)
 *   — Smart caching         (remembers last-good state per tenant)
 *
 * Provider priority (set via env):
 *   OPENAI_API_KEY  → GPT-4o-mini  (fast, cheap, best quality)
 *   GEMINI_API_KEY  → Gemini Flash  (good free-tier)
 *   (neither set)   → Rule-based extraction  (no API cost, always works)
 *
 * AI features require: AI_AGENT_ENABLED=true in env
 * Rule-based features always run regardless of AI_AGENT_ENABLED.
 */

import type { Article } from '@/lib/data-sources'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentEnhancement {
  excerpt?: string
  highlights?: string[]
  seoTitle?: string
  seoDescription?: string
  readingTimeMin?: number
  source: 'original' | 'rule-based' | 'openai' | 'gemini'
}

export interface AgentHealthStatus {
  backend: 'healthy' | 'degraded' | 'down'
  lastChecked: string
  latencyMs?: number
  error?: string
}

export type AgentProvider = 'openai' | 'gemini' | 'rule-based'

export interface AgentStatus {
  agent: string
  status: 'active'
  aiEnabled: boolean
  provider: AgentProvider
  backend?: AgentHealthStatus
  timestamp: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Text helpers
// ─────────────────────────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

function getPlainText(article: Article): string {
  if (article.plainText && article.plainText.trim()) return article.plainText.trim()
  if (typeof article.contentHtml === 'string' && article.contentHtml) {
    return stripHtml(article.contentHtml)
  }
  if (typeof article.content === 'string' && article.content) {
    return article.content.startsWith('<')
      ? stripHtml(article.content)
      : article.content.trim()
  }
  return ''
}

/** Split text into meaningful sentences (works for Telugu + Latin scripts) */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?।॥\n])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25)
}

function calcReadingTime(text: string): number {
  // Average reading speed: 200 wpm for English, 150 wpm for Indian scripts
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 180))
}

// ─────────────────────────────────────────────────────────────────────────────
// Rule-based enhancement (zero cost, zero latency — always runs)
// ─────────────────────────────────────────────────────────────────────────────

function ruleBasedEnhance(article: Article): AgentEnhancement {
  const plainText = getPlainText(article)
  const sentences = splitSentences(plainText)
  const result: AgentEnhancement = { source: 'rule-based' }

  // ── Excerpt: first 2 sentences, max 240 chars ────────────────────────────
  if (!article.excerpt && sentences.length > 0) {
    const candidate = sentences.slice(0, 2).join(' ')
    result.excerpt =
      candidate.length > 240 ? candidate.slice(0, 237) + '…' : candidate
  }

  // ── Highlights: pick 3-4 most informative sentences ─────────────────────
  if (!article.highlights || article.highlights.length === 0) {
    // Only consider first 60% of article (lead content is most important)
    const pool = sentences.slice(0, Math.max(4, Math.ceil(sentences.length * 0.6)))

    // Score: prefer sentences with numbers, quotes, proper nouns, adequate length
    const scored = pool.map((s) => ({
      s,
      score:
        (s.match(/\d+/) ? 2 : 0) +
        (s.match(/["'""''«»]/) ? 1 : 0) +
        // Telugu/Kannada/Tamil capital-adjacent patterns + English proper nouns
        (s.match(/[A-Z][a-z]{2,}|[\u0C00-\u0C7F]{4,}/) ? 1 : 0) +
        (s.length > 80 && s.length < 180 ? 1 : 0),
    }))

    scored.sort((a, b) => b.score - a.score)
    const best = scored.slice(0, 4).map((x) => x.s)
    if (best.length > 0) result.highlights = best
  }

  // ── Reading time ─────────────────────────────────────────────────────────
  if (!article.readingTimeMin && plainText) {
    result.readingTimeMin = calcReadingTime(plainText)
  }

  // ── SEO meta ─────────────────────────────────────────────────────────────
  if (!article.meta?.seoTitle) {
    result.seoTitle = article.title
  }
  if (!article.meta?.metaDescription) {
    const base = result.excerpt ?? article.excerpt ?? plainText.slice(0, 200)
    result.seoDescription =
      base && base.length > 160 ? base.slice(0, 157) + '…' : base || undefined
  }

  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// OpenAI enhancement
// ─────────────────────────────────────────────────────────────────────────────

async function openaiEnhance(
  article: Article,
  lang: string,
): Promise<AgentEnhancement | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const plainText = getPlainText(article).slice(0, 3000)
  if (plainText.length < 80) return null

  const langNames: Record<string, string> = {
    te: 'Telugu', en: 'English', hi: 'Hindi', kn: 'Kannada', ta: 'Tamil',
  }
  const langName = langNames[lang] ?? 'Telugu'

  const prompt = `You are a senior news editor for a ${langName} digital news platform.

Article title: "${article.title}"
Article text: ${plainText}

Generate in ${langName} language:
1. excerpt — a compelling 1-2 sentence summary, max 200 characters
2. highlights — array of 3-4 key bullet points, each max 120 characters, no leading bullet symbol
3. seoDescription — SEO meta description, max 160 characters

Respond ONLY as valid JSON: {"excerpt":"...","highlights":["...","..."],"seoDescription":"..."}`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
      signal: AbortSignal.timeout(9000),
    })

    if (!res.ok) return null
    type OAIResponse = { choices?: Array<{ message?: { content?: string } }> }
    const data = (await res.json()) as OAIResponse
    const raw = data?.choices?.[0]?.message?.content
    if (!raw) return null

    type Parsed = { excerpt?: string; highlights?: string[]; seoDescription?: string }
    const parsed = JSON.parse(raw) as Parsed
    return {
      source: 'openai',
      excerpt: typeof parsed.excerpt === 'string' ? parsed.excerpt : undefined,
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : undefined,
      seoDescription: typeof parsed.seoDescription === 'string' ? parsed.seoDescription : undefined,
    }
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Gemini enhancement
// ─────────────────────────────────────────────────────────────────────────────

async function geminiEnhance(
  article: Article,
  lang: string,
): Promise<AgentEnhancement | null> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const plainText = getPlainText(article).slice(0, 3000)
  if (plainText.length < 80) return null

  const langNames: Record<string, string> = {
    te: 'Telugu', en: 'English', hi: 'Hindi', kn: 'Kannada', ta: 'Tamil',
  }
  const langName = langNames[lang] ?? 'Telugu'

  const prompt = `You are a senior news editor for a ${langName} digital news platform.

Article title: "${article.title}"
Article text: ${plainText}

Generate in ${langName} language:
1. excerpt — a compelling 1-2 sentence summary, max 200 characters
2. highlights — array of 3-4 key bullet points, each max 120 characters, no leading bullet symbol
3. seoDescription — SEO meta description, max 160 characters

Respond ONLY as valid JSON: {"excerpt":"...","highlights":["...","..."],"seoDescription":"..."}`

  const model = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash-latest'

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 400, temperature: 0.3 },
        }),
        signal: AbortSignal.timeout(9000),
      },
    )

    if (!res.ok) return null
    type GeminiResponse = {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    }
    const data = (await res.json()) as GeminiResponse
    const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!raw) return null

    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) return null

    type Parsed = { excerpt?: string; highlights?: string[]; seoDescription?: string }
    const parsed = JSON.parse(match[0]) as Parsed
    return {
      source: 'gemini',
      excerpt: typeof parsed.excerpt === 'string' ? parsed.excerpt : undefined,
      highlights: Array.isArray(parsed.highlights) ? parsed.highlights : undefined,
      seoDescription: typeof parsed.seoDescription === 'string' ? parsed.seoDescription : undefined,
    }
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// In-memory enhancement cache  (per article slug × lang, per process)
// ─────────────────────────────────────────────────────────────────────────────

type CacheEntry<T> = { value: T; expires: number }
const enhanceCache = new Map<string, CacheEntry<AgentEnhancement>>()
const ENHANCE_TTL_MS = 60 * 60 * 1000 // 1 hour

// ─────────────────────────────────────────────────────────────────────────────
// Main export: enhance article
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enhances an article with AI-generated or rule-extracted fields.
 * Only fills fields that are missing — never overwrites backend data.
 *
 * Usage:
 *   const rich = await agentEnhanceArticle(article, { lang: 'te' })
 *   // rich.excerpt, rich.highlights, rich.readingTimeMin are now guaranteed
 */
export async function agentEnhanceArticle(
  article: Article,
  opts?: { lang?: string; siteName?: string },
): Promise<Article> {
  const needsExcerpt = !article.excerpt
  const needsHighlights = !article.highlights || article.highlights.length === 0
  const needsMeta = !article.meta?.seoTitle || !article.meta?.metaDescription
  const needsReadingTime = !article.readingTimeMin

  // Nothing to do — article is already fully enriched
  if (!needsExcerpt && !needsHighlights && !needsMeta && !needsReadingTime) {
    return article
  }

  const lang = opts?.lang ?? 'te'
  const cacheKey = `${article.slug ?? article.id}:${lang}`
  const now = Date.now()
  const cached = enhanceCache.get(cacheKey)

  let enhancement: AgentEnhancement

  if (cached && cached.expires > now) {
    enhancement = cached.value
  } else {
    // Rule-based is always instant and zero-cost
    const rules = ruleBasedEnhance(article)

    // Try AI if enabled and key is available (non-blocking, falls back to rules)
    if (process.env.AI_AGENT_ENABLED === 'true') {
      const ai = process.env.OPENAI_API_KEY
        ? await openaiEnhance(article, lang).catch(() => null)
        : process.env.GEMINI_API_KEY
          ? await geminiEnhance(article, lang).catch(() => null)
          : null

      // Merge: AI result takes priority over rule-based where it has values
      enhancement = ai ? { ...rules, ...ai } : rules
    } else {
      enhancement = rules
    }

    enhanceCache.set(cacheKey, { value: enhancement, expires: now + ENHANCE_TTL_MS })
  }

  // Apply: only fill missing fields — never overwrite backend data
  return {
    ...article,
    excerpt: article.excerpt ?? enhancement.excerpt,
    highlights:
      article.highlights && article.highlights.length > 0
        ? article.highlights
        : enhancement.highlights,
    readingTimeMin: article.readingTimeMin ?? enhancement.readingTimeMin,
    meta: {
      ...article.meta,
      seoTitle: article.meta?.seoTitle ?? enhancement.seoTitle ?? article.title,
      metaDescription: article.meta?.metaDescription ?? enhancement.seoDescription,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Backend health monitoring
// ─────────────────────────────────────────────────────────────────────────────

const healthCache = new Map<string, CacheEntry<AgentHealthStatus>>()
const HEALTH_TTL_MS = 30 * 1000 // 30 seconds

/**
 * Pings the backend config API for a given tenant domain.
 * Returns health status with latency measurement.
 * Cached for 30 seconds to avoid hammering the backend.
 */
export async function checkBackendHealth(domain: string): Promise<AgentHealthStatus> {
  const now = Date.now()
  const cached = healthCache.get(domain)
  if (cached && cached.expires > now) return cached.value

  const apiBase =
    process.env.API_BASE_URL ?? 'https://api.kaburlumedia.com/api/v1'
  const start = Date.now()

  try {
    const res = await fetch(`${apiBase}/public/config`, {
      headers: { 'X-Tenant-Domain': domain, accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    })

    const latencyMs = Date.now() - start
    const status: AgentHealthStatus = {
      backend: res.ok ? (latencyMs > 3000 ? 'degraded' : 'healthy') : 'down',
      lastChecked: new Date().toISOString(),
      latencyMs,
      error: res.ok ? undefined : `HTTP ${res.status}`,
    }
    healthCache.set(domain, { value: status, expires: now + HEALTH_TTL_MS })
    return status
  } catch (err) {
    const status: AgentHealthStatus = {
      backend: 'down',
      lastChecked: new Date().toISOString(),
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : 'Network error',
    }
    healthCache.set(domain, { value: status, expires: now + HEALTH_TTL_MS })
    return status
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent status helper
// ─────────────────────────────────────────────────────────────────────────────

export function getActiveProvider(): AgentProvider {
  if (process.env.OPENAI_API_KEY) return 'openai'
  if (process.env.GEMINI_API_KEY) return 'gemini'
  return 'rule-based'
}

export function getAgentStatus(): Omit<AgentStatus, 'backend'> {
  return {
    agent: 'Kaburlu AI Agent v1',
    status: 'active',
    aiEnabled: process.env.AI_AGENT_ENABLED === 'true',
    provider: getActiveProvider(),
    timestamp: new Date().toISOString(),
  }
}
