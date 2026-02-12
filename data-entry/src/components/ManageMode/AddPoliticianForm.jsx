import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { addPolitician } from '../../api/sheets'

const PARTIES = [
  'Democrat',
  'Republican',
  'Independent',
  'Libertarian',
  'Green',
  'Unknown',
  'Other'
]

const OFFICES = [
  { value: 'US President', label: 'US President', level: 'federal' },
  { value: 'US Senate', label: 'US Senate', level: 'federal' },
  { value: 'US House', label: 'US House', level: 'federal' },
  { value: 'Governor', label: 'Governor', level: 'state' },
  { value: 'State Senate', label: 'State Senate', level: 'state' },
  { value: 'State House', label: 'State House/Assembly', level: 'state' },
  { value: 'Mayor', label: 'Mayor', level: 'municipal' },
  { value: 'City Council', label: 'City Council', level: 'municipal' },
  { value: 'School Board', label: 'School Board', level: 'school_district' },
  { value: 'Other', label: 'Other', level: '' }
]

const OFFICE_LEVELS = [
  { value: 'federal', label: 'Federal' },
  { value: 'state', label: 'State' },
  { value: 'municipal', label: 'Municipal' },
  { value: 'school_district', label: 'School District' }
]

const STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'Washington D.C.' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'National', label: 'National (for US President)' }
]

function AddPoliticianForm() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [party, setParty] = useState('')
  const [customParty, setCustomParty] = useState('')
  const [office, setOffice] = useState('')
  const [customOffice, setCustomOffice] = useState('')
  const [officeLevel, setOfficeLevel] = useState('')
  const [state, setState] = useState('')
  const [district, setDistrict] = useState('')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // When office changes, auto-set the office level
  const handleOfficeChange = (newOffice) => {
    setOffice(newOffice)
    const selectedOffice = OFFICES.find(o => o.value === newOffice)
    if (selectedOffice && selectedOffice.level) {
      setOfficeLevel(selectedOffice.level)
    } else {
      setOfficeLevel('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }

    if (!office) {
      setError('Office is required')
      return
    }

    if (!state) {
      setError('State is required')
      return
    }

    const finalParty = party === 'Other' ? customParty : party
    const finalOffice = office === 'Other' ? customOffice : office

    try {
      setSaving(true)
      setError(null)

      await addPolitician({
        full_name: fullName.trim(),
        party: finalParty,
        office: finalOffice,
        office_level: officeLevel,
        state: state,
        district: district.trim()
      })

      navigate('/manage')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  // Determine if district field should show based on office type
  const showDistrictField = office && !['US President', 'Governor', 'US Senate'].includes(office)

  // Show office level dropdown only for "Other" office
  const showOfficeLevelField = office === 'Other'

  return (
    <div className="add-politician-form">
      <div className="page-header">
        <h1>Add Politician</h1>
        <Link to="/manage" className="btn-secondary">Back to List</Link>
      </div>

      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-content">
        <div className="form-group">
          <label htmlFor="fullName">Full Name *</label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g., John Smith"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="party">Party</label>
          <select
            id="party"
            value={party}
            onChange={(e) => setParty(e.target.value)}
          >
            <option value="">Select a party...</option>
            {PARTIES.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {party === 'Other' && (
          <div className="form-group">
            <label htmlFor="customParty">Custom Party Name</label>
            <input
              type="text"
              id="customParty"
              value={customParty}
              onChange={(e) => setCustomParty(e.target.value)}
              placeholder="Enter party name"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="office">Office *</label>
          <select
            id="office"
            value={office}
            onChange={(e) => handleOfficeChange(e.target.value)}
            required
          >
            <option value="">Select an office...</option>
            {OFFICES.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {office === 'Other' && (
          <div className="form-group">
            <label htmlFor="customOffice">Custom Office Name</label>
            <input
              type="text"
              id="customOffice"
              value={customOffice}
              onChange={(e) => setCustomOffice(e.target.value)}
              placeholder="Enter office name"
            />
          </div>
        )}

        {showOfficeLevelField && (
          <div className="form-group">
            <label htmlFor="officeLevel">Office Level</label>
            <select
              id="officeLevel"
              value={officeLevel}
              onChange={(e) => setOfficeLevel(e.target.value)}
            >
              <option value="">Select a level...</option>
              {OFFICE_LEVELS.map(level => (
                <option key={level.value} value={level.value}>{level.label}</option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="state">State *</label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            required
          >
            <option value="">Select a state...</option>
            {STATES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {showDistrictField && (
          <div className="form-group">
            <label htmlFor="district">District</label>
            <input
              type="text"
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g., 12, District 5, Ward 3, At-Large"
            />
            <span className="form-hint">Leave blank if not applicable</span>
          </div>
        )}

        <div className="form-actions">
          <Link to="/manage" className="btn-secondary">Cancel</Link>
          <button
            type="submit"
            disabled={saving || !fullName.trim() || !office || !state}
            className="btn-primary"
          >
            {saving ? 'Adding...' : 'Add Politician'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddPoliticianForm
