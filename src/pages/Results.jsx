import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getCurrentMonth } from '../lib/voteStorage'
import LeaderboardChart from '../components/LeaderboardChart'
import OfficeFilter from '../components/OfficeFilter'
import StarRating from '../components/StarRating'

function Results() {
  const { office } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [monthlyResults, setMonthlyResults] = useState(null)
  const [leaderboardData, setLeaderboardData] = useState([])
  const [leaderboardFilter, setLeaderboardFilter] = useState('all')

  const officeName = office === 'austin' ? 'Austin' : 'Charlotte'

// Format a month string from `YYYY-MM` to `Mon YYYY` (e.g. "Feb 2026")
function formatMonth(ym) {
  if (!ym) return ''
  const parts = ym.split('-')
  if (parts.length !== 2) return ym
  const year = Number(parts[0])
  const month = Number(parts[1]) - 1
  const d = new Date(year, month, 1)
  return d.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

  useEffect(() => {
    loadResults()
  }, [office])

  useEffect(() => {
    loadLeaderboard()
  }, [leaderboardFilter])

  async function loadResults() {
    try {
      setLoading(true)
      const currentMonth = getCurrentMonth()

      // Get current matchup for this office
      const { data: matchup, error: matchupError } = await supabase
        .from('monthly_matchups')
        .select(`
          *,
          flavor_1:flavors!monthly_matchups_flavor_1_id_fkey(*),
          flavor_2:flavors!monthly_matchups_flavor_2_id_fkey(*)
        `)
        .eq('office', office)
        .eq('month', currentMonth)
        .eq('is_active', true)
        .single()

      if (matchupError && matchupError.code !== 'PGRST116') {
        throw matchupError
      }

      if (matchup) {
        // Get vote stats for this matchup
        const { data: votes, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .eq('matchup_id', matchup.id)

        if (votesError) throw votesError

        // Calculate stats
        const totalVotes = votes.length
        const flavor1Wins = votes.filter(v => v.favorite_flavor_id === matchup.flavor_1_id).length
        const flavor2Wins = votes.filter(v => v.favorite_flavor_id === matchup.flavor_2_id).length
        const flavor1AvgRating = votes.length > 0
          ? votes.reduce((sum, v) => sum + v.flavor_1_rating, 0) / totalVotes
          : 0
        const flavor2AvgRating = votes.length > 0
          ? votes.reduce((sum, v) => sum + v.flavor_2_rating, 0) / totalVotes
          : 0

        setMonthlyResults({
          matchup,
          totalVotes,
          flavor1: {
            ...matchup.flavor_1,
            wins: flavor1Wins,
            avgRating: flavor1AvgRating,
          },
          flavor2: {
            ...matchup.flavor_2,
            wins: flavor2Wins,
            avgRating: flavor2AvgRating,
          },
        })
      }

      await loadLeaderboard()
    } catch (err) {
      console.error('Error loading results:', err)
      setError('Failed to load results. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function loadLeaderboard() {
    try {
      // Get all votes, optionally filtered by office
      let query = supabase
        .from('votes')
        .select(`
          *,
          matchup:monthly_matchups(
            flavor_1_id,
            flavor_2_id,
            flavor_1:flavors!monthly_matchups_flavor_1_id_fkey(id, name),
            flavor_2:flavors!monthly_matchups_flavor_2_id_fkey(id, name)
          )
        `)

      if (leaderboardFilter !== 'all') {
        query = query.eq('office', leaderboardFilter)
      }

      const { data: votes, error: votesError } = await query

      if (votesError) throw votesError

      // Aggregate stats per flavor
      const flavorStats = {}

      votes.forEach((vote) => {
        const matchup = vote.matchup
        if (!matchup) return

        // Process flavor 1
        const f1Id = matchup.flavor_1_id
        const f1Name = matchup.flavor_1?.name || 'Unknown'
        if (!flavorStats[f1Id]) {
          flavorStats[f1Id] = { id: f1Id, name: f1Name, totalRating: 0, totalVotes: 0, wins: 0 }
        }
        flavorStats[f1Id].totalRating += vote.flavor_1_rating
        flavorStats[f1Id].totalVotes += 1
        if (vote.favorite_flavor_id === f1Id) {
          flavorStats[f1Id].wins += 1
        }

        // Process flavor 2
        const f2Id = matchup.flavor_2_id
        const f2Name = matchup.flavor_2?.name || 'Unknown'
        if (!flavorStats[f2Id]) {
          flavorStats[f2Id] = { id: f2Id, name: f2Name, totalRating: 0, totalVotes: 0, wins: 0 }
        }
        flavorStats[f2Id].totalRating += vote.flavor_2_rating
        flavorStats[f2Id].totalVotes += 1
        if (vote.favorite_flavor_id === f2Id) {
          flavorStats[f2Id].wins += 1
        }
      })

      // Calculate averages
      const leaderboard = Object.values(flavorStats).map((flavor) => ({
        ...flavor,
        avgRating: flavor.totalVotes > 0 ? flavor.totalRating / flavor.totalVotes : 0,
      }))

      setLeaderboardData(leaderboard)
    } catch (err) {
      console.error('Error loading leaderboard:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-500">Loading results...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 rounded-xl p-6 text-center">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* This Month's Results */}
      {monthlyResults && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-800">
              {officeName} - {formatMonth(getCurrentMonth())} Results
            </h2>
            <Link
              to="/internet-rankings"
              className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
            >
              How does the internet rate them?
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="text-center mb-6">
              <span className="text-4xl font-bold text-slate-800">
                {monthlyResults.totalVotes}
              </span>
              <span className="text-slate-500 ml-2">total votes</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Flavor 1 */}
              <div className={`p-4 rounded-lg ${
                monthlyResults.flavor1.wins > monthlyResults.flavor2.wins
                  ? 'bg-amber-50 ring-2 ring-amber-400'
                  : 'bg-slate-50'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {monthlyResults.flavor1.image_url ? (
                      <img src={monthlyResults.flavor1.image_url} alt={monthlyResults.flavor1.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">🥤</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{monthlyResults.flavor1.name}</h4>
                    {monthlyResults.flavor1.wins > monthlyResults.flavor2.wins && (
                      <span className="text-xs text-amber-600 font-medium">Winner!</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Head-to-head wins:</span>
                    <span className="font-medium">{monthlyResults.flavor1.wins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Avg rating:</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(monthlyResults.flavor1.avgRating)} readonly />
                      <span className="font-medium">{monthlyResults.flavor1.avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flavor 2 */}
              <div className={`p-4 rounded-lg ${
                monthlyResults.flavor2.wins > monthlyResults.flavor1.wins
                  ? 'bg-amber-50 ring-2 ring-amber-400'
                  : 'bg-slate-50'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {monthlyResults.flavor2.image_url ? (
                      <img src={monthlyResults.flavor2.image_url} alt={monthlyResults.flavor2.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">🥤</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{monthlyResults.flavor2.name}</h4>
                    {monthlyResults.flavor2.wins > monthlyResults.flavor1.wins && (
                      <span className="text-xs text-amber-600 font-medium">Winner!</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Head-to-head wins:</span>
                    <span className="font-medium">{monthlyResults.flavor2.wins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Avg rating:</span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={Math.round(monthlyResults.flavor2.avgRating)} readonly />
                      <span className="font-medium">{monthlyResults.flavor2.avgRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All-Time Leaderboard */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-800">All-Time Leaderboard</h2>
          <OfficeFilter
            selectedOffice={leaderboardFilter}
            onOfficeChange={setLeaderboardFilter}
          />
        </div>

        <LeaderboardChart data={leaderboardData} />
      </div>

      {/* Back Button */}
      <div className="text-center">
        <Link
          to="/"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

export default Results
