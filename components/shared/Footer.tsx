export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-10 bg-zinc-950 text-zinc-300">
      {/* Top CTA */}
      <div className="border-t-2 border-red-600 bg-zinc-950">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-start justify-between gap-4 py-8 md:flex-row md:items-center">
            <div>
              <h3 className="text-lg font-bold text-white">Stay Updated</h3>
              <p className="text-sm text-zinc-400">Get the day’s top stories delivered to your inbox.</p>
            </div>
            <form className="flex w-full max-w-md gap-2" action="#" method="post">
              <input
                type="email"
                name="email"
                required
                placeholder="Enter your email"
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
              />
              <button type="submit" className="shrink-0 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="border-t border-zinc-800">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 text-sm md:grid-cols-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2">
              <span className="inline-block h-5 w-1.5 rounded-full bg-gradient-to-b from-red-600 to-red-500" />
              <span className="text-xl font-extrabold text-white">Kaburlu News</span>
            </div>
            <p className="leading-relaxed text-zinc-400">Trusted Telugu news, breaking updates, and in‑depth coverage.</p>
            <div className="space-y-1 text-zinc-400">
              <div>Hyderabad, Telangana, India</div>
              <a href="mailto:contact@kaburlu.com" className="hover:text-white">contact@kaburlu.com</a>
              <a href="tel:+910000000000" className="block hover:text-white">+91 00000 00000</a>
            </div>
          </div>

          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Quick Links</div>
            <ul className="space-y-2 text-zinc-400">
              <li><a className="hover:text-white" href="#">About Us</a></li>
              <li><a className="hover:text-white" href="#">Contact Us</a></li>
              <li><a className="hover:text-white" href="#">Advertise</a></li>
              <li><a className="hover:text-white" href="#">Careers</a></li>
              <li><a className="hover:text-white" href="#">Sitemap</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Support & Legal</div>
            <ul className="space-y-2 text-zinc-400">
              <li><a className="hover:text-white" href="#">Help Center</a></li>
              <li><a className="hover:text-white" href="#">Feedback</a></li>
              <li><a className="hover:text-white" href="#">Editorial Policy</a></li>
              <li><a className="hover:text-white" href="#">Privacy Policy</a></li>
              <li><a className="hover:text-white" href="#">Terms of Use</a></li>
              <li><a className="hover:text-white" href="#">Disclaimer</a></li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Follow Us</div>
            <div className="flex gap-3">
              <a aria-label="Facebook" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-inset ring-zinc-800 hover:bg-zinc-800">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M22 12.06C22 6.48 17.52 2 11.94 2S2 6.48 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.62.77-1.62 1.56v1.87h2.76l-.44 2.9h-2.32V22c4.78-.76 8.44-4.92 8.44-9.94Z"/></svg>
              </a>
              <a aria-label="X" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-inset ring-zinc-800 hover:bg-zinc-800">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M3 3h3.7l5.2 7.51L17.6 3H21l-7.46 10.5L21.5 21H17.8l-5.5-7.86L6.4 21H3l7.87-10.93L3 3Z"/></svg>
              </a>
              <a aria-label="YouTube" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-inset ring-zinc-800 hover:bg-zinc-800">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M23.5 6.2s-.23-1.64-.94-2.36c-.9-.94-1.9-.95-2.36-1C16.9 2.5 12 2.5 12 2.5h-.01s-4.9 0-8.19.34c-.46.05-1.46.06-2.36 1-.71.72-.94 2.36-.94 2.36S0 8.2 0 10.2v1.6c0 2 .1 4 .1 4s.23 1.64.94 2.36c.9.94 2.08.91 2.61 1.01 1.9.18 8.35.24 8.35.24s4.9 0 8.19-.34c.46-.05 1.46-.06 2.36-1 .71-.72.94-2.36.94-2.36s.1-2 .1-4v-1.6c0-2-.1-4-.1-4ZM9.6 13.6V7.9l6.15 2.85-6.15 2.85Z"/></svg>
              </a>
              <a aria-label="Instagram" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-inset ring-zinc-800 hover:bg-zinc-800">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2.2c3.2 0 3.6 0 4.8.07 1.2.06 2 .26 2.47.44.62.24 1.07.52 1.54.98.47.47.74.92.98 1.54.18.47.38 1.27.44 2.47.07 1.2.07 1.6.07 4.8s0 3.6-.07 4.8c-.06 1.2-.26 2-.44 2.47a4.1 4.1 0 0 1-.98 1.54 4.1 4.1 0 0 1-1.54.98c-.47.18-1.27.38-2.47.44-1.2.07-1.6.07-4.8.07s-3.6 0-4.8-.07c-1.2-.06-2-.26-2.47-.44a4.1 4.1 0 0 1-1.54-.98 4.1 4.1 0 0 1-.98-1.54c-.18-.47-.38-1.27-.44-2.47C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.8c.06-1.2.26-2 .44-2.47.24-.62.52-1.07.98-1.54.47-.47.92-.74 1.54-.98.47-.18 1.27-.38 2.47-.44C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.16 0-3.53 0-4.78.07-.98.05-1.5.21-1.85.35-.47.18-.8.38-1.14.72-.34.34-.54.67-.72 1.14-.14.35-.3.87-.35 1.85-.07 1.25-.07 1.62-.07 4.78s0 3.53.07 4.78c.05.98.21 1.5.35 1.85.18.47.38.8.72 1.14.34.34.67.54 1.14.72.35.14.87.3 1.85.35 1.25.07 1.62.07 4.78.07s3.53 0 4.78-.07c.98-.05 1.5-.21 1.85-.35.47-.18.8-.38 1.14-.72.34-.34.54-.67.72-1.14.14-.35.3-.87.35-1.85.07-1.25.07-1.62.07-4.78s0-3.53-.07-4.78c-.05-.98-.21-1.5-.35-1.85a2.3 2.3 0 0 0-.72-1.14 2.3 2.3 0 0 0-1.14-.72c-.35-.14-.87-.3-1.85-.35-1.25-.07-1.62-.07-4.78-.07Zm0 3.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 1.8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.46-2.26a1.12 1.12 0 1 0 0 2.24 1.12 1.12 0 0 0 0-2.24Z"/></svg>
              </a>
              <a aria-label="Telegram" href="#" className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-zinc-900 ring-1 ring-inset ring-zinc-800 hover:bg-zinc-800">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M9.03 15.3 8.7 19c.47 0 .67-.21.92-.47l2.21-2.1 4.58 3.36c.84.47 1.45.22 1.68-.77l3.05-14.32c.27-1.24-.45-1.72-1.26-1.42L2.1 9.3c-1.2.47-1.18 1.14-.2 1.45l5.34 1.66 12.38-7.81c.58-.36 1.1-.16.67.23L9.03 15.3Z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-center text-xs text-zinc-500 md:flex-row md:text-left">
          <div>© {year} Kaburlu News. All rights reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#" className="hover:text-white">Privacy</a>
            <span className="text-zinc-700">•</span>
            <a href="#" className="hover:text-white">Terms</a>
            <span className="text-zinc-700">•</span>
            <a href="#" className="hover:text-white">Cookies</a>
            <span className="text-zinc-700">•</span>
            <span className="text-zinc-400">Powered by Kaburlu Softwares</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
