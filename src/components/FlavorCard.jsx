function FlavorCard({ flavor, selected, onClick, showSelection = false }) {
  const baseClasses = "bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200"
  const selectableClasses = showSelection
    ? "cursor-pointer hover:shadow-lg hover:scale-[1.02]"
    : ""
  const selectedClasses = selected
    ? "ring-4 ring-primary-500 ring-offset-2"
    : ""

  return (
    <div
      className={`${baseClasses} ${selectableClasses} ${selectedClasses}`}
      onClick={onClick}
      role={showSelection ? "button" : undefined}
      tabIndex={showSelection ? 0 : undefined}
      onKeyDown={showSelection ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      <div className="aspect-square bg-slate-100 flex items-center justify-center">
        {flavor.image_url ? (
          <img
            src={flavor.image_url}
            alt={flavor.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">🥤</div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-slate-800">{flavor.name}</h3>
        {flavor.description && (
          <p className="text-sm text-slate-500 mt-1">{flavor.description}</p>
        )}
      </div>

      {showSelection && selected && (
        <div className="bg-primary-500 text-white text-center py-2 font-medium">
          Your Pick!
        </div>
      )}
    </div>
  )
}

export default FlavorCard
