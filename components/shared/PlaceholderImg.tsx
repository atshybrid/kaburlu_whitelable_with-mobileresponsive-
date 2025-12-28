export function PlaceholderImg({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 9"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="16" height="9" fill="#f3f4f6" />
      <path d="M0 7 L5 3 L9 6 L12 4 L16 7 L16 9 L0 9 Z" fill="#e5e7eb" />
      <text x="8" y="5" textAnchor="middle" fontSize="2" fill="#9ca3af">
        Sample
      </text>
    </svg>
  )
}
