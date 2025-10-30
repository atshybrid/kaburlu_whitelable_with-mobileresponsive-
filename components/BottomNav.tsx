import Link from 'next/link'

export default function BottomNav() {
  return (
    <nav className="fixed bottom-3 left-0 right-0 px-3 md:hidden">
      <div className="max-w-[var(--site-max)] mx-auto backdrop-blur bg-white/90 dark:bg-gray-900/80 rounded-2xl shadow-lg flex items-center justify-between px-4 py-2 border border-gray-200 dark:border-gray-800">
        <Link href="/" className="text-[13px] font-medium">Home</Link>
        <Link href="/category/latest" className="text-[13px] font-medium">Latest</Link>
        <Link href="/category/markets" className="text-[13px] font-medium">Markets</Link>
        <Link href="/category/technology" className="text-[13px] font-medium">Tech</Link>
        <Link href="/category/sports" className="text-[13px] font-medium">Sports</Link>
      </div>
    </nav>
  )
}
