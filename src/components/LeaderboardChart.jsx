import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

function LeaderboardChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center text-slate-500">
        No votes yet. Be the first to vote!
      </div>
    )
  }

  // Sort by average rating descending
  const sortedData = [...data].sort((a, b) => b.avgRating - a.avgRating)

  // Color gradient from gold to slate
  const colors = [
    '#fbbf24', // amber-400 (1st)
    '#f59e0b', // amber-500 (2nd)
    '#d97706', // amber-600 (3rd)
    '#64748b', // slate-500 (rest)
  ]

  const getColor = (index) => {
    return colors[Math.min(index, colors.length - 1)]
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Flavor Rankings by Average Rating
      </h3>

      <ResponsiveContainer width="100%" height={sortedData.length * 50 + 40}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <XAxis type="number" domain={[0, 5]} />
          <YAxis
            type="category"
            dataKey="name"
            width={90}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            formatter={(value) => [value.toFixed(2), 'Avg Rating']}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Bar dataKey="avgRating" radius={[0, 4, 4, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(index)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {sortedData.map((flavor, index) => (
          <div key={flavor.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-800">
                #{index + 1} {flavor.name}
              </span>
            </div>
            <div className="text-slate-500">
              {flavor.totalVotes} votes · {flavor.wins} wins
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default LeaderboardChart
