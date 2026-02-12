import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getData } from '../../api/sheets'

const OFFICE_LEVEL_LABELS = {
  federal: 'Federal',
  state: 'State',
  local: 'Local'
}

function WorkQueue() {
  const [politicians, setPoliticians] = useState([])
  const [topics, setTopics] = useState([])
  const [stances, setStances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOffice, setFilterOffice] = useState('')
  const [filterLevel, setFilterLevel] = useState('')
  const [filterState, setFilterState] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getData()
      setPoliticians(data.politicians)
      setTopics(data.topics)
      setStances(data.stances)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getPoliticianId = (politician) => {
    return politician.external_id || `new_${politician.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${politician.id}`
  }

  const getCompletionStatus = (politician) => {
    const politicianId = politician.external_id || getPoliticianId(politician)
    const politicianStances = stances.filter(s =>
      s.politician_external_id === politicianId ||
      s.politician_name === politician.full_name
    )
    return {
      completed: politicianStances.length,
      total: topics.length
    }
  }

  const offices = [...new Set(politicians.map(p => p.office).filter(Boolean))].sort()
  const levels = [...new Set(politicians.map(p => p.office_level).filter(Boolean))].sort()
  const states = [...new Set(politicians.map(p => p.state).filter(Boolean))].sort()

  const filteredPoliticians = politicians.filter(p => {
    const matchesSearch = !searchTerm ||
      (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.office || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesOffice = !filterOffice || p.office === filterOffice
    const matchesLevel = !filterLevel || p.office_level === filterLevel
    const matchesState = !filterState || p.state === filterState

    return matchesSearch && matchesOffice && matchesLevel && matchesState
  })

  // Sort by completion (least complete first)
  const sortedPoliticians = [...filteredPoliticians].sort((a, b) => {
    const statusA = getCompletionStatus(a)
    const statusB = getCompletionStatus(b)
    return (statusA.completed / statusA.total) - (statusB.completed / statusB.total)
  })

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error">Error: {error}</p>
        <button onClick={loadData}>Retry</button>
      </div>
    )
  }

  return (
    <div className="work-queue">
      <div className="page-header">
        <h1>Work Queue</h1>
        <Link to="/add" className="btn-secondary">Back to Dashboard</Link>
      </div>

      <div className="filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or office..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-row">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <option value="">All Levels</option>
            {levels.map(level => (
              <option key={level} value={level}>{OFFICE_LEVEL_LABELS[level] || level}</option>
            ))}
          </select>
          <select
            value={filterOffice}
            onChange={(e) => setFilterOffice(e.target.value)}
          >
            <option value="">All Offices</option>
            {offices.map(office => (
              <option key={office} value={office}>{office}</option>
            ))}
          </select>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
          >
            <option value="">All States</option>
            {states.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
      </div>

      <p className="results-count">
        Showing {sortedPoliticians.length} of {politicians.length} politicians
      </p>

      {sortedPoliticians.length === 0 ? (
        <div className="empty-state">
          {searchTerm || filterOffice || filterLevel || filterState
            ? 'No politicians match your filters.'
            : 'No politicians found.'}
        </div>
      ) : (
        <div className="politician-list">
          {sortedPoliticians.map(politician => {
            const status = getCompletionStatus(politician)
            const politicianId = getPoliticianId(politician)
            const isComplete = status.completed === status.total

            return (
              <Link
                key={politicianId}
                to={`/add/politician/${encodeURIComponent(politicianId)}`}
                className={`politician-card ${isComplete ? 'complete' : ''}`}
                state={{ politician, topics, stances }}
              >
                <div className="politician-info">
                  <h3>{politician.full_name}</h3>
                  <p className="politician-meta">
                    {politician.office}
                    {politician.office_level && ` (${OFFICE_LEVEL_LABELS[politician.office_level] || politician.office_level})`}
                    {politician.state && ` \u00B7 ${politician.state}`}
                  </p>
                </div>
                <div className="completion-badge">
                  {status.completed} of {status.total} issues
                  {isComplete && <span className="complete-check"> &#10003;</span>}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default WorkQueue
