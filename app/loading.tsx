export default function Loading() {
  return (
    <main className="py-4 animate-pulse">
      <div className="hidden md:block">
        <section className="mt-4">
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-5 space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="aspect-video bg-gray-200 rounded" />
              <div className="h-[40px] bg-gray-200 rounded" />
            </div>
            <div className="col-span-4 space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-[520px] bg-gray-200 rounded" />
            </div>
            <div className="col-span-3 space-y-4">
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-[520px] bg-gray-200 rounded" />
            </div>
          </div>
        </section>
      </div>
      <div className="md:hidden space-y-4">
        <div className="h-6 w-40 bg-gray-200 rounded" />
        <div className="aspect-video bg-gray-200 rounded" />
        <div className="h-40 bg-gray-200 rounded" />
      </div>
    </main>
  )
}
