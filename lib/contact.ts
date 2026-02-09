/**
 * Contact page data fetching
 * Fetches contact information from backend API
 */

import { cache as reactCache } from 'react'
import { fetchJSON, normalizeTenantDomain } from './remote'

export interface ContactInfo {
  title?: string
  description?: string
  email?: string
  phone?: string
  whatsapp?: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
  socialMedia?: {
    facebook?: string
    twitter?: string
    instagram?: string
    youtube?: string
    linkedin?: string
    telegram?: string
  }
  officeHours?: string
  mapUrl?: string
  formEnabled?: boolean
}

export interface ContactPageData {
  contact: ContactInfo
  seo?: {
    title?: string
    description?: string
    keywords?: string
  }
}

// Backend API response format
export interface BackendContactResponse {
  slug: string
  title: string
  contentHtml: string
  meta?: {
    keywords?: string
  }
  updatedAt: string
}

/**
 * Fetch contact page data from backend
 * React-cached for performance
 */
export const getContactData = reactCache(
  async (domain: string): Promise<ContactPageData | BackendContactResponse> => {
    try {
      const normalizedDomain = normalizeTenantDomain(domain)
      const url = `/public/contact?domain=${encodeURIComponent(normalizedDomain)}`
      
      const data = await fetchJSON(url, {
        next: { 
          revalidate: 300, // 5 minutes cache
          tags: [`contact-${normalizedDomain}`] 
        },
      })

      // Return the data as-is - it could be either format
      return data as BackendContactResponse
    } catch (error) {
      console.error('Failed to fetch contact data:', error)
      
      // Return fallback data in old format
      return {
        contact: {
          title: 'Contact Us',
          description: 'Get in touch with us',
          email: 'info@kaburlumedia.com',
          phone: '',
          address: {
            city: '',
            state: '',
            country: 'India',
          },
        },
      }
    }
  }
)
