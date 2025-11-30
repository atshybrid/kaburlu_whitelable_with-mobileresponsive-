import Link from 'next/link'
import { getCategories } from '../lib/data'

const newsroomLinks = [
  { label: 'About Us', href: '/about' },
  { label: 'Editorial Guidelines', href: '/about/editorial-code' },
  { label: 'Careers', href: '/careers' },
  { label: 'Advertise', href: '/advertise' },
  { label: 'Contact Newsroom', href: '/contact' }
]

const legalLinks = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Accessibility', href: '/accessibility' },
  { label: 'Sitemap', href: '/sitemap.xml' }
]

const seoTopics = ['Elections 2025', 'Monsoon', 'Startups', 'Jobs', 'Cinema', 'Education', 'Rural India', 'Women Empowerment']

export default function SeoFooter() {
  const categories = getCategories().filter(cat => cat.slug !== 'top' && cat.slug !== 'latest')
  return (
    <footer className="mt-12 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <div className="max-w-[var(--site-max)] mx-auto px-4 py-10 grid lg:grid-cols-4 gap-8 text-sm text-gray-600 dark:text-gray-300">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gray-500">DailyBrief</p>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">Stay ahead of the news</h3>
          <p className="mt-3 text-sm leading-relaxed">Comprehensive reporting across business, tech, politics, and culture. Built for lightning-fast performance and SEO best practices.</p>
          <div className="mt-4 space-y-1 text-xs text-gray-500">
            <p>Newsroom: +91 40 0000 0000</p>
            <p>Email: editor@dailybrief.in</p>
            <p>Address: Road 2, Banjara Hills, Hyderabad</p>
          </div>
        </div>
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Newsroom</h4>
          <ul className="mt-3 space-y-2">
            {newsroomLinks.map(link => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-indigo-600 dark:hover:text-indigo-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Coverage</h4>
          <ul className="mt-3 space-y-2">
            {categories.map(cat => (
              <li key={cat.slug}>
                <Link href={`/category/${cat.slug}`} className="hover:text-indigo-600 dark:hover:text-indigo-300">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">Topics</h4>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {seoTopics.map(topic => (
              <Link key={topic} href={`/?topic=${encodeURIComponent(topic.toLowerCase())}#insights`} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-indigo-500">
                {topic}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-[var(--site-max)] mx-auto px-4 py-6 text-xs text-gray-500 flex flex-col md:flex-row gap-3 justify-between">
          <p>© {new Date().getFullYear()} DailyBrief Media Network. All rights reserved.</p>
          <ul className="flex flex-wrap gap-4">
            {legalLinks.map(link => (
              <li key={link.label}>
                <Link href={link.href} className="hover:text-indigo-600 dark:hover:text-indigo-300">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
