type Props = {
  height?: number
  label?: string
}

export default function AdBanner({ height = 120, label = 'ADVERTISEMENT' }: Props) {
  return (
    <div className="w-full border border-dashed border-gray-300 dark:border-gray-700 rounded relative overflow-hidden bg-gray-50 dark:bg-gray-900/40" style={{height}}>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs tracking-widest text-gray-400">{label}</span>
      </div>
    </div>
  )
}
