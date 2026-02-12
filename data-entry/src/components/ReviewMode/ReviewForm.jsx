import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { getData, acquireLock, releaseLock, approveReview, editAndResubmit } from '../../api/sheets'
import { useAuth } from '../../context/AuthContext'

function ReviewForm() {
  const { contextKey } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [stance, setStance] = useState(location.state?.stance || null)
  const [topic, setTopic] = useState(location.state?.topic || null)

  const [isEditing, setIsEditing] = useState(false)
  const [editedValue, setEditedValue] = useState(stance?.value || '')
  const [editedReasoning, setEditedReasoning] = useState(stance?.reasoning || '')
  const [editedSources, setEditedSources] = useState(
    Array.isArray(stance?.sources) ? stance.sources.join('; ') : (stance?.sources || '')
  )

  const [loading, setLoading] = useState(!location.state?.stance)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [lockAcquired, setLockAcquired] = useState(false)

  useEffect(() => {
    if (!location.state?.stance) {
      loadData()
    } else if (stance?.id) {
      tryAcquireLock(stance.id)
    }

    return () => {
      if (lockAcquired && stance?.id) {
        releaseLock(stance.id).catch(() => {})
      }
    }
  }, [contextKey])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getData()

      const decodedKey = decodeURIComponent(contextKey)
      const foundStance = data.stances.find(s => s.context_key === decodedKey)
      const foundTopic = foundStance ? data.topics.find(t => t.topic_key === foundStance.topic_key) : null

      if (!foundStance) {
        setError('Stance not found')
        return
      }

      setStance(foundStance)
      setTopic(foundTopic)
      setEditedValue(foundStance.value)
      setEditedReasoning(foundStance.reasoning)
      setEditedSources(
        Array.isArray(foundStance.sources) ? foundStance.sources.join('; ') : (foundStance.sources || '')
      )

      if (foundStance.id) {
        await tryAcquireLock(foundStance.id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const tryAcquireLock = async (id) => {
    try {
      await acquireLock(id)
      setLockAcquired(true)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleApprove = async () => {
    try {
      setSaving(true)
      setError(null)
      await approveReview(stance.id)
      navigate('/review')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleEditAndResubmit = async () => {
    if (!editedValue) {
      setError('Please select a stance')
      return
    }

    try {
      setSaving(true)
      setError(null)

      const sourcesArray = editedSources
        .split(';')
        .map(s => s.trim())
        .filter(Boolean)

      await editAndResubmit(stance.id, {
        value: editedValue,
        reasoning: editedReasoning,
        sources: sourcesArray
      })

      navigate('/review')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const getStanceText = (stanceValue) => {
    if (!topic) return `Stance ${stanceValue}`
    const found = (topic.stances || []).find(s => s.value === stanceValue)
    return found ? found.text : `Stance ${stanceValue}`
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!stance || !topic) {
    return (
      <div className="error-container">
        <p className="error">{error || 'Stance not found'}</p>
        <Link to="/review" className="btn-secondary">Back to Queue</Link>
      </div>
    )
  }

  const stanceOptions = (topic.stances || []).map(s => ({
    value: s.value,
    text: s.text
  }))

  return (
    <div className="review-form">
      <div className="page-header">
        <div>
          <h1>Review: {stance.politician_name}</h1>
          <p className="issue-title">{topic.title}</p>
        </div>
        <Link to="/review" className="btn-secondary">Back to Queue</Link>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="review-content">
        <div className="review-meta-info">
          <p><strong>Author:</strong> {stance.added_by}</p>
          {stance.review_count > 0 && (
            <p><strong>Current approvals:</strong> {stance.review_count}/2</p>
          )}
          {Array.isArray(stance.reviewed_by) && stance.reviewed_by.length > 0 && (
            <p><strong>Reviewed by:</strong> {stance.reviewed_by.join(', ')}</p>
          )}
        </div>

        {!isEditing ? (
          <>
            <div className="current-stance">
              {topic.start_phrase && (
                <p className="start-phrase">{topic.start_phrase}</p>
              )}
              <div className="stance-display">
                <span className="stance-number">{stance.value}</span>
                <span className="stance-text">{getStanceText(stance.value)}</span>
              </div>
            </div>

            {stance.reasoning && (
              <div className="reasoning-display">
                <h3>Reasoning</h3>
                <p>{stance.reasoning}</p>
              </div>
            )}

            {stance.sources && (Array.isArray(stance.sources) ? stance.sources : []).length > 0 && (
              <div className="sources-display">
                <h3>Sources</h3>
                <ul>
                  {stance.sources.map((source, i) => (
                    <li key={i}>
                      <a href={source.trim()} target="_blank" rel="noopener noreferrer">
                        {source.trim()}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="review-actions">
              <button
                onClick={handleApprove}
                disabled={saving || !lockAcquired}
                className="btn-primary"
              >
                {saving ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                disabled={saving || !lockAcquired}
                className="btn-secondary"
              >
                Edit & Resubmit
              </button>
            </div>
          </>
        ) : (
          <>
            {topic.start_phrase && (
              <p className="start-phrase">{topic.start_phrase}</p>
            )}

            <div className="stance-selector">
              <label>Select Stance</label>
              {stanceOptions.map(opt => (
                <label key={opt.value} className={`stance-option ${editedValue == opt.value ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="stance"
                    value={opt.value}
                    checked={editedValue == opt.value}
                    onChange={(e) => setEditedValue(Number(e.target.value))}
                  />
                  <span className="stance-number">{opt.value}</span>
                  <span className="stance-text">{opt.text}</span>
                </label>
              ))}
            </div>

            <div className="form-group">
              <label htmlFor="reasoning">Reasoning</label>
              <textarea
                id="reasoning"
                value={editedReasoning}
                onChange={(e) => setEditedReasoning(e.target.value)}
                placeholder="Explain why this politician holds this position..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="sources">Sources (semicolon-separated URLs)</label>
              <textarea
                id="sources"
                value={editedSources}
                onChange={(e) => setEditedSources(e.target.value)}
                placeholder="https://example.com/article1; https://example.com/article2"
                rows={2}
              />
            </div>

            <div className="form-actions">
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleEditAndResubmit}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Submitting...' : 'Submit as New Author'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ReviewForm
