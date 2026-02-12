import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getData } from '../../api/sheets'
import { useAuth } from '../../context/AuthContext'

function AddDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadStats()
  }, [user.user_id])

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getData()

      // Calculate stats
      const myDrafts = data.stances.filter(s => s.added_by === user.user_id && s.status === 'draft').length
      const needsReview = data.stances.filter(s => s.status === 'needs_review').length
      const approved = data.stances.filter(s => s.status === 'approved').length
      const totalPossible = data.politicians.length * data.topics.length
      const totalEntered = data.stances.length

      setStats({
        myDrafts,
        needsReview,
        approved,
        totalPossible,
        totalEntered,
        missing: totalPossible - totalEntered
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error">Error: {error}</p>
        <button onClick={loadStats}>Retry</button>
      </div>
    )
  }

  return (
    <div className="add-dashboard">
      <h1>Add Stances</h1>
      <p className="subtitle">Fill in missing politician-issue combinations</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.myDrafts}</div>
          <div className="stat-label">My Drafts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.needsReview}</div>
          <div className="stat-label">Awaiting Review</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.approved}</div>
          <div className="stat-label">Approved</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.missing}</div>
          <div className="stat-label">Missing</div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div
            className="progress-fill approved"
            style={{ width: `${(stats.approved / stats.totalPossible) * 100}%` }}
          />
          <div
            className="progress-fill review"
            style={{ width: `${(stats.needsReview / stats.totalPossible) * 100}%` }}
          />
          <div
            className="progress-fill draft"
            style={{ width: `${((stats.totalEntered - stats.approved - stats.needsReview) / stats.totalPossible) * 100}%` }}
          />
        </div>
        <div className="progress-legend">
          <span><span className="dot approved"></span> Approved</span>
          <span><span className="dot review"></span> Needs Review</span>
          <span><span className="dot draft"></span> Drafts</span>
        </div>
      </div>

      <Link to="/add/queue" className="btn-primary btn-large">
        Start Working
      </Link>
    </div>
  )
}

export default AddDashboard
