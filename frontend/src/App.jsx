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
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState(null)

  // Step 2: Selected image files for the four required items (kept only in browser memory)
  const [recordFiles, setRecordFiles] = useState({})
  const [imagesConfirmation, setImagesConfirmation] = useState(null)

  const selectedCount = RECORD_CHECKLIST.filter(
    (item) => recordFiles[item.id] && recordFiles[item.id].name
  ).length
  const totalCount = RECORD_CHECKLIST.length
  const allImagesSelected = selectedCount === totalCount

  const confirmationRef = useRef(null)
  const firstInputRef = useRef(null)
  const imagesConfirmationRef = useRef(null)

  // When a valid summary is generated on step 1, smoothly bring the confirmation card into view
  useEffect(() => {
    if (currentStep === 1 && summary && confirmationRef.current) {
      confirmationRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [summary, currentStep])

  // When images confirmation is generated on step 2, scroll it into view
  useEffect(() => {
    if (currentStep === 2 && imagesConfirmation && imagesConfirmationRef.current) {
      imagesConfirmationRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [imagesConfirmation, currentStep])

  const handleSubmit = async (event) => {
    // Prevent the default browser behavior, which reloads the page on form submit
    event.preventDefault()

    const trimmedBusiness = businessType.trim()
    const trimmedLocation = location.trim()
    const parsedAmount = Number(fundingAmount)

    // Quick client-side check
    if (!trimmedBusiness || !trimmedLocation || !fundingAmount) {
      setErrorMessage('Please fill in your business type, location, and funding amount.')
      setSummary(null)
      return
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid positive funding amount.')
      setSummary(null)
      return
    }

    setIsLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch('http://127.0.0.1:8000/api/profile/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          business_type: trimmedBusiness,
          location: trimmedLocation,
          funding_amount: parsedAmount,
          document_name: documentName.trim() || null,
        }),
      })

      if (!response.ok) {
        let errorDetail = 'The server was unable to process your request.'
        try {
          const errData = await response.json()
          if (errData && errData.detail) {
            if (Array.isArray(errData.detail)) {
              errorDetail = errData.detail.map((d) => d.msg || JSON.stringify(d)).join(', ')
            } else if (typeof errData.detail === 'string') {
              errorDetail = errData.detail
            }
          }
        } catch {
          // If response body isn't JSON
        }
        throw new Error(errorDetail)
      }

      const data = await response.json()

      // Map snake_case backend response to the camelCase fields used in the UI
      setSummary({
        businessType: data.business_type,
        location: data.location,
        fundingAmount: data.funding_amount,
        documentName: data.document_name || 'None attached (optional)',
      })
      setErrorMessage('')
    } catch (err) {
      setSummary(null)
      if (err.name === 'TypeError' || err.message === 'Failed to fetch') {
        setErrorMessage(
          'Unable to reach the CreditSaathi backend service. Please ensure the local server is running at http://127.0.0.1:8000.'
        )
      } else {
        setErrorMessage(err.message || 'Something went wrong while communicating with the server.')
      }
    } finally {
      setIsLoading(false)
    }
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

  const handleRecordFileChange = (id, event) => {
    const file = event.target.files && event.target.files[0]
    setRecordFiles((prev) => {
      const updated = { ...prev }
      if (file) {
        updated[id] = file
      } else {
        delete updated[id]
      }
      return updated
    })
    // Reset confirmation if user alters their selected files
    setImagesConfirmation(null)
  }

  const handleGoToRecords = () => {
    setCurrentStep(2)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleBackToDetails = () => {
    setCurrentStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSubmitImages = () => {
    if (!allImagesSelected) return
    setImagesConfirmation({
      files: RECORD_CHECKLIST.map((item) => ({
        id: item.id,
        title: item.title,
        fileName: recordFiles[item.id]?.name || 'Unnamed file',
      })),
    })
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
                    onWheel={(e) => e.currentTarget.blur()}
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

              <button type="submit" disabled={isLoading} aria-busy={isLoading}>
                {isLoading ? 'Checking details...' : 'Continue'}
              </button>
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
                  In this local preview, your details and the document filename
                  are sent to the CreditSaathi backend running on this computer.
                  They aren’t saved to a database or file, and no document is
                  uploaded.
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
              <h2 className="checklist-heading">Required document images</h2>
              <span className="checklist-counter" role="status" aria-live="polite">
                {selectedCount} of {totalCount} images selected
              </span>
            </div>

            <ul className="records-checklist">
              {RECORD_CHECKLIST.map((item) => {
                const selectedFile = recordFiles[item.id]
                const hasFile = Boolean(selectedFile && selectedFile.name)
                return (
                  <li
                    key={item.id}
                    className={`checklist-card ${hasFile ? 'is-checked' : ''}`}
                  >
                    <div className="checklist-text">
                      <div className="checklist-header-row">
                        <span className="checklist-title">{item.title}</span>
                        <span className="required-tag">Required</span>
                      </div>
                      <span className="checklist-desc">{item.desc}</span>
                    </div>

                    <div className="file-picker-container">
                      <label className="file-picker-label">
                        <span className="file-picker-prompt">
                          {hasFile ? 'Change image file:' : 'Choose image (JPEG, PNG, WebP):'}
                        </span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                          className="record-file-input"
                          onChange={(e) => handleRecordFileChange(item.id, e)}
                        />
                      </label>
                      {hasFile ? (
                        <div className="selected-file-badge">
                          <span className="check-icon">✓</span>
                          <span className="selected-filename">{selectedFile.name}</span>
                        </div>
                      ) : (
                        <span className="no-file-text">No image selected yet</span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="records-actions">
              <button
                type="button"
                className="primary-action-btn"
                onClick={handleSubmitImages}
                disabled={!allImagesSelected}
              >
                Submit images and continue
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={handleBackToDetails}
              >
                ← Back to business details
              </button>
            </div>

            {!allImagesSelected && (
              <p className="file-selection-hint">
                Please select an image file for all 4 items above to enable submission ({selectedCount} of {totalCount} selected).
              </p>
            )}

            {imagesConfirmation && (
              <section
                ref={imagesConfirmationRef}
                className="confirmation-card images-confirmation-card"
                role="status"
                aria-live="polite"
              >
                <span className="confirmation-badge">Selection Confirmed</span>
                <h2>Document Images Selected</h2>
                <div className="images-confirmation-notice">
                  <p>
                    <strong>Notice:</strong> This page only confirms that image
                    files have been selected in your browser. It does not verify,
                    inspect, or validate their contents, and no files have been
                    uploaded or sent anywhere.
                  </p>
                </div>

                <dl className="summary-list">
                  {imagesConfirmation.files.map((fileItem) => (
                    <div key={fileItem.id} className="summary-row">
                      <dt>{fileItem.title}</dt>
                      <dd>{fileItem.fileName}</dd>
                    </div>
                  ))}
                </dl>

                <p className="confirmation-note">
                  All 4 required image files are recorded for this preview
                  session. Lenders and scheme authorities make all eligibility
                  and approval decisions.
                </p>
              </section>
            )}
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