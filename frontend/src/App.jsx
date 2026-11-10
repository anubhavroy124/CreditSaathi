import { useState, useRef, useEffect } from 'react'
import './App.css'

const RECORD_CHECKLIST = [
  {
    id: 'registration',
    title: 'Business registration or ownership proof',
    desc: 'Examples: Udyam registration, Shop & Establishment license, Trade license, Partnership deed, or GST certificate.',
  },
  {
    id: 'bank_statements',
    title: 'Recent bank statements',
    desc: 'Examples: Last 6 to 12 months of official statements from your primary business operating account.',
  },
  {
    id: 'sales_records',
    title: 'Sales and expense records',
    desc: 'Examples: Filed GST returns (GSTR-3B/1), sales invoices, supplier purchase bills, or basic profit and loss records.',
  },
  {
    id: 'funds_estimate',
    title: 'Estimate of how the funding will be used',
    desc: 'Examples: A simple outline of planned expenses (such as buying machinery, purchasing inventory, renovation, or working capital).',
  },
]

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [businessType, setBusinessType] = useState('')
  const [location, setLocation] = useState('')
  const [fundingAmount, setFundingAmount] = useState('')
  const [documentName, setDocumentName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [summary, setSummary] = useState(null)
  const [checkedRecords, setCheckedRecords] = useState({})

  const checkedCount = RECORD_CHECKLIST.filter((item) => checkedRecords[item.id]).length
  const totalCount = RECORD_CHECKLIST.length

  const confirmationRef = useRef(null)
  const firstInputRef = useRef(null)

  // When a valid summary is generated on step 1, smoothly bring the confirmation card into view
  useEffect(() => {
    if (currentStep === 1 && summary && confirmationRef.current) {
      confirmationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [summary, currentStep])

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
    setCurrentStep(1)
    setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus()
        firstInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 50)
  }

  const toggleRecordCheck = (id) => {
    setCheckedRecords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleGoToRecords = () => {
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToDetails = () => {
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
        {currentStep === 1 && (
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
                Add a business document (optional)
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
                    className="primary-action-btn"
                    onClick={handleGoToRecords}
                  >
                    Continue to organize records →
                  </button>
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
        )}

        {currentStep === 2 && (
          <section className="records-screen">
            <p className="eyebrow">STEP 2 OF 4 · RECORDS PREPARATION</p>
            <h1>Organize your business records.</h1>
            <p className="intro">
              Gathering your records in one place makes it easier to understand
              which financing options fit best and what lenders may request.
            </p>

            {summary && (
              <div className="records-context-bar">
                <div className="records-context-info">
                  <span>
                    Planning for: <strong>{summary.businessType}</strong> (
                    {summary.location})
                  </span>
                  <span>
                    Target funding:{' '}
                    <strong>
                      ₹{Number(summary.fundingAmount).toLocaleString('en-IN')}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  className="text-btn"
                  onClick={handleEditDetails}
                >
                  Edit details
                </button>
              </div>
            )}

            <div className="records-disclaimer">
              <p>
                <strong>Advisory:</strong> These are common record types to help
                you organize before applying. Exact document requirements vary
                by financing route (banks, NBFCs, or government schemes such as
                MUDRA or CGTMSE). This checklist is for preparation only and does
                not guarantee eligibility or loan approval.
              </p>
            </div>

            <div className="checklist-header">
              <h2 className="checklist-heading">Common document examples</h2>
              <span className="checklist-counter" role="status" aria-live="polite">
                {checkedCount} of {totalCount} examples marked as available
              </span>
            </div>

            <ul className="records-checklist">
              {RECORD_CHECKLIST.map((item) => {
                const isChecked = Boolean(checkedRecords[item.id])
                return (
                  <li
                    key={item.id}
                    className={`checklist-card ${isChecked ? 'is-checked' : ''}`}
                  >
                    <label className="checklist-label">
                      <input
                        type="checkbox"
                        className="checklist-checkbox"
                        checked={isChecked}
                        onChange={() => toggleRecordCheck(item.id)}
                      />
                      <div className="checklist-text">
                        <span className="checklist-title">{item.title}</span>
                        <span className="checklist-desc">{item.desc}</span>
                      </div>
                    </label>
                  </li>
                )
              })}
            </ul>

            <div className="records-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={handleBackToDetails}
              >
                ← Back to business details
              </button>
            </div>
          </section>
        )}

        <aside className="progress-card">
          <p className="eyebrow">YOUR READINESS JOURNEY</p>
          <h2>Small steps, made clearer.</h2>
          <ol>
            <li
              className={
                currentStep === 1
                  ? 'current'
                  : currentStep > 1
                    ? 'completed'
                    : ''
              }
              aria-current={currentStep === 1 ? 'step' : undefined}
            >
              Tell us about your business
            </li>
            <li
              className={
                currentStep === 2
                  ? 'current'
                  : currentStep > 2
                    ? 'completed'
                    : ''
              }
              aria-current={currentStep === 2 ? 'step' : undefined}
            >
              Organize your records
            </li>
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