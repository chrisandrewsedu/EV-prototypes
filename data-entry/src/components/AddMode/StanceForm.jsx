import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { getData, addStance, updateStance, submitForReview, acquireLock, releaseLock } from '../../api/sheets'
import { useAuth } from '../../context/AuthContext'

function StanceForm() {
  const { politicianId, topicKey } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [politician, setPolitician] = useState(location.state?.politician || null)
  const [topic, setTopic] = useState(location.state?.topic || null)
  const [existingStance, setExistingStance] = useState(location.state?.stance || null)

  const [selectedValue, setSelectedValue] = useState(existingStance?.value || '')
  const [reasoning, setReasoning] = useState(existingStance?.reasoning || '')
  const [sources, setSources] = useState(
    Array.isArray(existingStance?.sources) ? existingStance.sources.join('; ') : (existingStance?.sources || '')
  )

  const [loading, setLoading] = useState(!location.state?.topic)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [lockError, setLockError] = useState(null)

  useEffect(() => {
    if (!location.state?.topic) {
      loadData()
    } else if (existingStance?.id) {
      tryAcquireLock()
    }

    return () => {
      if (existingStance?.id) {
        releaseLock(existingStance.id).catch(() => {})
      }
    }
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getData()

      const foundPolitician = data.politicians.find(p => {
        const id = p.external_id || `new_${p.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${p.id}`
        return id === politicianId || decodeURIComponent(politicianId) === id
      })

      const foundTopic = data.topics.find(t => t.topic_key === topicKey)

      const foundStance = data.stances.find(s =>
        s.topic_key === topicKey &&
        (s.politician_external_id === (foundPolitician?.external_id || politicianId) ||
         s.politician_name === foundPolitician?.full_name)
      )

      setPolitician(foundPolitician)
      setTopic(foundTopic)
      setExistingStance(foundStance)

      if (foundStance) {
        setSelectedValue(foundStance.value)
        setReasoning(foundStance.reasoning)
        setSources(Array.isArray(foundStance.sources) ? foundStance.sources.join('; ') : (foundStance.sources || ''))

        if (foundStance.id) {
          try {
            await acquireLock(foundStance.id)
          } catch (err) {
            setLockError(err.message)
          }
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const tryAcquireLock = async () => {
    try {
      await acquireLock(existingStance.id)
    } catch (err) {
      setLockError(err.message)
    }
  }

  const parseSources = () => {
    return sources
      .split(';')
      .map(s => s.trim())
      .filter(Boolean)
  }

  const handleSaveDraft = async () => {
    if (!selectedValue) {
      setError('Please select a stance')
      return
    }

    try {
      setSaving(true)
      setError(null)

      if (existingStance?.id) {
        await updateStance(existingStance.id, {
          value: selectedValue,
          reasoning,
          sources: parseSources()
        })
      } else {
        await addStance({
          politician_name: politician.full_name,
          politician_external_id: politician.external_id || undefined,
          topic_key: topic.topic_key,
          value: selectedValue,
          reasoning,
          sources: parseSources()
        })
      }

      navigate(`/add/politician/${encodeURIComponent(politicianId)}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSubmitForReview = async () => {
    if (!selectedValue) {
      setError('Please select a stance')
      return
    }

    try {
      setSaving(true)
      setError(null)

      if (existingStance?.id) {
        await updateStance(existingStance.id, {
          value: selectedValue,
          reasoning,
          sources: parseSources()
        })
        await submitForReview(existingStance.id)
      } else {
        const result = await addStance({
          politician_name: politician.full_name,
          politician_external_id: politician.external_id || undefined,
          topic_key: topic.topic_key,
          value: selectedValue,
          reasoning,
          sources: parseSources()
        })

        if (result.id) {
          await submitForReview(result.id)
        }
      }

      navigate(`/add/politician/${encodeURIComponent(politicianId)}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!politician || !topic) {
    return (
      <div className="error-container">
        <p className="error">Politician or topic not found</p>
        <Link to="/add/queue" className="btn-secondary">Back to Queue</Link>
      </div>
    )
  }

  const stanceOptions = (topic.stances || []).map(s => ({
    value: s.value,
    text: s.text
  }))

  const canEdit = !existingStance || existingStance.status === 'draft' || existingStance.added_by === user.user_id
  const isLocked = lockError !== null

  return (
    <div className="stance-form">
      <div className="page-header">
        <div>
          <h1>{politician.full_name}</h1>
          <p className="issue-title">{topic.title}</p>
        </div>
        <Link to={`/add/politician/${encodeURIComponent(politicianId)}`} className="btn-secondary">
          Back to Issues
        </Link>
      </div>

      {lockError && (
        <div className="warning-banner">
          {lockError}
        </div>
      )}

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <div className="form-content">
        {topic.start_phrase && (
          <p className="start-phrase">{topic.start_phrase}</p>
        )}

        <div className="stance-selector">
          <label>Select Stance</label>
          {stanceOptions.map(opt => (
            <label key={opt.value} className={`stance-option ${selectedValue == opt.value ? 'selected' : ''}`}>
              <input
                type="radio"
                name="stance"
                value={opt.value}
                checked={selectedValue == opt.value}
                onChange={(e) => setSelectedValue(Number(e.target.value))}
                disabled={isLocked && !canEdit}
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
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            placeholder="Explain why this politician holds this position..."
            rows={4}
            disabled={isLocked && !canEdit}
          />
        </div>

        <div className="form-group">
          <label htmlFor="sources">Sources (semicolon-separated URLs)</label>
          <textarea
            id="sources"
            value={sources}
            onChange={(e) => setSources(e.target.value)}
            placeholder="https://example.com/article1; https://example.com/article2"
            rows={2}
            disabled={isLocked && !canEdit}
          />
        </div>

        {canEdit && !isLocked && (
          <div className="form-actions">
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="btn-secondary"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSubmitForReview}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default StanceForm
