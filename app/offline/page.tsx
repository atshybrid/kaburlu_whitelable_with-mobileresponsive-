export const metadata = { title: 'Offline — DailyBrief' }

export default function OfflinePage() {
  return (
    <main className="py-8">
      <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 p-6 text-center">
        <h1 className="text-2xl font-extrabold">You’re offline</h1>
        <p className="text-gray-600 mt-2">We’ll keep showing cached stories when possible. Reconnect to get the latest headlines.</p>
        <div className="mt-4">
          <a href="/" className="px-4 py-2 bg-indigo-600 text-white rounded">Retry</a>
        </div>
      </div>
    </main>
  )
}
