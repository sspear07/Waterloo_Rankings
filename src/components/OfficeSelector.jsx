import { useNavigate } from 'react-router-dom'

function OfficeSelector() {
  const navigate = useNavigate()

  const offices = [
    { id: 'austin', name: 'Austin', emoji: '🤠' },
    { id: 'charlotte', name: 'Charlotte', emoji: '🏙️' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {offices.map((office) => (
        <button
          key={office.id}
          onClick={() => navigate(`/vote/${office.id}`)}
          className="bg-white rounded-xl shadow-md p-8 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex flex-col items-center gap-4"
        >
          <span className="text-5xl">{office.emoji}</span>
          <span className="text-xl font-semibold text-slate-800">
            {office.name} Office
          </span>
          <span className="text-sm text-slate-500">
            Vote for this month's flavors
          </span>
        </button>
      ))}
    </div>
  )
}

export default OfficeSelector
