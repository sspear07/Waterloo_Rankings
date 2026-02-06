import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import SentimentBadge from '../components/SentimentBadge'

function InternetRankings() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sentiments, setSentiments] = useState([])
  const [selectedFlavor, setSelectedFlavor] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)

      // Fetch sentiment data with flavor info
      const { data: sentimentData, error: sentimentError } = await supabase
        .from('flavor_sentiment')
        .select(`
          *,
          flavor:flavors(id, name, image_url)
        `)
        .order('sentiment_score', { ascending: false })

      if (sentimentError) throw sentimentError

      setSentiments(sentimentData || [])
    } catch (err) {
      console.error('Error loading sentiment data:', err)
      setError('Failed to load internet rankings.')
    } finally {
      setLoading(false)
    }
  }

  // Prepare diverging chart data
  // Convert sentiment score (-1 to 1) into positive/negative percentages
  const chartData = sentiments.map(s => {
    const positivePercent = ((s.sentiment_score + 1) / 2) * 100
    const negativePercent = -(100 - positivePercent)
    return {
      name: s.flavor?.name || 'Unknown',
      positive: Math.round(positivePercent),
      negative: Math.round(negativePercent),
      rawScore: s.sentiment_score,
      avgRating: s.avg_rating,
      reviewCount: s.comment_count,
      label: s.sentiment_label,
    }
  })

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null
    const data = payload[0].payload
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-sm">
        <p className="font-semibold text-slate-800">{data.name}</p>
        <p className="text-emerald-600">{data.positive}% positive</p>
        <p className="text-red-500">{Math.abs(data.negative)}% negative</p>
        <p className="text-amber-600">{'★'.repeat(Math.round(data.avgRating))} {data.avgRating.toFixed(1)}/5</p>
        <p className="text-slate-500">{data.reviewCount} reviews</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-slate-500">Loading internet rankings...</div>
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

  if (sentiments.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Internet Rankings
          </h2>
          <p className="text-slate-600">
            See what the internet thinks about each Waterloo flavor
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl p-8 text-center">
          <p className="text-slate-500">
            No sentiment data available yet. Check back soon!
          </p>
        </div>

        <div className="text-center">
          <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center -mt-2">
        <h2 className="text-2xl font-bold text-slate-800">
          Internet Rankings
        </h2>
        <p className="text-slate-500 text-sm">
          What Amazon reviewers think about each Waterloo flavor
        </p>
      </div>

      {/* Main content - two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left side - Rankings (3 columns) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Diverging Sentiment Chart */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Flavor Rankings by Public Sentiment
            </h3>
            <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-red-400 inline-block" /> Negative
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-sm bg-emerald-400 inline-block" /> Positive
              </span>
              <span className="flex items-center gap-1">
                <span className="text-amber-500">★</span> Avg Amazon Rating
              </span>
            </div>

            <ResponsiveContainer width="100%" height={chartData.length * 48 + 40}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 60, left: 110, bottom: 5 }}
                stackOffset="sign"
              >
                <XAxis
                  type="number"
                  domain={[-100, 100]}
                  tickFormatter={(v) => `${Math.abs(v)}%`}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  axisLine={false}
                  tickLine={false}
                  tick={({ x, y, payload }) => (
                    <text
                      x={x}
                      y={y}
                      textAnchor="end"
                      dominantBaseline="central"
                      fontSize={12}
                      fill={selectedFlavor && selectedFlavor !== payload.value ? '#cbd5e1' : '#334155'}
                      fontWeight={selectedFlavor === payload.value ? 600 : 400}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedFlavor(prev => prev === payload.value ? null : payload.value)}
                    >
                      {payload.value}
                    </text>
                  )}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} />
                <Bar
                  dataKey="negative"
                  stackId="stack"
                  radius={[4, 0, 0, 4]}
                  onClick={(data) => setSelectedFlavor(prev => prev === data.name ? null : data.name)}
                  style={{ cursor: 'pointer' }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`neg-${index}`}
                      fill={selectedFlavor && selectedFlavor !== entry.name ? '#fecaca' : '#f87171'}
                    />
                  ))}
                </Bar>
                <Bar
                  dataKey="positive"
                  stackId="stack"
                  radius={[0, 4, 4, 0]}
                  onClick={(data) => setSelectedFlavor(prev => prev === data.name ? null : data.name)}
                  style={{ cursor: 'pointer' }}
                  label={({ x, y, width, height, index }) => {
                    const rating = chartData[index]?.avgRating
                    if (!rating) return null
                    return (
                      <text
                        key={`label-${index}`}
                        x={x + width + 6}
                        y={y + height / 2}
                        fill="#d97706"
                        fontSize={11}
                        fontWeight={600}
                        dominantBaseline="central"
                      >
                        {'★'} {rating.toFixed(1)}
                      </text>
                    )
                  }}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`pos-${index}`}
                      fill={selectedFlavor && selectedFlavor !== entry.name ? '#a7f3d0' : '#34d399'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right side - Detailed breakdown (2 columns) */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {selectedFlavor ? selectedFlavor : 'Detailed Breakdown'}
              </h3>
              {selectedFlavor && (
                <button
                  onClick={() => setSelectedFlavor(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Show all
                </button>
              )}
            </div>

            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2">
              {sentiments
                .filter(s => !selectedFlavor || s.flavor?.name === selectedFlavor)
                .map((sentiment, index) => (
                <div
                  key={sentiment.id}
                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                >
                  {/* Rank */}
                  <div className="text-xl font-bold text-slate-300 w-6">
                    {index + 1}
                  </div>

                  {/* Flavor image */}
                  <div className="w-10 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    {sentiment.flavor?.image_url ? (
                      <img
                        src={sentiment.flavor.image_url}
                        alt={sentiment.flavor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">
                        🥤
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800 text-sm">
                        {sentiment.flavor?.name}
                      </span>
                      <SentimentBadge
                        label={sentiment.sentiment_label}
                        score={sentiment.sentiment_score}
                        size="sm"
                      />
                    </div>
                    {sentiment.avg_rating && (
                      <p className="text-sm text-amber-600 font-medium mb-1">
                        {'★'.repeat(Math.round(sentiment.avg_rating))}{'☆'.repeat(5 - Math.round(sentiment.avg_rating))} {sentiment.avg_rating.toFixed(1)}/5
                      </p>
                    )}
                    <p className="text-xs text-slate-600">
                      {sentiment.summary}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Based on {sentiment.comment_count} Amazon reviews
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Methodology */}
      <div className="bg-white rounded-xl shadow-md p-6 text-sm text-slate-500">
        <h3 className="text-base font-semibold text-slate-700 mb-2">Methodology</h3>
        <p>
          Reviews were collected from Amazon product listings for Waterloo Sparkling Water.
          Each review includes a star rating (1-5) and written text. Sentiment analysis was
          performed using OpenAI's GPT-4o-mini model, which scored each flavor's reviews on a
          scale from -1.0 (very negative) to 1.0 (very positive) and generated a summary of
          reviewer opinions. The diverging chart shows these sentiment scores as positive/negative
          percentages, alongside the average Amazon star rating for each flavor.
        </p>
      </div>

      {/* Back link */}
      <div className="text-center">
        <Link to="/" className="text-primary-600 hover:text-primary-700 font-medium">
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}

export default InternetRankings
