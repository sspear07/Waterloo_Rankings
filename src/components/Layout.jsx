import { Link } from 'react-router-dom'

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Logo" className="h-32 w-32 object-contain" />
            <h1 className="text-xl font-bold text-slate-800">
              Waterloo Rankings
            </h1>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center text-sm text-slate-500">
          Rate your favorite Waterloo flavors each month
        </div>
      </footer>
    </div>
  )
}

export default Layout
