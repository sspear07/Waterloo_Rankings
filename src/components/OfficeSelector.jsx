import { useNavigate } from 'react-router-dom'

function OfficeSelector() {
  const navigate = useNavigate()

  const offices = [
    { id: 'austin', name: 'Austin', image: '/austin.png' },
    { id: 'charlotte', name: 'Charlotte', image: '/charlotte.png' },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {offices.map((office) => (
        <button
          key={office.id}
          onClick={() => navigate(`/vote/${office.id}`)}
          className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] flex flex-col items-center gap-2"
        >
          <img src={office.image} alt={office.name} className="h-80 w-80 object-contain" />
          <span className="text-sm text-slate-500">
            Vote for this month's flavors
          </span>
        </button>
      ))}
    </div>
  )
}

export default OfficeSelector
