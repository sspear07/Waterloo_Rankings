import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getVoterId, getCurrentMonth } from '../lib/voteStorage'
import FlavorCard from '../components/FlavorCard'
import StarRating from '../components/StarRating'

function Vote() {
  const { office } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [matchup, setMatchup] = useState(null)
  const [flavor1, setFlavor1] = useState(null)
  const [flavor2, setFlavor2] = useState(null)
  const [hasVoted, setHasVoted] = useState(false)

  // Voting state
  const [step, setStep] = useState(1) // 1 = pick favorite, 2 = rate flavors, 3 = submitting
  const [favorite, setFavorite] = useState(null)
  const [rating1, setRating1] = useState(0)
  const [rating2, setRating2] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  const officeName = office === 'austin' ? 'Austin' : 'Charlotte'

  useEffect(() => {
    loadMatchup()
  }, [office])

  async function loadMatchup() {
    try {
      setLoading(true)
      const currentMonth = getCurrentMonth()
      const voterId = getVoterId()

      // Get active matchup for this office and month
      const { data: matchupData, error: matchupError } = await supabase
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

      if (matchupError) {
        if (matchupError.code === 'PGRST116') {
          setError('No active matchup found for this month. Check back later!')
        } else {
          throw matchupError
        }
        return
      }

      setMatchup(matchupData)
      setFlavor1(matchupData.flavor_1)
      setFlavor2(matchupData.flavor_2)

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('matchup_id', matchupData.id)
        .eq('voter_id', voterId)
        .single()

      if (existingVote) {
        setHasVoted(true)
      }
    } catch (err) {
      console.error('Error loading matchup:', err)
      setError('Failed to load this month\'s flavors. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function submitVote() {
    if (!favorite || rating1 === 0 || rating2 === 0) return

    try {
      setSubmitting(true)
      const voterId = getVoterId()

      const { error: voteError } = await supabase
        .from('votes')
        .insert({
          matchup_id: matchup.id,
          office: office,
          favorite_flavor_id: favorite,
          flavor_1_rating: rating1,
          flavor_2_rating: rating2,
          voter_id: voterId,
        })

      if (voteError) throw voteError

      // Navigate to results
      navigate(`/results/${office}`)
    } catch (err) {
      console.error('Error submitting vote:', err)
      setError('Failed to submit your vote. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-500">Loading flavors...</div>
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

  if (hasVoted) {
    return (
      <div className="space-y-6 text-center">
        <div className="bg-green-50 text-green-700 rounded-xl p-6">
          <p className="font-medium">You've already voted this month!</p>
          <p className="text-sm mt-1">Check back next month for new flavors.</p>
        </div>
        <button
          onClick={() => navigate(`/results/${office}`)}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          View Results
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {officeName} Office - {getCurrentMonth()}
        </h2>
        <p className="text-slate-600">
          {step === 1 && "Which flavor is your favorite?"}
          {step === 2 && "Now rate each flavor from 1-5 stars"}
        </p>
      </div>

      {/* Step 1: Pick Favorite */}
      {step === 1 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FlavorCard
              flavor={flavor1}
              selected={favorite === flavor1.id}
              onClick={() => setFavorite(flavor1.id)}
              showSelection
            />
            <FlavorCard
              flavor={flavor2}
              selected={favorite === flavor2.id}
              onClick={() => setFavorite(flavor2.id)}
              showSelection
            />
          </div>

          <div className="text-center">
            <button
              onClick={() => setStep(2)}
              disabled={!favorite}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                favorite
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              Continue to Ratings
            </button>
          </div>
        </>
      )}

      {/* Step 2: Rate Both */}
      {step === 2 && (
        <>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {flavor1.image_url ? (
                    <img src={flavor1.image_url} alt={flavor1.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🥤</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{flavor1.name}</h3>
                  {favorite === flavor1.id && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                      Your Pick
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-center">
                <StarRating rating={rating1} onRatingChange={setRating1} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {flavor2.image_url ? (
                    <img src={flavor2.image_url} alt={flavor2.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🥤</span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{flavor2.name}</h3>
                  {favorite === flavor2.id && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                      Your Pick
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-center">
                <StarRating rating={rating2} onRatingChange={setRating2} />
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-lg font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Back
            </button>
            <button
              onClick={submitVote}
              disabled={rating1 === 0 || rating2 === 0 || submitting}
              className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                rating1 > 0 && rating2 > 0 && !submitting
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Vote'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default Vote
