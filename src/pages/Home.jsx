import OfficeSelector from '../components/OfficeSelector'

function Home() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">
          Rate This Month's Flavors
        </h2>
        <p className="text-slate-600">
          Select your office to vote on the current Waterloo seltzer selection
        </p>
      </div>

      <OfficeSelector />

      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <h3 className="font-semibold text-slate-800 mb-2">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600">
          <div className="p-4">
            <div className="text-2xl mb-2">1️⃣</div>
            <p>Pick your favorite of the two flavors</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">2️⃣</div>
            <p>Rate each flavor from 1-5 stars</p>
          </div>
          <div className="p-4">
            <div className="text-2xl mb-2">3️⃣</div>
            <p>See how your taste compares to everyone else</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
