import { Footer } from '@/components/shared/Footer'
import { Navbar } from '@/components/shared/Navbar'
import type { EffectiveSettings } from '@/lib/remote'
import type { LegalPageKey } from '@/lib/legal-pages'
import { LEGAL_PAGE_META } from '@/lib/legal-pages'

function firstNonEmpty(...vals: Array<string | undefined | null>) {
  for (const v of vals) {
    const s = String(v || '').trim()
    if (s) return s
  }
  return ''
}

export async function LegalPage({
  pageKey,
  tenantSlug,
  siteTitle,
  settings,
  themeKey,
}: {
  pageKey: LegalPageKey
  tenantSlug: string
  siteTitle: string
  settings?: EffectiveSettings
  themeKey?: string
}) {
  const meta = LEGAL_PAGE_META[pageKey]

  const contactEmail = firstNonEmpty(settings?.contact?.email, settings?.settings?.contact?.email, process.env.NEXT_PUBLIC_CONTACT_EMAIL)
  const contactPhone = firstNonEmpty(settings?.contact?.phone, settings?.settings?.contact?.phone, process.env.NEXT_PUBLIC_CONTACT_PHONE)
  const addressCity = firstNonEmpty(settings?.contact?.city, settings?.settings?.contact?.city)
  const addressRegion = firstNonEmpty(settings?.contact?.region, settings?.settings?.contact?.region)
  const addressCountry = firstNonEmpty(settings?.contact?.country, settings?.settings?.contact?.country)

  const playStoreUrl = firstNonEmpty(process.env.NEXT_PUBLIC_PLAY_STORE_URL)

  const isStyle2 = String(themeKey || '').toLowerCase() === 'style2'

  return (
    <div>
      <Navbar tenantSlug={tenantSlug} title={siteTitle} logoUrl={settings?.branding?.logoUrl} variant={isStyle2 ? 'style2' : 'default'} />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-4 text-3xl font-extrabold leading-tight">{meta.title}</h1>
        <div className="prose max-w-none">
          {pageKey === 'about-us' ? (
            <>
              <p>
                <strong>{siteTitle}</strong> is a multi-language news platform by Kaburlu, delivering breaking news, local updates, and trusted reporting.
              </p>
              <h2>What we do</h2>
              <ul>
                <li>Publish latest news, breaking alerts, and category-wise coverage</li>
                <li>Support location-based browsing (state/district where available)</li>
                <li>Support multiple languages for wider reach</li>
              </ul>
              <h2>Languages supported</h2>
              <p>Telugu, Hindi, English, Kannada, Tamil (availability may vary by tenant/edition).</p>
              <h2>Contact</h2>
              <p>
                {contactEmail ? (
                  <>Email: <a href={`mailto:${contactEmail}`}>{contactEmail}</a></>
                ) : (
                  <>Email: <em>Not configured</em></>
                )}
                {contactPhone ? (
                  <>
                    <br />Phone: <a href={`tel:${contactPhone}`}>{contactPhone}</a>
                  </>
                ) : null}
                {(addressCity || addressRegion || addressCountry) ? (
                  <>
                    <br />Location: {[addressCity, addressRegion, addressCountry].filter(Boolean).join(', ')}
                  </>
                ) : null}
              </p>
            </>
          ) : null}

          {pageKey === 'contact-us' ? (
            <>
              <p>For corrections, feedback, advertising, or general support, use the details below.</p>
              <h2>Email</h2>
              <p>
                {contactEmail ? (
                  <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                ) : (
                  <em>Not configured</em>
                )}
              </p>
              {contactPhone ? (
                <>
                  <h2>Phone</h2>
                  <p>
                    <a href={`tel:${contactPhone}`}>{contactPhone}</a>
                  </p>
                </>
              ) : null}
              {(addressCity || addressRegion || addressCountry) ? (
                <>
                  <h2>Office location</h2>
                  <p>{[addressCity, addressRegion, addressCountry].filter(Boolean).join(', ')}</p>
                </>
              ) : null}

              <h2>Contact form</h2>
              <p>
                This form opens your email app (fast & reliable for approvals). If you prefer an in-app form submission, we can switch it to a backend API.
              </p>
              <form action={contactEmail ? `mailto:${contactEmail}` : '#'} method="post" className="not-prose space-y-3">
                <div>
                  <label className="block text-sm font-medium">Name</label>
                  <input className="w-full rounded-md border px-3 py-2" name="name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Email</label>
                  <input className="w-full rounded-md border px-3 py-2" type="email" name="email" required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Message</label>
                  <textarea className="w-full rounded-md border px-3 py-2" name="message" rows={5} required />
                </div>
                <button className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700" type="submit">
                  Send
                </button>
              </form>
            </>
          ) : null}

          {pageKey === 'privacy-policy' ? (
            <>
              <p>
                This Privacy Policy explains how <strong>{siteTitle}</strong> collects, uses, and protects information when you use our website and mobile app.
              </p>

              <h2>Information we may collect</h2>
              <ul>
                <li>Basic usage analytics (pages visited, device/browser info)</li>
                <li>Optional information you share via contact/feedback (name, email, message)</li>
              </ul>

              <h2>Push notifications (Firebase)</h2>
              <p>
                We may use Firebase Cloud Messaging (FCM) to send breaking news and important updates. You can disable notifications anytime in your device settings.
              </p>

              <h2>Location usage</h2>
              <p>
                We may request location permission to personalize local news (state/district/area). Location access is optional, and the app should still work without it.
              </p>

              <h2>Camera / Media access (Reporters only)</h2>
              <p>
                If you are a verified reporter/editor using reporter tools, the app may request camera and storage/media permissions to upload photos/videos for publishing.
                Regular users are not required to grant camera/media access.
              </p>

              <h2>Data safety</h2>
              <ul>
                <li>We do not sell your personal data.</li>
                <li>We use reasonable security measures to protect data.</li>
                <li>We retain messages/feedback only as needed to respond and improve services.</li>
              </ul>

              <h2>Third-party services</h2>
              <p>
                We may use third-party services (e.g., analytics, ads, hosting) which may collect limited technical data. These providers are expected to follow their own privacy policies.
              </p>

              <h2>Contact</h2>
              <p>
                If you have questions about privacy, contact us at{' '}
                {contactEmail ? <a href={`mailto:${contactEmail}`}>{contactEmail}</a> : <em>Not configured</em>}.
              </p>
            </>
          ) : null}

          {pageKey === 'terms' ? (
            <>
              <p>
                By using <strong>{siteTitle}</strong>, you agree to these Terms & Conditions.
              </p>
              <h2>Content usage</h2>
              <ul>
                <li>News content is for personal, non-commercial use unless explicitly permitted.</li>
                <li>Reproduction, scraping, or redistribution without permission is prohibited.</li>
              </ul>
              <h2>User responsibilities</h2>
              <ul>
                <li>Do not post illegal, abusive, or misleading content via feedback channels.</li>
                <li>Respect intellectual property and privacy of others.</li>
              </ul>
              <h2>Disclaimer</h2>
              <p>
                Content is provided “as is” based on available sources. We do our best to be accurate, but we do not guarantee completeness.
              </p>
              <h2>Contact</h2>
              <p>
                For questions, contact {contactEmail ? <a href={`mailto:${contactEmail}`}>{contactEmail}</a> : <em>Not configured</em>}.
              </p>
            </>
          ) : null}

          {pageKey === 'disclaimer' ? (
            <>
              <ul>
                <li><strong>No political affiliation:</strong> We are not affiliated with any political party.</li>
                <li><strong>Sources:</strong> News is compiled from reporters, agencies, and credible public sources.</li>
                <li><strong>Errors:</strong> Any errors are unintentional. We welcome corrections.</li>
              </ul>
              <p>
                To request a correction, email{' '}
                {contactEmail ? <a href={`mailto:${contactEmail}?subject=Correction Request`}>{contactEmail}</a> : <em>Not configured</em>}.
              </p>
            </>
          ) : null}

          {pageKey === 'editorial-policy' ? (
            <>
              <p>
                Our editorial policy is designed to maintain accuracy, fairness, and trust.
              </p>
              <h2>Fact checking</h2>
              <ul>
                <li>We verify information with reliable sources where possible.</li>
                <li>We avoid misleading headlines and misinformation.</li>
              </ul>
              <h2>Corrections</h2>
              <p>
                If we publish an error, we correct it as quickly as possible. See the Corrections & Feedback Policy for the process.
              </p>
              <h2>Ethical standards</h2>
              <ul>
                <li>We avoid conflicts of interest and clearly label sponsored content.</li>
                <li>We respect privacy and avoid hate/harassment content.</li>
              </ul>
            </>
          ) : null}

          {pageKey === 'corrections' ? (
            <>
              <p>
                We take corrections seriously. If you believe a story contains an error, please report it.
              </p>
              <h2>How to report an error</h2>
              <ul>
                <li>Send the article link/slug, the issue, and supporting details</li>
                <li>Email subject: <code>Correction Request</code></li>
              </ul>
              <p>
                Email: {contactEmail ? <a href={`mailto:${contactEmail}?subject=Correction Request`}>{contactEmail}</a> : <em>Not configured</em>}
              </p>
              <h2>What happens next</h2>
              <ul>
                <li>We review the claim and verify with sources</li>
                <li>We update the content if needed and may add a correction note</li>
              </ul>
            </>
          ) : null}

          {pageKey === 'our-team' ? (
            <>
              <p>
                Kaburlu News is produced by an editorial team, local reporters, and contributors.
              </p>
              <h2>Editorial team</h2>
              <ul>
                <li>Editor: <em>To be published</em></li>
                <li>News Desk: <em>To be published</em></li>
                <li>Reporters: <em>Local contributors</em></li>
              </ul>
              <p>
                If you want to join as a reporter, contact {contactEmail ? <a href={`mailto:${contactEmail}?subject=Reporter Application`}>{contactEmail}</a> : <em>Not configured</em>}.
              </p>
            </>
          ) : null}

          {pageKey === 'advertise-with-us' ? (
            <>
              <p>For advertising and partnerships, contact our team.</p>
              <h2>Ad formats</h2>
              <ul>
                <li>Homepage banner</li>
                <li>Category page placements</li>
                <li>Sponsored posts (clearly labeled)</li>
              </ul>
              <p>
                Email: {contactEmail ? <a href={`mailto:${contactEmail}?subject=Advertising Inquiry`}>{contactEmail}</a> : <em>Not configured</em>}
              </p>
            </>
          ) : null}

          {pageKey === 'language' ? (
            <>
              <p>Select your preferred language. (Language switching UI may also be available on the Home page.)</p>
              <ul>
                <li>Telugu</li>
                <li>Hindi</li>
                <li>English</li>
                <li>Kannada</li>
                <li>Tamil</li>
              </ul>
            </>
          ) : null}

          {pageKey === 'location' ? (
            <>
              <p>Browse local news by location. This page is ready for backend-driven location lists.</p>
              <ul>
                <li>State-wise news</li>
                <li>District-wise news</li>
                <li>Mandal-wise news (if available)</li>
              </ul>
              <p>
                Next step: connect this page to a backend API that returns available states/districts and their latest articles.
              </p>
            </>
          ) : null}

          {pageKey === 'mobile-app' ? (
            <>
              <p>Get the Kaburlu News mobile app for faster updates and push notifications.</p>
              <p>
                {playStoreUrl ? (
                  <a href={playStoreUrl} target="_blank" rel="noopener noreferrer">Open on Google Play</a>
                ) : (
                  <>Play Store link: <em>Not configured</em></>
                )}
              </p>
              <h2>App features</h2>
              <ul>
                <li>Breaking news alerts</li>
                <li>Local news by area</li>
                <li>Easy sharing</li>
              </ul>
            </>
          ) : null}

          {pageKey === 'delete-account' ? (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                <h2 className="text-red-800 mt-0">Account & Data Deletion – Kaburlu App</h2>
                <p className="text-red-700 mb-0">
                  If you are a registered reporter or citizen reporter of Kaburlu App and want to delete your account and associated data, please follow the instructions below.
                </p>
              </div>

              <h2>How to Request Account Deletion</h2>
              <p>
                To delete your account and all associated data, please send an email to:
              </p>
              <p className="text-center">
                <a 
                  href="mailto:support@kaburlutoday.com?subject=Account Deletion Request" 
                  className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors no-underline"
                >
                  📧 support@kaburlutoday.com
                </a>
              </p>

              <h2>Information Required</h2>
              <p>Please include the following details in your email:</p>
              <ul>
                <li><strong>Registered Mobile Number</strong> or <strong>Email ID</strong></li>
                <li><strong>Reporter ID</strong> (if applicable)</li>
                <li><strong>Full Name</strong> (as registered)</li>
                <li><strong>Reason for deletion</strong> (optional)</li>
              </ul>

              <h2>What Happens Next?</h2>
              <ul>
                <li>Our support team will verify your identity</li>
                <li>Your account and all associated data will be permanently deleted</li>
                <li>You will receive a confirmation email once the deletion is complete</li>
              </ul>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                <p className="text-yellow-800 mb-0">
                  <strong>⏱️ Processing Time:</strong> We will process your request within <strong>7 working days</strong>.
                </p>
              </div>

              <h2>Data That Will Be Deleted</h2>
              <ul>
                <li>Your profile information (name, phone, email)</li>
                <li>Reporter credentials and permissions</li>
                <li>Published articles (will be transferred to anonymous/desk account)</li>
                <li>Activity logs and analytics data</li>
              </ul>

              <h2>ఖాతా & డేటా తొలగింపు – కబుర్లు యాప్</h2>
              <p>
                మీరు కబుర్లు యాప్ యొక్క రిజిస్టర్డ్ రిపోర్టర్ లేదా సిటిజన్ రిపోర్టర్ అయి, మీ ఖాతా మరియు సంబంధిత డేటాను తొలగించాలనుకుంటే, దయచేసి క్రింది ఇమెయిల్‌కు అభ్యర్థన పంపండి:
              </p>
              <p className="text-center">
                <strong>📧 support@kaburlutoday.com</strong>
              </p>
              <p>ఇమెయిల్‌లో చేర్చవలసినవి:</p>
              <ul>
                <li>రిజిస్టర్డ్ మొబైల్ నంబర్ / ఇమెయిల్</li>
                <li>రిపోర్టర్ ఐడి (ఉంటే)</li>
              </ul>
              <p>
                <strong>⏱️ ప్రాసెసింగ్ సమయం:</strong> మేము 7 పని దినాలలో మీ అభ్యర్థనను ప్రాసెస్ చేస్తాము.
              </p>

              <h2>Contact</h2>
              <p>
                For any questions about account deletion, contact us at{' '}
                <a href="mailto:support@kaburlutoday.com">support@kaburlutoday.com</a>
              </p>
            </>
          ) : null}
        </div>
      </main>

      <Footer settings={settings} tenantSlug={tenantSlug} />
    </div>
  )
}
