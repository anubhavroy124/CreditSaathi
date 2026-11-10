import { useState, useRef, useEffect } from 'react'
import './App.css'

function App() {
  const [businessType, setBusinessType] = useState('')
  const [location, setLocation] = useState('')
  const [fundingAmount, setFundingAmount] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [summary, setSummary] = useState(null)

  const confirmationRef = useRef(null)
  const firstInputRef = useRef(null)

  // When a valid summary is generated, smoothly bring the confirmation card into view
  useEffect(() => {
    if (summary && confirmationRef.current) {
      confirmationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [summary])

  const handleSubmit = (event) => {
    // Prevent the default browser behavior, which reloads the page on form submit
    event.preventDefault()

    // Validate required fields
    if (!businessType.trim() || !location.trim() || !fundingAmount) {
      setErrorMessage('Please fill in your business type, location, and funding amount.')
      setSummary(null)
      return
    }

    // Clear any previous error and show the summary
    setErrorMessage('')
    setSummary({
      businessType: businessType.trim(),
      location: location.trim(),
      fundingAmount: fundingAmount.trim(),
      documentName: documentName || 'None attached (optional)',
    })
  }

  const handleEditDetails = () => {
    if (firstInputRef.current) {
      firstInputRef.current.focus()
      firstInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="/">
          <img
            className="brand-logo"
            src="/creditsaathi-logo.png"
            alt="CreditSaathi"
          />
        </a>
        <span className="prototype-label">MSME credit readiness</span>
      </header>

      <main className="dashboard">
        <section className="welcome">
          <p className="eyebrow">YOUR BUSINESS, READY FOR WHAT’S NEXT</p>
          <h1>Let’s get your business credit-ready.</h1>
          <p className="intro">
            Tell us a little about your business. We’ll help organize your
            information and show you what to prepare.
          </p>

          <form className="profile-form" onSubmit={handleSubmit}>
            <label>
              What kind of business do you run?
              <input
                ref={firstInputRef}
                type="text"
                placeholder="For example, a tailoring shop"
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                required
              />
            </label>

            <label>
              Where is your business located?
              <input
                type="text"
                placeholder="City or district, state"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </label>

            <label>
              How much funding are you exploring?
              <div className="amount-input">
                <span>₹</span>
                <input
                  type="number"
                  placeholder="300000"
                  min="1"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  required
                />
              </div>
            </label>

            <label>
              Add a business document
              <input
                type="file"
                accept=".pdf,.csv,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0]
                  setDocumentName(file ? file.name : '')
                }}
              />
              <span className="hint">
                You can begin without a document and add one later.
              </span>
            </label>

            {errorMessage && (
              <p className="form-error" role="alert">
                {errorMessage}
              </p>
            )}

            <button type="submit">Continue</button>
          </form>

          {summary && (
            <section
              ref={confirmationRef}
              className="confirmation-card"
              role="status"
              aria-live="polite"
            >
              <span className="confirmation-badge">Preview only</span>
              <h2>Preview of Your Details</h2>
              <dl className="summary-list">
                <div className="summary-row">
                  <dt>Business Type</dt>
                  <dd>{summary.businessType}</dd>
                </div>
                <div className="summary-row">
                  <dt>Location</dt>
                  <dd>{summary.location}</dd>
                </div>
                <div className="summary-row">
                  <dt>Funding Exploring</dt>
                  <dd>
                    ₹{Number(summary.fundingAmount).toLocaleString('en-IN')}
                  </dd>
                </div>
                <div className="summary-row">
                  <dt>Attached Document</dt>
                  <dd>{summary.documentName}</dd>
                </div>
              </dl>

              <div className="confirmation-actions">
                <button
                  type="button"
                  className="edit-details-btn"
                  onClick={handleEditDetails}
                >
                  Edit details
                </button>
              </div>

              <p className="confirmation-note">
                These details are only shown on this page for this preview.
                Nothing has been saved, submitted, or sent anywhere.
              </p>
            </section>
          )}
        </section>

        <aside className="progress-card">
          <p className="eyebrow">YOUR READINESS JOURNEY</p>
          <h2>Small steps, made clearer.</h2>
          <ol>
            <li className="current">Tell us about your business</li>
            <li>Organize your records</li>
            <li>Explore possible routes</li>
            <li>Review your readiness checklist</li>
          </ol>
          <p className="note">
            CreditSaathi helps you prepare. Lenders and scheme authorities make
            all eligibility and approval decisions.
          </p>
        </aside>
      </main>
    </div>
  )
}

export default App