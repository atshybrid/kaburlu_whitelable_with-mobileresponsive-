import React from 'react'

export default function SectionBar({ title, right, className = '', compact = false }: { title: React.ReactNode; right?: React.ReactNode; className?: string; compact?: boolean }) {
  return (
    <div className={`flex items-center justify-between ${compact ? '' : 'border-b border-gray-200'} ${className}`}>
      <div className={compact ? '' : 'py-1'}>
        <span className="inline-block bg-[#255db1] text-white text-sm font-bold px-3 py-1 rounded">
          {title}
        </span>
      </div>
      {right ? (
        <div className={compact ? '' : 'py-1'}>
          {right}
        </div>
      ) : null}
    </div>
  )
}
