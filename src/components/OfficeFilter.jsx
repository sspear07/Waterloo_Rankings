function OfficeFilter({ selectedOffice, onOfficeChange }) {
  const offices = [
    { id: 'all', name: 'All Offices' },
    { id: 'austin', name: 'Austin' },
    { id: 'charlotte', name: 'Charlotte' },
  ]

  return (
    <div className="flex gap-2">
      {offices.map((office) => (
        <button
          key={office.id}
          onClick={() => onOfficeChange(office.id)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            selectedOffice === office.id
              ? 'bg-primary-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          {office.name}
        </button>
      ))}
    </div>
  )
}

export default OfficeFilter
