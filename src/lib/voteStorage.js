const VOTER_ID_KEY = 'waterloo_voter_id'

// Generate a random UUID for voter identification
function generateVoterId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Get or create a voter ID stored in localStorage
export function getVoterId() {
  let voterId = localStorage.getItem(VOTER_ID_KEY)

  if (!voterId) {
    voterId = generateVoterId()
    localStorage.setItem(VOTER_ID_KEY, voterId)
  }

  return voterId
}

// Get the current month in YYYY-MM format
export function getCurrentMonth() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}
