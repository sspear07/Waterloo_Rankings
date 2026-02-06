function SentimentBadge({ label, score, size = 'md' }) {
  const getColors = () => {
    if (label === 'Positive' || score > 0.2) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    }
    if (label === 'Negative' || score < -0.2) {
      return 'bg-red-100 text-red-700 border-red-200'
    }
    return 'bg-slate-100 text-slate-600 border-slate-200'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-medium ${getColors()} ${sizeClasses[size]}`}
    >
      {label === 'Positive' && <span>+</span>}
      {label === 'Negative' && <span>-</span>}
      {label}
      {score !== undefined && (
        <span className="opacity-70">({score.toFixed(2)})</span>
      )}
    </span>
  )
}

export default SentimentBadge
