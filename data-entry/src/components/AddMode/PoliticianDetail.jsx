import { useState, useEffect } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { getData } from '../../api/sheets'
import { useAuth } from '../../context/AuthContext'

function PoliticianDetail() {
  const { politicianId } = useParams()
  const location = useLocation()
  const { user } = useAuth()

  const [politician, setPolitician] = useState(location.state?.politician || null)
  const [topics, setTopics] = useState(location.state?.topics || [])
  const [stances, setStances] = useState(location.state?.stances || [])
  const [loading, setLoading] = useState(!location.state)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!location.state) {
      loadData()
    }
  }, [politicianId])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getData()
      setTopics(data.topics)
      setStances(data.stances)

      // Find the politician
      const found = data.politicians.find(p => {
        const id = p.external_id || `new_${p.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${p.id}`
        return id === politicianId || decodeURIComponent(politicianId) === id
      })

      if (found) {
        setPolitician(found)
      } else {
        setError('Politician not found')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStanceForTopic = (topic) => {
    return stances.find(s =>
      s.topic_key === topic.topic_key &&
      (s.politician_external_id === (politician?.external_id || politicianId) ||
       s.politician_name === politician?.full_name)
    )
  }

  const getStatusIcon = (stance) => {
    if (!stance) return { icon: '\u25CB', label: 'Missing', class: 'missing' }
    if (stance.status === 'approved') return { icon: '\u2713', label: 'Approved', class: 'approved' }
    if (stance.status === 'needs_review') return { icon: '\u23F3', label: 'Needs Review', class: 'review' }
    if (stance.added_by === user.user_id) return { icon: '\u270E', label: 'Your Draft', class: 'draft' }
    return { icon: '\u270E', label: 'Draft', class: 'draft' }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error">Error: {error}</p>
        <Link to="/add/queue" className="btn-secondary">Back to Queue</Link>
      </div>
    )
  }

  if (!politician) {
    return (
      <div className="error-container">
        <p className="error">Politician not found</p>
        <Link to="/add/queue" className="btn-secondary">Back to Queue</Link>
      </div>
    )
  }

  return (
    <div className="politician-detail">
      <div className="page-header">
        <div>
          <h1>{politician.full_name}</h1>
          <p className="politician-meta">
            {politician.office}
            {politician.office_level && ` (${politician.office_level})`}
            {politician.state && ` \u00B7 ${politician.state}`}
          </p>
        </div>
        <Link to="/add/queue" className="btn-secondary">Back to Queue</Link>
      </div>

      <div className="issues-list">
        {topics.map(topic => {
          const stance = getStanceForTopic(topic)
          const status = getStatusIcon(stance)

          return (
            <Link
              key={topic.topic_key}
              to={`/add/stance/${encodeURIComponent(politicianId)}/${topic.topic_key}`}
              className={`issue-card ${status.class}`}
              state={{ politician, topic, stance }}
            >
              <div className="issue-status">
                <span className={`status-icon ${status.class}`}>{status.icon}</span>
              </div>
              <div className="issue-info">
                <h3>{topic.title}</h3>
                <p className="issue-status-label">{status.label}</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default PoliticianDetail
