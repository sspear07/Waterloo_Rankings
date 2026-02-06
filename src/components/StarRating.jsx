import { useState } from 'react'

function StarRating({ rating, onRatingChange, readonly = false }) {
  const [hoverRating, setHoverRating] = useState(0)

  const handleClick = (star) => {
    if (!readonly && onRatingChange) {
      onRatingChange(star)
    }
  }

  const handleMouseEnter = (star) => {
    if (!readonly) {
      setHoverRating(star)
    }
  }

  const handleMouseLeave = () => {
    setHoverRating(0)
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hoverRating || rating)

        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`text-3xl transition-transform ${
              readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            }`}
            aria-label={`Rate ${star} stars`}
          >
            <span className={isFilled ? 'text-amber-400' : 'text-slate-300'}>
              ★
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default StarRating
