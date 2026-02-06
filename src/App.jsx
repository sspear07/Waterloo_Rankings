import { Analytics } from "@vercel/analytics/react"
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Vote from './pages/Vote'
import Results from './pages/Results'
import InternetRankings from './pages/InternetRankings'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vote/:office" element={<Vote />} />
        <Route path="/results/:office" element={<Results />} />
        <Route path="/internet-rankings" element={<InternetRankings />} />
      </Routes>
      <Analytics />
    </Layout>
  )
}

export default App