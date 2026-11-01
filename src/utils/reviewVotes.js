// ---------------------------------------------------------------------------
// reviewVotes.js — Store & manage Thumbs Up / Thumbs Down reactions for reviews
// ---------------------------------------------------------------------------

const REACTION_KEY = 'bore_barrel_review_reactions'

const getStoredVotes = () => {
  try {
    const raw = localStorage.getItem(REACTION_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const saveStoredVotes = (data) => {
  try {
    localStorage.setItem(REACTION_KEY, JSON.stringify(data))
  } catch (err) {
    console.error('Failed to save review votes:', err)
  }
}

/**
 * Get current vote statistics for a given review ID
 */
export const getReviewVote = (reviewId) => {
  const map = getStoredVotes()
  const entry = map[String(reviewId)]
  return entry || { thumbsUp: 0, thumbsDown: 0, userVote: null }
}

/**
 * Toggle or cast vote ('up' | 'down') for a review
 */
export const voteReview = (reviewId, type) => {
  const map = getStoredVotes()
  const key = String(reviewId)
  const current = map[key] || { thumbsUp: 0, thumbsDown: 0, userVote: null }

  let { thumbsUp, thumbsDown, userVote } = current

  if (userVote === type) {
    // Untoggle
    if (type === 'up') thumbsUp = Math.max(0, thumbsUp - 1)
    if (type === 'down') thumbsDown = Math.max(0, thumbsDown - 1)
    userVote = null
  } else {
    // If switching from the other vote
    if (userVote === 'up') thumbsUp = Math.max(0, thumbsUp - 1)
    if (userVote === 'down') thumbsDown = Math.max(0, thumbsDown - 1)

    if (type === 'up') thumbsUp += 1
    if (type === 'down') thumbsDown += 1
    userVote = type
  }

  map[key] = { thumbsUp, thumbsDown, userVote }
  saveStoredVotes(map)
  return map[key]
}

export default {
  getReviewVote,
  voteReview,
}
