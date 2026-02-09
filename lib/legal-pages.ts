export type LegalPageKey =
  | 'about-us'
  | 'contact-us'
  | 'privacy-policy'
  | 'terms'
  | 'disclaimer'
  | 'editorial-policy'
  | 'ai-policy'
  | 'corrections'
  | 'our-team'
  | 'advertise-with-us'
  | 'language'
  | 'location'
  | 'mobile-app'
  | 'delete-account'

export const LEGAL_PAGE_KEYS: LegalPageKey[] = [
  'about-us',
  'contact-us',
  'privacy-policy',
  'terms',
  'disclaimer',
  'editorial-policy',
  'ai-policy',
  'corrections',
  'our-team',
  'advertise-with-us',
  'language',
  'location',
  'mobile-app',
  'delete-account',
]

export const LEGAL_PAGE_META: Record<LegalPageKey, { title: string; description: string }> = {
  'about-us': {
    title: 'About Us',
    description: 'Learn about Kaburlu News, our mission, languages, and contact details.',
  },
  'contact-us': {
    title: 'Contact Us',
    description: 'Contact Kaburlu News for feedback, corrections, and support.',
  },
  'privacy-policy': {
    title: 'Privacy Policy',
    description: 'How Kaburlu News handles data, permissions, notifications, and safety.',
  },
  terms: {
    title: 'Terms & Conditions',
    description: 'Terms of use, content rules, and legal disclaimer for Kaburlu News.',
  },
  disclaimer: {
    title: 'Disclaimer',
    description: 'Kaburlu News editorial and legal disclaimer for content and sources.',
  },
  'editorial-policy': {
    title: 'Editorial Policy',
    description: 'Fact-checking, corrections, and ethical standards followed by Kaburlu News.',
  },
  'ai-policy': {
    title: 'AI Policy',
    description: 'How Kaburlu News uses AI for content creation and editorial assistance.',
  },
  corrections: {
    title: 'Corrections & Feedback Policy',
    description: 'How to report errors, request corrections, and share feedback.',
  },
  'our-team': {
    title: 'Our Team',
    description: 'Meet the editorial team and reporters behind Kaburlu News.',
  },
  'advertise-with-us': {
    title: 'Advertise With Us',
    description: 'Advertising options and contact details for brands and businesses.',
  },
  language: {
    title: 'Language',
    description: 'Choose your preferred language for Kaburlu News.',
  },
  location: {
    title: 'Location News',
    description: 'Browse local news by state, district, and area.',
  },
  'mobile-app': {
    title: 'Mobile App',
    description: 'Get the Kaburlu News mobile app and stay updated on the go.',
  },
  'delete-account': {
    title: 'Account & Data Deletion',
    description: 'Request deletion of your Kaburlu App account and associated data.',
  },
}

export function isLegalPageKey(v: string): v is LegalPageKey {
  return (LEGAL_PAGE_KEYS as string[]).includes(v)
}

// Fetch available legal pages from API
import { fetchJSON } from './remote'

export interface LegalPageData {
  slug: string
  title: string
  contentHtml: string
  meta?: {
    keywords?: string
    description?: string
  }
  updatedAt?: string
}

export async function fetchLegalPage(slug: string): Promise<LegalPageData | null> {
  try {
    const data = await fetchJSON<LegalPageData>(`/public/${slug}`, {
      revalidateSeconds: 3600, // Cache for 1 hour
      tags: [`legal-page-${slug}`],
    })
    return data
  } catch (error) {
    console.error(`Failed to fetch legal page ${slug}:`, error)
    return null
  }
}

// Fetch multiple legal pages to check availability
export async function getAvailableLegalPages(): Promise<Array<{ slug: string; title: string; href: string }>> {
  const pagesToCheck: LegalPageKey[] = [
    'about-us',
    'contact-us',
    'privacy-policy',
    'terms',
    'disclaimer',
    'editorial-policy',
    'ai-policy',
  ]

  const results = await Promise.allSettled(
    pagesToCheck.map(async (slug) => {
      const page = await fetchLegalPage(slug)
      if (page) {
        return {
          slug,
          title: page.title || LEGAL_PAGE_META[slug]?.title || slug,
          href: `/${slug}`,
        }
      }
      return null
    })
  )

  return results
    .filter((result): result is PromiseFulfilledResult<{ slug: string; title: string; href: string } | null> => result.status === 'fulfilled')
    .map((result) => result.value)
    .filter((page): page is { slug: string; title: string; href: string } => page !== null)
}
