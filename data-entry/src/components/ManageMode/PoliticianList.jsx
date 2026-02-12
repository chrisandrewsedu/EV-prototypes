import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getData } from '../../api/sheets'
import { useAuth } from '../../context/AuthContext'

const OFFICE_LEVEL_LABELS = {
  federal: 'Federal',
  state: 'State',
  local: 'Local',
  municipal: 'Municipal',
  school_district: 'School District'
}

function PoliticianList() {
  const { user } = useAuth()
  const [politicians, setPoliticians] = useState([])
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
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const offices = [...new Set(politicians.map(p => p.office).filter(Boolean))].sort()
  const levels = [...new Set(politicians.map(p => p.office_level).filter(Boolean))].sort()
  const states = [...new Set(politicians.map(p => p.state).filter(Boolean))].sort()

  const filteredPoliticians = politicians.filter(p => {
    const matchesSearch = !searchTerm ||
      (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.district && p.district.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesOffice = !filterOffice || p.office === filterOffice
    const matchesLevel = !filterLevel || p.office_level === filterLevel
    const matchesState = !filterState || p.state === filterState

    return matchesSearch && matchesOffice && matchesLevel && matchesState
  })

  // Format the location display
  const formatLocation = (politician) => {
    const parts = []
    if (politician.state) parts.push(politician.state)
    if (politician.district) parts.push(`District ${politician.district}`)
    return parts.join(' - ')
  }

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
    <div className="politician-list-page">
      <div className="page-header">
        <h1>Manage Politicians</h1>
        <Link to="/manage/add" className="btn-primary">Add Politician</Link>
      </div>

      <div className="filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name or district..."
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
        Showing {filteredPoliticians.length} of {politicians.length} politicians
      </p>

      {filteredPoliticians.length === 0 ? (
        <div className="empty-state">
          {searchTerm || filterOffice || filterLevel || filterState
            ? 'No politicians match your filters.'
            : 'No politicians added yet.'}
        </div>
      ) : (
        <div className="manage-politician-list">
          {filteredPoliticians.map((politician, index) => (
            <div key={politician.external_id || index} className="manage-politician-card">
              <div className="politician-info">
                <h3>{politician.full_name}</h3>
                <p className="politician-meta">
                  {politician.office && <span className="office">{politician.office}</span>}
                  {(politician.state || politician.district) && (
                    <span className="location">{formatLocation(politician)}</span>
                  )}
                </p>
              </div>
              {politician.added_by && (
                <div className="added-by">
                  {politician.added_by === user.user_id ? 'Added by you' : 'Added by volunteer'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PoliticianList
