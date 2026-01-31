export type LegalPageKey =
  | 'about-us'
  | 'contact-us'
  | 'privacy-policy'
  | 'terms'
  | 'disclaimer'
  | 'editorial-policy'
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
