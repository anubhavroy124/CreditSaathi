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

const FINANCING_ROUTES = [
  {
    id: 'mudra',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    category: 'Government Scheme / Micro Enterprise Credit',
    coverage:
      'Up to ₹10 Lakhs (Shishu, Kishore, Tarun); Tarun Plus up to ₹20 Lakhs',
    overview:
      'Provides micro-credit through commercial banks, RRBs, and NBFCs for non-corporate, non-farm small enterprises across Shishu (up to ₹50k), Kishore (₹50k–₹5L), and Tarun (₹5L–₹10L). Tarun Plus provides up to ₹20 Lakhs with a mandatory condition: the borrower must have successfully repaid a previous Tarun loan.',
    typicalDocs:
      'Udyam registration, past Tarun loan repayment track record (for Tarun Plus), last 6–12 months bank statements, proof of business address, quotation of machinery or equipment.',
    source:
      'Official source: financialservices.gov.in (DFS) & mudra.org.in',
  },
  {
    id: 'cgtmse',
    name: 'CGTMSE Credit Guarantee Scheme',
    category: 'Third-Party Credit Guarantee for Lenders',
    coverage:
      'Credit facility caps vary by lender, up to ₹10 Crores for eligible institutions',
    overview:
      'Provides a credit guarantee directly to member lending institutions (scheduled commercial banks and select financial institutions) to facilitate collateral-free lending to MSEs. Important: CGTMSE guarantees the lender against default; it is not a direct loan or a guarantee promise to the business borrower.',
    typicalDocs:
      'Udyam certificate, detailed project report/business plan, GST returns, operating bank statements, and lender MSE credit application.',
    source:
      'Official source: cgtmse.in (Scheme Document CGS-I) & Ministry of MSME',
  },
  {
    id: 'bank_term',
    name: 'Bank / NBFC MSME Business Loan',
    category: 'Direct Bank Term Loan or Working Capital',
    coverage: 'Based on declared turnover and cash flows',
    overview:
      'Commercial credit lines, overdrafts (OD), or term loans evaluated on historical sales turnover, banking stability, and financial records.',
    typicalDocs:
      '12 months bank statements, filed GST returns, business premises ownership/rental deed, and audited/basic financial statements.',
    source: 'Official source: Individual lending institution policies & RBI guidelines',
  },
]

function App() {
  const [currentStep, setCurrentStep] = useState(1)
  const [highestUnlockedStep, setHighestUnlockedStep] = useState(1)
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

  // Step 3: Selected financing route
  const [selectedRouteId, setSelectedRouteId] = useState('mudra')
  const selectedRoute =
    FINANCING_ROUTES.find((r) => r.id === selectedRouteId) || FINANCING_ROUTES[0]

  const selectedCount = RECORD_CHECKLIST.filter(
    (item) => recordFiles[item.id] && recordFiles[item.id].name
  ).length
  const totalCount = RECORD_CHECKLIST.length
  const allImagesSelected = selectedCount === totalCount

  const confirmationRef = useRef(null)
  const firstInputRef = useRef(null)
  const imagesConfirmationRef = useRef(null)
  const handleSidebarNavigation = (step) => {
  if (step > highestUnlockedStep) return

  setCurrentStep(step)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

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
    setHighestUnlockedStep((highest) => Math.max(highest, 2))
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
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="300000"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value.replace(/\D/g, ''))}
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

                <div className="confirmation-actions">
                  <button
                    type="button"
                    className="primary-action-btn"
                    onClick={() => {
                      setHighestUnlockedStep((highest) => Math.max(highest, 3))
                      setCurrentStep(3)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                  >
                    Continue to explore routes →
                  </button>
                </div>

                <p className="confirmation-note">
                  All 4 required image files are recorded for this preview
                  session. Lenders and scheme authorities make all eligibility
                  and approval decisions.
                </p>
              </section>
            )}
          </section>
        )}

        {currentStep === 3 && (
          <section className="routes-screen">
            <p className="eyebrow">STEP 3 OF 4 · FINANCING OPTIONS</p>
            <h1>Explore possible financing routes.</h1>
            <p className="intro">
              Compare illustrative financing options to see what types of
              credit may align with your business profile. Select one route to
              inspect its typical preparation expectations.
            </p>

            <div className="records-disclaimer">
              <p>
                <strong>Advisory & Limitations:</strong> CreditSaathi does not
                provide loans, determine credit eligibility, or guarantee
                approval. These route summaries are illustrative examples based
                on public government and banking frameworks. Actual terms,
                eligibility criteria, and required records must be verified
                directly with the relevant lender or official scheme authority.
              </p>
            </div>

            <div className="routes-list">
              {FINANCING_ROUTES.map((route) => {
                const isSelected = selectedRouteId === route.id
                return (
                  <div
                    key={route.id}
                    className={`route-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setSelectedRouteId(route.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setSelectedRouteId(route.id)
                      }
                    }}
                  >
                    <div className="route-card-header">
                      <div>
                        <span className="route-category">{route.category}</span>
                        <h3 className="route-title">{route.name}</h3>
                      </div>
                      <div className="route-select-indicator">
                        <input
                          type="radio"
                          name="financing_route"
                          checked={isSelected}
                          onChange={() => setSelectedRouteId(route.id)}
                          aria-label={route.name}
                        />
                      </div>
                    </div>

                    <p className="route-coverage">
                      <strong>Typical Coverage:</strong> {route.coverage}
                    </p>

                    <p className="route-overview">{route.overview}</p>

                    <div className="route-docs-box">
                      <span className="route-docs-label">
                        Typical Records Checked:
                      </span>
                      <p className="route-docs-text">{route.typicalDocs}</p>
                    </div>

                    <p className="route-source">
                      <span className="source-label">Source:</span>{' '}
                      {route.source}
                    </p>
                  </div>
                )
              })}
            </div>

            <div className="records-actions">
              <button
                type="button"
                className="primary-action-btn"
                onClick={() => {
                  setCurrentStep(4)
                  setHighestUnlockedStep((highest) => Math.max(highest, 4))
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Continue to readiness checklist →
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setCurrentStep(2)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                ← Back to records
              </button>
            </div>
          </section>
        )}

        {currentStep === 4 && (
          <section className="review-screen">
            <p className="eyebrow">STEP 4 OF 4 · READINESS REVIEW</p>
            <h1>Review your readiness checklist.</h1>
            <p className="intro">
              Here is your consolidated draft preparation package. Review your
              recorded business information, chosen route, and locally selected
              document images.
            </p>

            <div className="records-disclaimer review-notice">
              <p>
                <strong>Notice on Document Handling:</strong> Selecting files
                only confirms they were chosen locally in your browser.
                CreditSaathi has not verified, read, or validated the contents
                of your files, nor have any files been uploaded or transmitted
                to any external service. Lenders and scheme authorities make all
                eligibility and approval decisions.
              </p>
            </div>

            {/* Section 1: Business Profile */}
            <div className="review-card">
              <div className="review-card-header">
                <h3>1. Business Profile</h3>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => {
                    setCurrentStep(1)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Edit details
                </button>
              </div>
              <dl className="summary-list">
                <div className="summary-row">
                  <dt>Business Type</dt>
                  <dd>
                    {summary?.businessType || businessType || 'Not specified'}
                  </dd>
                </div>
                <div className="summary-row">
                  <dt>Location</dt>
                  <dd>{summary?.location || location || 'Not specified'}</dd>
                </div>
                <div className="summary-row">
                  <dt>Target Funding Amount</dt>
                  <dd>
                    ₹
                    {Number(
                      summary?.fundingAmount || fundingAmount || 0
                    ).toLocaleString('en-IN')}
                  </dd>
                </div>
                <div className="summary-row">
                  <dt>Initial Document Attached</dt>
                  <dd>
                    {summary?.documentName ||
                      documentName ||
                      'None attached (optional)'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Section 2: Selected Financing Route */}
            <div className="review-card">
              <div className="review-card-header">
                <h3>2. Selected Financing Route</h3>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => {
                    setCurrentStep(3)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Change route
                </button>
              </div>
              <dl className="summary-list">
                <div className="summary-row">
                  <dt>Route Name</dt>
                  <dd>{selectedRoute.name}</dd>
                </div>
                <div className="summary-row">
                  <dt>Category</dt>
                  <dd>{selectedRoute.category}</dd>
                </div>
                <div className="summary-row">
                  <dt>Funding Range</dt>
                  <dd>{selectedRoute.coverage}</dd>
                </div>
                <div className="summary-row">
                  <dt>Official Source</dt>
                  <dd>{selectedRoute.source}</dd>
                </div>
              </dl>
            </div>

            {/* Section 3: Document Images Checklist */}
            <div className="review-card">
              <div className="review-card-header">
                <h3>3. Document Images Selected</h3>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => {
                    setCurrentStep(2)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  Update files
                </button>
              </div>
              <ul className="review-docs-list">
                {RECORD_CHECKLIST.map((item) => {
                  const file = recordFiles[item.id]
                  return (
                    <li key={item.id} className="review-doc-item">
                      <div className="review-doc-info">
                        <span className="review-doc-title">{item.title}</span>
                        <span className="review-doc-filename">
                          {file?.name ? file.name : 'No image file selected'}
                        </span>
                      </div>
                      <span
                        className={`review-doc-status ${file?.name ? 'is-ready' : 'is-missing'}`}
                      >
                        {file?.name ? '✓ Selected locally' : 'Pending'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Section 4: Recommended Action Items */}
            <div className="review-card">
              <div className="review-card-header">
                <h3>4. Next Steps Before Approaching a Lender</h3>
              </div>
              <ul className="action-items-list">
                <li>
                  <strong>Verify current official criteria:</strong> Visit the
                  official portal ({selectedRoute.source.split(':')[1]?.trim() || 'official source'})
                  to check for recent policy changes or specific eligibility
                  terms.
                </li>
                <li>
                  <strong>Prepare original records:</strong> Ensure original
                  physical documents and clear digital copies are ready for
                  verification by the bank or NBFC branch.
                </li>
                <li>
                  <strong>Obtain asset quotations:</strong> If seeking machinery
                  or equipment funds, obtain formal proforma invoices or
                  supplier estimates.
                </li>
                <li>
                  <strong>Direct submission:</strong> CreditSaathi does not
                  submit loan applications. Submit your final application
                  package directly to an approved lending institution.
                </li>
              </ul>
            </div>

            <div className="records-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setCurrentStep(3)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                ← Back to financing routes
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setCurrentStep(1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              >
                Review business details
              </button>
            </div>
          </section>
        )}

        <aside className="progress-card">
          <p className="eyebrow">YOUR READINESS JOURNEY</p>
          <h2>Small steps, made clearer.</h2>
          <ol>
            <li
              className={currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : ''}
            >
              <button
                type="button"
                className="journey-step-button"
                onClick={() => handleSidebarNavigation(1)}
                disabled={highestUnlockedStep < 1}
                aria-current={currentStep === 1 ? 'step' : undefined}
              >
                Tell us about your business
              </button>
            </li>
                
            <li
              className={currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : ''}
            >
              <button
                type="button"
                className="journey-step-button"
                onClick={() => handleSidebarNavigation(2)}
                disabled={highestUnlockedStep < 2}
                aria-current={currentStep === 2 ? 'step' : undefined}
              >
                Organize your records
              </button>
            </li>
                
            <li
              className={currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : ''}
            >
              <button
                type="button"
                className="journey-step-button"
                onClick={() => handleSidebarNavigation(3)}
                disabled={highestUnlockedStep < 3}
                aria-current={currentStep === 3 ? 'step' : undefined}
              >
                Explore possible routes
              </button>
            </li>
                
            <li
              className={currentStep === 4 ? 'current' : currentStep > 4 ? 'completed' : ''}
            >
              <button
                type="button"
                className="journey-step-button"
                onClick={() => handleSidebarNavigation(4)}
                disabled={highestUnlockedStep < 4}
                aria-current={currentStep === 4 ? 'step' : undefined}
              >
                Review your readiness checklist
              </button>
            </li>
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