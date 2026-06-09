import { buildFaqFromArticle } from '@/lib/aeo'
import type { Article } from '@/lib/data-sources'

const LABELS: Record<string, { tldr: string; keyFacts: string; faq: string }> = {
  te: { tldr: 'సంక్షిప్త సారాంశం', keyFacts: 'ముఖ్య విషయాలు', faq: 'తరచుగా అడిగే ప్రశ్నలు' },
  en: { tldr: 'Quick Summary', keyFacts: 'Key Facts', faq: 'Frequently Asked Questions' },
  hi: { tldr: 'संक्षिप्त सारांश', keyFacts: 'मुख्य तथ्य', faq: 'अक्सर पूछे जाने वाले प्रश्न' },
  ta: { tldr: 'சுருக்கம்', keyFacts: 'முக்கிய உண்மைகள்', faq: 'அடிக்கடி கேட்கப்படும் கேள்விகள்' },
  kn: { tldr: 'ಸಂಕ್ಷಿಪ್ತ ಸಾರಾಂಶ', keyFacts: 'ಮುಖ್ಯ ವಿಷಯಗಳು', faq: 'ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು' },
}

function normalizeLang(lang?: string): string {
  const raw = String(lang || 'te').trim().toLowerCase()
  if (raw === 'telugu') return 'te'
  return raw.split('-')[0] || 'te'
}

export interface AeoContentBlocksProps {
  article: Article
  lang?: string
  variant?: 'default' | 'compact'
  /** Which blocks to render — default: all available */
  sections?: Array<'tldr' | 'facts' | 'faq'>
  /** Collapse FAQ items into accordion (better on mobile) */
  faqAccordion?: boolean
  /** Skip duplicate summary FAQ when summary block is already visible */
  skipSummaryQuestion?: boolean
}

/**
 * Visible AEO content blocks for answer engines and readers:
 * TL;DR summary, key facts, FAQ accordion
 */
export function AeoContentBlocks({
  article,
  lang = 'te',
  variant = 'default',
  sections = ['tldr', 'facts', 'faq'],
  faqAccordion = false,
  skipSummaryQuestion = false,
}: AeoContentBlocksProps) {
  const l = LABELS[normalizeLang(lang)] || LABELS.te
  const faqItems = buildFaqFromArticle(article, lang, { skipSummaryQuestion })
  const show = (s: 'tldr' | 'facts' | 'faq') => sections.includes(s)
  const hasTldr = show('tldr') && Boolean(article.excerpt?.trim())
  const hasFacts = show('facts') && Boolean(article.highlights?.length)
  const hasFaq = show('faq') && faqItems.length > 0

  if (!hasTldr && !hasFacts && !hasFaq) return null

  const compact = variant === 'compact'

  return (
    <aside className="aeo-blocks" aria-label="Article summary and key information">
      {hasTldr && (
        <div className={`aeo-tldr ${compact ? 'aeo-tldr--compact' : ''}`}>
          <h2 className="aeo-block-title">{l.tldr}</h2>
          <p className="aeo-tldr-text">{article.excerpt}</p>
        </div>
      )}

      {hasFacts && (
        <div className={`aeo-key-facts ${compact ? 'aeo-key-facts--compact' : ''}`}>
          <h2 className="aeo-block-title">{l.keyFacts}</h2>
          <ul className="aeo-facts-list">
            {article.highlights!.map((fact, i) => (
              <li key={i}>{fact}</li>
            ))}
          </ul>
        </div>
      )}

      {hasFaq && (
        <div className={`aeo-faq ${compact ? 'aeo-faq--compact' : ''} ${faqAccordion ? 'aeo-faq--accordion' : ''}`}>
          <h2 className="aeo-block-title">{l.faq}</h2>
          {faqAccordion ? (
            <div className="aeo-faq-accordion">
              {faqItems.map((item, i) => (
                <details key={i} className="aeo-faq-details" open={i === 0}>
                  <summary className="aeo-faq-question">{item.question}</summary>
                  <p className="aeo-faq-answer">{item.answer}</p>
                </details>
              ))}
            </div>
          ) : (
            <dl className="aeo-faq-list">
              {faqItems.map((item, i) => (
                <div key={i} className="aeo-faq-item">
                  <dt className="aeo-faq-question">{item.question}</dt>
                  <dd className="aeo-faq-answer">{item.answer}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </aside>
  )
}
