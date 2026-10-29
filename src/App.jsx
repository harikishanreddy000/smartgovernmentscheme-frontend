import { useEffect, useState } from 'react'
import { schemes as sampleSchemes, statesAndTerritories } from './data/schemes'
import './App.css'

const navigation = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'checker', label: 'Eligibility checker', icon: 'check' },
  { id: 'schemes', label: 'Explore schemes', icon: 'compass' },
  { id: 'saved', label: 'Saved schemes', icon: 'bookmark' },
]

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '')
const PAGE_SIZE = 24
const initialProfile = {
  age: '24', gender: 'prefer-not', state: '', residence: 'rural', occupation: '',
  annualIncome: 0, socialCategory: 'general', specialStatus: 'none',
}

function Icon({ name, size = 18, ...props }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
    check: <><path d="m5 12 4 4L19 6" /><circle cx="12" cy="12" r="9" /></>,
    compass: <><circle cx="12" cy="12" r="9" /><path d="m15.8 8.2-2.1 5.5-5.5 2.1 2.1-5.5 5.5-2.1Z" /></>,
    bookmark: <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.8L6 21V4.8Z" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    back: <><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    external: <><path d="M14 3h7v7m-1-6-9 9" /><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /></>,
    leaf: <><path d="M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-8 8-16Z" /><path d="M4 21c2-5 6-8 12-11" /></>,
    flame: <><path d="M12 22c4.4 0 7-3 7-7 0-3-1.7-5.3-4.2-8.2.2 2.1-.8 3.4-2 4.1C12 7.4 10.1 4.9 7.7 3 8 7.5 5 10 5 15c0 4 2.7 7 7 7Z" /><path d="M12 22c-2 0-3.2-1.4-3.2-3.1 0-1.3.7-2.3 1.9-3.8.1 1.2.8 1.8 1.4 2.2.2-1.1.8-2.1 1.7-2.8.3 1.5 1.5 2.5 1.5 4.4 0 1.7-1.3 3.1-3.3 3.1Z" /></>,
    heart: <path d="M20.8 8.8c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.6Z" />,
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z" /></>,
    sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 21v-1a7 7 0 0 1 14 0v1" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    spark: <><path d="m12 3 1.9 5.7L20 11l-6.1 2.3L12 19l-1.9-5.7L4 11l6.1-2.3L12 3Z" /><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" /></>,
    circleCheck: <><circle cx="12" cy="12" r="9" /><path d="m8 12 2.5 2.5L16.5 9" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8h.01" /></>,
    filter: <><path d="M4 7h16M7 12h10m-7 5h4" /><circle cx="8" cy="7" r="1.5" /><circle cx="15" cy="12" r="1.5" /></>,
  }
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name] || paths.info}</svg>
}

function Brand() {
  return <span className="brand-lockup"><span className="brand-mark"><Icon name="shield" size={19} /></span><span className="brand-name">Sahaaya<span>.</span></span></span>
}

function Header({ title, onMenu, onStart, backendStatus }) {
  return (
    <header className="topbar">
      <div className="topbar-title-wrap">
        <button type="button" className="mobile-menu icon-button" aria-label="Open navigation" onClick={onMenu}><Icon name="menu" /></button>
        <div><p className="breadcrumb">Citizen services <span>/</span> {title}</p><h1 className="topbar-title">{title}</h1></div>
      </div>
      <div className="topbar-actions"><span className={`privacy-pill api-pill api-${backendStatus}`} title={backendStatus === 'online' ? 'Scheme backend is connected' : backendStatus === 'checking' ? 'Connecting to scheme backend' : 'Scheme backend is offline'}><Icon name={backendStatus === 'offline' ? 'info' : 'shield'} size={14} />{backendStatus === 'online' ? 'Checker ready' : backendStatus === 'checking' ? 'Connecting' : 'API offline'}</span><button type="button" className="header-cta" onClick={onStart}><Icon name="plus" size={16} /><span>Check eligibility</span></button></div>
    </header>
  )
}

function SchemeIcon({ scheme, large = false }) {
  return <span className={`scheme-icon scheme-icon-${scheme.accent}${large ? ' scheme-icon-large' : ''}`}><Icon name={scheme.icon} size={large ? 24 : 19} /></span>
}

function SchemeCard({ scheme, onOpen, onSave, saved, outcome, compact = false }) {
  return (
    <article className={`scheme-card${compact ? ' scheme-card-compact' : ''}`}>
      <div className="scheme-card-top"><SchemeIcon scheme={scheme} /><button className={`save-button${saved ? ' is-saved' : ''}`} type="button" aria-label={saved ? `Remove ${scheme.name} from saved` : `Save ${scheme.name}`} onClick={() => onSave(scheme.id)}><Icon name="bookmark" size={17} /></button></div>
      <p className="scheme-category">{scheme.category}</p><h3>{scheme.name}</h3><p className="scheme-full-name">{scheme.fullName}</p><p className="scheme-summary">{scheme.summary}</p>
      {outcome && <div className={`match-note match-${outcome.status}`}><Icon name={outcome.status === 'potential' ? 'circleCheck' : 'info'} size={15} /><span>{outcome.reason}</span></div>}
      <div className="scheme-card-footer"><button className="text-link" type="button" onClick={() => onOpen(scheme)}>View details <Icon name="arrow" size={15} /></button><span className="official-mark"><Icon name="shield" size={12} /> Official source</span></div>
    </article>
  )
}

function RadioCards({ label, value, onChange, options, columns = 2, error }) {
  return (
    <fieldset className={`radio-field${error ? ' field-error' : ''}`}>
      <legend>{label}</legend>
      <div className={`radio-options radio-columns-${columns}`}>
        {options.map((option) => <label className={`radio-option${value === option.value ? ' radio-selected' : ''}`} key={option.value}><input type="radio" name={label} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} /><span className="radio-indicator" /><span>{option.label}</span></label>)}
      </div>
      {error && <span className="field-error-copy">{error}</span>}
    </fieldset>
  )
}

function SchemeDetail({ scheme, saved, onSave, onClose }) {
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="scheme-modal" role="dialog" aria-modal="true" aria-labelledby="scheme-detail-title">
        <div className="modal-top"><SchemeIcon scheme={scheme} large /><button className="icon-button" type="button" aria-label="Close details" onClick={onClose}><Icon name="close" /></button></div>
        <p className="scheme-category">{scheme.category}</p><h2 id="scheme-detail-title">{scheme.name}</h2><p className="modal-full-name">{scheme.fullName}</p><p className="modal-description">{scheme.summary}</p>
        <div className="benefit-box"><span className="benefit-label">WHAT IT OFFERS</span><p>{scheme.benefit}</p></div>
        <h3 className="criteria-heading">Eligibility at a glance</h3><ul className="criteria-list">{scheme.criteria.map((criterion) => <li key={criterion}><Icon name="circleCheck" size={16} /><span>{criterion}</span></li>)}</ul>
        <div className="modal-disclaimer"><Icon name="info" size={16} /><p>This is a short overview, not an official eligibility decision. Rules can change and state implementation may differ. Please confirm requirements with the official source.</p></div>
        <div className="modal-actions"><button type="button" className={`secondary-button${saved ? ' saved-button' : ''}`} onClick={() => onSave(scheme.id)}><Icon name="bookmark" size={15} />{saved ? 'Saved' : 'Save scheme'}</button><a className="primary-button" href={scheme.url} target="_blank" rel="noreferrer">Visit official source <Icon name="external" size={15} /></a></div>
      </section>
    </div>
  )
}

function EligibilityForm({ profile, setProfile, step, setStep, onFinish, onCancel, checking, requestError }) {
  const [error, setError] = useState('')
  const set = (key, value) => setProfile((current) => ({ ...current, [key]: value }))
  const steps = [
    { title: 'Basic profile', kicker: 'STEP 1', description: 'A few basic details help us find relevant starting points.' },
    { title: 'Social & income', kicker: 'STEP 2', description: 'Income, category and locality can matter for some programmes.' },
    { title: 'Occupation & state', kicker: 'STEP 3', description: 'Tell us what you do and where you live.' },
    { title: 'Special status', kicker: 'STEP 4', description: 'Share a status if it applies, or leave this as none.' },
  ]
  const presets = [
    { label: 'College student', values: { age: '20', gender: 'prefer-not', annualIncome: 180000, socialCategory: 'obc', residence: 'urban', occupation: 'student', state: 'Telangana', specialStatus: 'none' } },
    { label: 'Small farmer', values: { age: '40', gender: 'man', annualIncome: 160000, socialCategory: 'general', residence: 'rural', occupation: 'farmer', state: 'Telangana', specialStatus: 'none' } },
    { label: 'Senior citizen', values: { age: '65', gender: 'prefer-not', annualIncome: 120000, socialCategory: 'general', residence: 'rural', occupation: 'other', state: 'Telangana', specialStatus: 'senior-citizen' } },
    { label: 'Woman entrepreneur / vendor', values: { age: '32', gender: 'woman', annualIncome: 240000, socialCategory: 'general', residence: 'urban', occupation: 'self-employed', state: 'Telangana', specialStatus: 'none' } },
    { label: 'Person with disability', values: { age: '30', gender: 'prefer-not', annualIncome: 150000, socialCategory: 'general', residence: 'urban', occupation: 'other', state: 'Telangana', specialStatus: 'disability' } },
  ]
  const proceed = () => {
    if (step === 1 && (!profile.age || Number(profile.age) < 1 || Number(profile.age) > 100 || !profile.gender)) {
      setError('Choose an age from 1 to 100 and select a gender option.')
      return
    }
    if (step === 3 && (!profile.occupation || !profile.state)) {
      setError('Choose an occupation and state to continue.')
      return
    }
    setError('')
    if (step < 4) setStep(step + 1)
    else onFinish()
  }
  const applyPreset = (values) => { setProfile((current) => ({ ...current, ...values })); setError('') }
  return (
    <div className="checker-layout">
      <section className="checker-card">
        <div className="quick-presets"><strong><Icon name="spark" size={15} /> Quick profile presets</strong><span>Click a profile to fill in sample answers:</span><div>{presets.map((preset) => <button key={preset.label} type="button" onClick={() => applyPreset(preset.values)}>{preset.label}</button>)}</div></div>
        <div className="checker-heading"><div><span className="section-kicker">{steps[step - 1].kicker}</span><h2>{steps[step - 1].title}</h2><p>{steps[step - 1].description}</p></div><span className="step-count">0{step} <span>/ 04</span></span></div>
        <div className="step-track" aria-label={`Step ${step} of 4`}>{steps.map((item, index) => <span key={item.kicker} className={step >= index + 1 ? 'track-active' : ''} />)}</div>
        {step === 1 && <div className="form-grid">
          <label className="input-field form-span"><span>Age: {profile.age} years</span><input type="range" min="1" max="100" value={profile.age} onChange={(event) => set('age', event.target.value)} /><small>1 year <span>—</span> 100 years</small></label>
          <div className="form-span"><RadioCards label="Gender" value={profile.gender} onChange={(value) => set('gender', value)} options={[{ value: 'man', label: 'Male' }, { value: 'woman', label: 'Female' }, { value: 'other', label: 'Transgender / another identity' }, { value: 'prefer-not', label: 'Prefer not to say' }]} columns={2} /></div>
        </div>}
        {step === 2 && <div className="form-grid step-two-grid">
          <label className="input-field form-span"><span>Annual family income: ₹{Number(profile.annualIncome).toLocaleString('en-IN')}</span><input type="range" min="0" max="10000000" step="10000" value={profile.annualIncome} onChange={(event) => set('annualIncome', Number(event.target.value))} /><small>₹0 <span>—</span> ₹1,00,00,000+</small></label>
          <label className="input-field form-span"><span>Category / caste</span><select value={profile.socialCategory} onChange={(event) => set('socialCategory', event.target.value)}><option value="general">General</option><option value="sc">Scheduled Caste (SC)</option><option value="st">Scheduled Tribe (ST)</option><option value="obc">OBC</option><option value="prefer-not">Prefer not to say</option></select></label>
          <div className="form-span"><RadioCards label="Locality" value={profile.residence} onChange={(value) => set('residence', value)} options={[{ value: 'rural', label: 'Rural' }, { value: 'urban', label: 'Urban' }]} columns={2} /></div>
        </div>}
        {step === 3 && <div className="form-grid step-two-grid">
          <label className="input-field form-span"><span>Primary occupation</span><select value={profile.occupation} onChange={(event) => set('occupation', event.target.value)}><option value="">Choose an option</option><option value="farmer">Farmer / agricultural worker</option><option value="student">Student</option><option value="street-vendor">Street vendor</option><option value="self-employed">Self-employed / small business</option><option value="employed">Employed</option><option value="other">Other / not currently working</option></select></label>
          <label className="input-field form-span"><span>State of residence</span><select value={profile.state} onChange={(event) => set('state', event.target.value)}><option value="">Choose your state</option>{statesAndTerritories.map((state) => <option key={state} value={state}>{state}</option>)}</select></label>
        </div>}
        {step === 4 && <div className="form-grid step-two-grid"><div className="form-span"><RadioCards label="Special status (optional)" value={profile.specialStatus} onChange={(value) => set('specialStatus', value)} options={[{ value: 'none', label: 'None' }, { value: 'disability', label: 'Person with disability' }, { value: 'senior-citizen', label: 'Senior citizen' }, { value: 'minority', label: 'Minority community' }, { value: 'ex-serviceman', label: 'Ex-serviceman' }]} columns={2} /></div><p className="review-note"><Icon name="info" size={15} /> Only share what you’re comfortable sharing. Final eligibility is determined by the official scheme authority.</p></div>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {requestError && <p className="form-error" role="alert">{requestError}</p>}
        <div className="form-footer"><button type="button" className="cancel-button" disabled={checking} onClick={step === 1 ? onCancel : () => { setStep(step - 1); setError('') }}>{step === 1 ? 'Cancel' : <><Icon name="back" size={15} /> Back</>}</button><button type="button" className="primary-button" disabled={checking} onClick={proceed}>{checking ? 'Checking schemes…' : step === 4 ? 'Show my starting points' : 'Next step'} <Icon name={checking ? 'clock' : 'arrow'} size={16} /></button></div>
      </section>
      <aside className="privacy-card"><span className="privacy-icon"><Icon name="shield" size={20} /></span><h3>Four short steps</h3><p>Share basic details, income and locality, occupation and state, then any special status that may be relevant.</p><div className="privacy-divider" /><span className="privacy-foot"><Icon name="info" size={14} /> This is guidance, not an official decision.</span></aside>
    </div>
  )
}

function App() {
  const [page, setPage] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catalogPage, setCatalogPage] = useState({ total: sampleSchemes.length, page: 0, size: PAGE_SIZE, totalPages: 1, schemes: sampleSchemes, facets: {} })
  const [backendStatus, setBackendStatus] = useState('checking')
  const [backendMessage, setBackendMessage] = useState('')
  const [savedIds, setSavedIds] = useState(() => { try { return JSON.parse(localStorage.getItem('sahaaya-saved-schemes') || '[]') } catch { return [] } })
  const [profile, setProfile] = useState(initialProfile)
  const [checkerStep, setCheckerStep] = useState(1)
  const [checkedProfile, setCheckedProfile] = useState(null)
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [eligibilityMatches, setEligibilityMatches] = useState([])
  const [eligibilityError, setEligibilityError] = useState('')
  const [checkingEligibility, setCheckingEligibility] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All schemes')
  const [catalogLevel, setCatalogLevel] = useState('all')
  const [catalogState, setCatalogState] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const params = new URLSearchParams({ page: String(catalogPage.page), size: String(PAGE_SIZE), level: catalogLevel })
    if (category !== 'All schemes') params.set('category', category)
    if (query.trim()) params.set('q', query.trim())
    if (catalogLevel === 'state' && catalogState) params.set('state', catalogState)
    fetch(`${API_BASE_URL}/api/schemes?${params}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`The scheme service returned ${response.status}.`)
        const catalogue = await response.json()
        if (!Array.isArray(catalogue.schemes) || typeof catalogue.total !== 'number') throw new Error('The scheme service returned an invalid catalogue.')
        setCatalogPage(catalogue)
        setBackendStatus('online')
        setBackendMessage('')
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        setBackendStatus('offline')
        setBackendMessage(`The checker API at ${API_BASE_URL} is unavailable. Start the scheme backend to load live catalogue data and check eligibility.`)
        if (page === 'schemes') setCatalogPage((current) => ({ ...current, schemes: [], total: 0, totalPages: 0 }))
      })
    return () => controller.abort()
  }, [catalogPage.page, catalogLevel, catalogState, category, query, page])

  const schemes = catalogPage.schemes
  const categoryFacets = catalogPage.facets?.schemeCategory || []
  const stateFacets = catalogPage.facets?.beneficiaryState || []
  const categories = ['All schemes', ...categoryFacets.filter((facet) => facet.label && facet.label !== 'All').map((facet) => facet.label)]
  const currentTitle = navigation.find((item) => item.id === page)?.label || (page === 'results' ? 'Your results' : 'Overview')
  const evaluatedSchemes = eligibilityMatches
  const potentialMatches = evaluatedSchemes.filter((item) => item.outcome.status === 'potential')
  const needsChecking = evaluatedSchemes.filter((item) => item.outcome.status === 'review')
  const filteredSchemes = page === 'schemes' ? schemes : schemes.filter((scheme) => savedIds.includes(scheme.id))
  const savedSchemes = sampleSchemes.filter((scheme) => savedIds.includes(scheme.id))

  function navigate(id) { setPage(id); setMobileOpen(false); if (id === 'schemes') setCatalogPage((current) => ({ ...current, page: 0 })) }
  function toggleSaved(id) {
    setSavedIds((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      localStorage.setItem('sahaaya-saved-schemes', JSON.stringify(next))
      return next
    })
  }
  function startChecker() { setCheckerStep(1); setPage('checker'); setMobileOpen(false) }
  function browseSchemes(level, state = '') {
    setCatalogLevel(level)
    setCatalogState(state)
    setCategory('All schemes')
    setQuery('')
    setCatalogPage((current) => ({ ...current, page: 0 }))
    setPage('schemes')
    setMobileOpen(false)
  }
  async function finishChecker() {
    setEligibilityError('')
    setCheckingEligibility(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/eligibility/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profile, age: Number(profile.age) }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setBackendStatus('online')
        throw new Error(payload.message || payload.error || `The eligibility check failed (${response.status}).`)
      }
      setEligibilityMatches((payload.matches || []).map((match) => ({
        scheme: match.scheme,
        outcome: { status: String(match.status).toLowerCase(), reason: match.reason },
      })))
      setCheckedProfile({ ...profile })
      setBackendStatus('online')
      setBackendMessage('')
      setPage('results')
    } catch (error) {
      if (error.name === 'TypeError') {
        setBackendStatus('offline')
        setBackendMessage(`The checker API at ${API_BASE_URL} is unavailable. Start the scheme backend to load live catalogue data and check eligibility.`)
        setEligibilityError(`Could not connect to the scheme backend at ${API_BASE_URL}. Start the backend and try again.`)
      } else {
        setEligibilityError(error.message)
      }
    } finally {
      setCheckingEligibility(false)
    }
  }
  function resetChecker() { setProfile(initialProfile); setCheckerStep(1); setCheckedProfile(null); setEligibilityMatches([]); setEligibilityError(''); setPage('checker') }

  return (
    <div className="app-shell">
      {mobileOpen && <button className="mobile-scrim" type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} />}
      <aside className={`sidebar${mobileOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand"><Brand /><span className="sidebar-locale">INDIA</span><button className="sidebar-close icon-button" type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)}><Icon name="close" /></button></div>
        <div className="portal-label">CITIZEN PORTAL</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map((item) => <button type="button" key={item.id} className={`nav-item${page === item.id || (page === 'results' && item.id === 'checker') ? ' nav-active' : ''}`} onClick={() => navigate(item.id)}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.id === 'saved' && savedIds.length > 0 && <span className="nav-count">{savedIds.length}</span>}</button>)}
        </nav>
        <div className="sidebar-help"><span className="help-icon"><Icon name="spark" size={17} /></span><p><strong>Here to help</strong><span>Find support for your next step.</span></p><button type="button" onClick={startChecker} aria-label="Start eligibility check"><Icon name="arrow" size={15} /></button></div>
        <div className="sidebar-bottom"><div className="india-emblem" aria-hidden="true"><span>✳</span></div><p>MADE FOR EVERYDAY INDIA</p><small>Clear information. Official links.</small></div>
      </aside>

      <main className="main-panel">
        <Header title={currentTitle} onMenu={() => setMobileOpen(true)} onStart={startChecker} backendStatus={backendStatus} />
        <div className="page-content">
          {backendMessage && <div className="api-banner" role="status"><Icon name="info" size={16} /><span>{backendMessage}</span></div>}
          {page === 'overview' && <>
            <section className="hero-card"><div className="hero-copy"><div className="hero-eyebrow"><span className="hero-eyebrow-dot" /> GOVERNMENT SCHEMES, MADE EASIER TO FIND</div><h2>Looking for a scheme?</h2><p>Browse support for farming, health, housing and more. We’ll help you find a good place to start.</p><button className="hero-button" type="button" onClick={startChecker}>Check what may suit me <Icon name="arrow" size={17} /></button><span className="hero-footnote"><Icon name="clock" size={13} /> About 2 minutes <span>·</span> No account needed</span></div><div className="hero-art" aria-hidden="true"><div className="art-sun" /><div className="art-hill hill-back" /><div className="art-hill hill-front" /><div className="art-home"><div className="home-roof" /><div className="home-body"><span className="home-door" /><span className="home-window" /></div></div><div className="art-leaf leaf-one"><Icon name="leaf" size={22} /></div><div className="art-leaf leaf-two"><Icon name="leaf" size={17} /></div><span className="art-sparkle spark-one">✦</span><span className="art-sparkle spark-two">✧</span><div className="art-ground" /></div></section>
            <section className="trust-strip"><div className="trust-item"><span className="trust-icon trust-green"><Icon name="shield" size={18} /></span><span><strong>Your information stays private</strong><small>No profiles or answers are stored</small></span></div><span className="trust-divider" /><div className="trust-item"><span className="trust-icon trust-blue"><Icon name="compass" size={18} /></span><span><strong>Start with trusted sources</strong><small>Every scheme links to its official portal</small></span></div><span className="trust-divider" /><div className="trust-item"><span className="trust-icon trust-gold"><Icon name="user" size={18} /></span><span><strong>Made for real people</strong><small>Plain language, no paperwork to start</small></span></div></section>
            <section className="coverage-section" aria-labelledby="coverage-heading"><div className="coverage-heading"><span className="section-kicker">START WITH YOUR LOCATION</span><h2 id="coverage-heading">Browse schemes by coverage</h2><p>Explore national programmes or schemes listed for Telangana.</p></div><div className="coverage-options"><button className="coverage-card" type="button" onClick={() => browseSchemes('central')}><span className="coverage-number">01</span><span className="coverage-copy"><strong>National schemes</strong><small>Programmes offered across India</small></span><Icon name="arrow" size={18} /></button><button className="coverage-card" type="button" onClick={() => browseSchemes('state', 'Telangana')}><span className="coverage-number">02</span><span className="coverage-copy"><strong>Telangana schemes</strong><small>Support listed for Telangana residents</small></span><Icon name="arrow" size={18} /></button></div><p className="coverage-source">Scheme listings come from myScheme. Check each official source for current rules and availability.</p></section>
            <section className="featured-section"><div className="section-heading"><div><span className="section-kicker">A FEW PLACES TO START</span><h2>Popular schemes</h2><p>Take a look at these programmes, then check the official details.</p></div><button type="button" className="text-link section-link" onClick={() => navigate('schemes')}>See all schemes <Icon name="arrow" size={15} /></button></div><div className="scheme-grid overview-grid">{schemes.slice(0, 3).map((scheme) => <SchemeCard key={scheme.id} scheme={scheme} saved={savedIds.includes(scheme.id)} onSave={toggleSaved} onOpen={setSelectedScheme} />)}</div></section>
            <div className="overview-note"><Icon name="info" size={16} /><p><strong>A helpful first step, not a final decision.</strong> Your answers are processed by the checker API for screening and not stored.
Scheme rules can change, and some checks rely on official records we can’t access here. Always confirm with the linked government source.</p></div>
          </>}

          {page === 'checker' && <><div className="page-intro"><div><span className="section-kicker">FOUR SIMPLE STEPS</span><h2>Let’s find what may fit.</h2><p>Share basic details, income and locality, occupation and state, then an optional special status.</p></div><span className="intro-illustration"><Icon name="compass" size={29} /></span></div><EligibilityForm profile={profile} setProfile={setProfile} step={checkerStep} setStep={setCheckerStep} onFinish={finishChecker} onCancel={() => navigate('overview')} checking={checkingEligibility} requestError={eligibilityError} /></>}

          {page === 'results' && <><div className="results-intro"><button className="back-link" type="button" onClick={startChecker}><Icon name="back" size={15} /> Update answers</button><span className="section-kicker">YOUR STARTING POINT</span><h2>Here’s where to begin.</h2><p>Based on what you shared for {checkedProfile?.state || 'your location'}. These are suggestions to explore, not official decisions.</p></div><div className="results-summary"><span className="summary-icon"><Icon name="spark" size={19} /></span><div><strong>{potentialMatches.length + needsChecking.length} {potentialMatches.length + needsChecking.length === 1 ? 'scheme' : 'schemes'} to explore</strong><span>{potentialMatches.length} potential {potentialMatches.length === 1 ? 'match' : 'matches'} · {needsChecking.length} more to verify</span></div><button type="button" className="summary-reset" onClick={resetChecker}><Icon name="plus" size={14} /> Start over</button></div>{potentialMatches.length > 0 && <section className="result-section"><div className="result-section-title"><span className="result-dot result-dot-match" /><div><h3>Potential matches</h3><p>Your answers line up with some starting requirements.</p></div></div><div className="scheme-grid">{potentialMatches.map(({ scheme, outcome }) => <SchemeCard key={scheme.id} scheme={scheme} outcome={outcome} saved={savedIds.includes(scheme.id)} onSave={toggleSaved} onOpen={setSelectedScheme} />)}</div></section>}{needsChecking.length > 0 && <section className="result-section"><div className="result-section-title"><span className="result-dot result-dot-check" /><div><h3>Worth checking</h3><p>These programmes use official records or local rules we can’t check here.</p></div></div><div className="scheme-grid">{needsChecking.map(({ scheme, outcome }) => <SchemeCard key={scheme.id} scheme={scheme} outcome={outcome} saved={savedIds.includes(scheme.id)} onSave={toggleSaved} onOpen={setSelectedScheme} />)}</div></section>}{evaluatedSchemes.length === 0 && <div className="no-results"><span><Icon name="compass" size={24} /></span><h3>No close matches in this preview</h3><p>This checker covers a small sample of programmes. Browse the catalogue or ask your local service centre about state and district schemes.</p><button className="primary-button" type="button" onClick={() => navigate('schemes')}>Explore all schemes <Icon name="arrow" size={15} /></button></div>}<div className="overview-note results-note"><Icon name="shield" size={16} /><p>Your answers are processed by the checker API for screening and not stored. Confirm all eligibility and application details with the official scheme portal or a local government office.</p></div></>}

          {page === 'schemes' && <>
            <div className="page-intro catalog-intro"><div><span className="section-kicker">OFFICIAL GOVERNMENT CATALOGUE</span><h2>Explore government schemes.</h2><p>Browse national programmes or schemes listed for Telangana. Confirm current details with the official source.</p></div><span className="intro-illustration"><Icon name="compass" size={29} /></span></div>
            <div className="catalog-controls">
              <label className="catalog-search"><Icon name="search" size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); setCatalogPage((current) => ({ ...current, page: 0 })) }} placeholder="Search schemes or topics" aria-label="Search schemes" />{query && <button type="button" aria-label="Clear search" onClick={() => { setQuery(''); setCatalogPage((current) => ({ ...current, page: 0 })) }}><Icon name="close" size={15} /></button>}</label>
              <div className="catalog-selects"><label className="catalog-select-label">Scheme coverage<select aria-label="Scheme coverage" value={catalogLevel} onChange={(event) => { setCatalogLevel(event.target.value); setCatalogState(''); setCategory('All schemes'); setCatalogPage((current) => ({ ...current, page: 0 })) }}><option value="all">National + state schemes</option><option value="central">National schemes</option><option value="state">State / UT schemes</option></select></label>
                {catalogLevel === 'state' && <label className="catalog-select-label">State / UT<select aria-label="Filter by state" value={catalogState} onChange={(event) => { setCatalogState(event.target.value); setCatalogPage((current) => ({ ...current, page: 0 })) }}><option value="">All States / UTs</option>{stateFacets.filter((facet) => facet.label && facet.label !== 'All' && facet.count > 0).map((facet) => <option key={facet.label} value={facet.label}>{facet.label} ({facet.count})</option>)}</select></label>}
              </div>
            </div>
            <div className="catalog-bottom-controls"><div className="category-tabs" role="group" aria-label="Filter by category"><button type="button" className={category === 'All schemes' ? 'category-active' : ''} onClick={() => { setCategory('All schemes'); setCatalogPage((current) => ({ ...current, page: 0 })) }}>All categories</button>{categories.slice(1).map((item) => <button type="button" key={item} className={category === item ? 'category-active' : ''} onClick={() => { setCategory(item); setCatalogPage((current) => ({ ...current, page: 0 })) }}>{item}</button>)}</div><span className="catalog-count">{catalogPage.total.toLocaleString()} schemes · Page {catalogPage.totalPages ? catalogPage.page + 1 : 0} of {catalogPage.totalPages.toLocaleString()}</span></div>
            {filteredSchemes.length ? <div className="scheme-grid">{filteredSchemes.map((scheme) => <SchemeCard key={scheme.id} scheme={scheme} saved={savedIds.includes(scheme.id)} onSave={toggleSaved} onOpen={setSelectedScheme} />)}</div> : <div className="empty-state"><span><Icon name="search" size={21} /></span><h3>{backendStatus === 'offline' ? 'Official catalogue unavailable' : 'No schemes found'}</h3><p>{backendStatus === 'offline' ? 'Reconnect to the official myScheme catalogue and try again.' : 'Try a different search or choose another category.'}</p></div>}
            {catalogPage.totalPages > 1 && <nav className="pagination" aria-label="Scheme catalogue pages"><button type="button" className="page-button" disabled={catalogPage.page <= 0} onClick={() => { setCatalogPage((current) => ({ ...current, page: current.page - 1 })); window.scrollTo({ top: 0, behavior: 'smooth' }) }}><Icon name="back" size={15} /> Previous</button><span>Page <strong>{catalogPage.page + 1}</strong> of {catalogPage.totalPages.toLocaleString()}</span><button type="button" className="page-button" disabled={catalogPage.page + 1 >= catalogPage.totalPages} onClick={() => { setCatalogPage((current) => ({ ...current, page: current.page + 1 })); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Next <Icon name="arrow" size={15} /></button></nav>}
            <div className="overview-note"><Icon name="info" size={16} /><p>{catalogPage.notice || 'Catalogue entries and eligibility may change. Confirm current details directly with myScheme and the relevant department.'} Source: <a href="https://www.myscheme.gov.in/" target="_blank" rel="noreferrer">myScheme.gov.in</a>.</p></div>
          </>}

          {page === 'saved' && <><div className="page-intro catalog-intro"><div><span className="section-kicker">YOUR SHORTLIST</span><h2>Saved for later.</h2><p>Keep useful programmes close while you review official requirements.</p></div><span className="intro-illustration"><Icon name="bookmark" size={27} /></span></div>{savedSchemes.length ? <div className="scheme-grid">{savedSchemes.map((scheme) => <SchemeCard key={scheme.id} scheme={scheme} saved onSave={toggleSaved} onOpen={setSelectedScheme} />)}</div> : <div className="empty-state saved-empty"><span><Icon name="bookmark" size={21} /></span><h3>Your shortlist is ready when you are</h3><p>Save a scheme from the catalogue and it will appear here.</p><button className="secondary-button" type="button" onClick={() => navigate('schemes')}>Browse schemes <Icon name="arrow" size={15} /></button></div>}</>}
          <footer className="page-footer"><span>SAHAAYA · HELPING YOU FIND YOUR WAY</span><span>Scheme rules can change. Please check the official source.</span></footer>
        </div>
      </main>
      {selectedScheme && <SchemeDetail scheme={selectedScheme} saved={savedIds.includes(selectedScheme.id)} onSave={toggleSaved} onClose={() => setSelectedScheme(null)} />}
    </div>
  )
}

export default App
