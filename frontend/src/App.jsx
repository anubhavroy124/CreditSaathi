import './App.css'

function App() {
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

          <form className="profile-form">
            <label>
              What kind of business do you run?
              <input type="text" placeholder="For example, a tailoring shop" />
            </label>

            <label>
              Where is your business located?
              <input type="text" placeholder="City or district, state" />
            </label>

            <label>
              How much funding are you exploring?
              <div className="amount-input">
                <span>₹</span>
                <input type="number" placeholder="300000" />
              </div>
            </label>

            <label>
              Add a business document
              <input type="file" accept=".pdf,.csv,.jpg,.jpeg,.png" />
              <span className="hint">
                You can begin without a document and add one later.
              </span>
            </label>

            <button type="button">Continue</button>
          </form>
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