import { useState } from 'react'
import { signInFarmer, signUpFarmer } from './api'

const emptySignup = {
  full_name: '', state: '', contact: '', district: '', taluka: '', village: '',
  password: '', preferred_language: 'Marathi',
}

export default function AuthModal({ onClose, onAuthenticated }) {
  const [mode, setMode] = useState('signin')
  const [signup, setSignup] = useState(emptySignup)
  const [signin, setSignin] = useState({ contact: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const switchMode = (nextMode) => {
    setError('')
    setMode(nextMode)
  }

  const handleSignin = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await signInFarmer(signin)
      onAuthenticated(result.farmer)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
    }
  }

  const handleSignup = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const result = await signUpFarmer(signup)
      onAuthenticated(result.farmer)
    } catch (caught) {
      setError(caught.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <section className={`auth-modal ${mode === 'signup' ? 'mode-signup' : 'mode-signin'}`} role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <button className="auth-close" type="button" onClick={onClose} aria-label="Close">×</button>
        <header className="auth-heading">
          <span>🌾</span>
          <div><p>KRUSHI SAATHI</p><h2 id="auth-title">Farmer portal</h2></div>
        </header>

        <div className="auth-container">
          <form className="auth-form-container farmer-signin-container" onSubmit={handleSignin}>
            <div className="auth-form-inner signin-inner">
              <span className="auth-form-icon">🌱</span>
              <h1>Welcome back</h1>
              <p className="auth-subtitle">Sign in to continue to your farm workspace.</p>
              <label>Email or phone number<input required autoComplete="username" value={signin.contact} onChange={(event) => setSignin({ ...signin, contact: event.target.value })} placeholder="Email or phone number" /></label>
              <label>Password<input required type="password" autoComplete="current-password" value={signin.password} onChange={(event) => setSignin({ ...signin, password: event.target.value })} placeholder="Password" /></label>
              <button className="auth-submit signin-submit" type="submit" disabled={busy}>{busy ? 'Please wait…' : 'Sign in'}</button>
              <p className="auth-switch-copy">Don't have an account? <button type="button" onClick={() => switchMode('signup')}>Sign up</button></p>
            </div>
          </form>

          <form className="auth-form-container farmer-signup-container" onSubmit={handleSignup}>
            <div className="auth-form-inner signup-inner">
              <span className="auth-form-icon">🌿</span>
              <h1>Create farmer account</h1>
              <p className="auth-subtitle">A few details help us tailor your farm advice.</p>
              <div className="signup-fields">
                <label>Full name<input required autoComplete="name" value={signup.full_name} onChange={(event) => setSignup({ ...signup, full_name: event.target.value })} placeholder="Full name" /></label>
                <label>State<input required autoComplete="address-level1" value={signup.state} onChange={(event) => setSignup({ ...signup, state: event.target.value })} placeholder="State" /></label>
                <label>Email ID or phone number<input required autoComplete="email" value={signup.contact} onChange={(event) => setSignup({ ...signup, contact: event.target.value })} placeholder="Email or phone" /></label>
                <label>District / city<input required autoComplete="address-level2" value={signup.district} onChange={(event) => setSignup({ ...signup, district: event.target.value })} placeholder="District or city" /></label>
                <label>Taluka<input required value={signup.taluka} onChange={(event) => setSignup({ ...signup, taluka: event.target.value })} placeholder="Taluka" /></label>
                <label>Village<input required autoComplete="address-level3" value={signup.village} onChange={(event) => setSignup({ ...signup, village: event.target.value })} placeholder="Village" /></label>
                <label>Password<input required minLength="8" type="password" autoComplete="new-password" value={signup.password} onChange={(event) => setSignup({ ...signup, password: event.target.value })} placeholder="At least 8 characters" /></label>
                <label>Preferred advisory language<select required value={signup.preferred_language} onChange={(event) => setSignup({ ...signup, preferred_language: event.target.value })}><option>Marathi</option><option>Hindi</option><option>English</option></select></label>
              </div>
              <button className="auth-submit signup-submit" type="submit" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
              <p className="auth-switch-copy">Already have an account? <button type="button" onClick={() => switchMode('signin')}>Sign in</button></p>
            </div>
          </form>

          <div className="portal-slider">
            <div className="portal-slider-inner">
              <section className="portal-prompt portal-prompt-signup">
                <span>🌾</span><h2>New to Krushi Saathi?</h2>
                <p>Create your farmer account to keep your location, language, and conversations together.</p>
                <button type="button" onClick={() => switchMode('signup')}>Don't have an account? Sign up</button>
              </section>
              <section className="portal-prompt portal-prompt-signin">
                <span>🌱</span><h2>Welcome back!</h2>
                <p>Your farm conversations are ready when you are.</p>
                <button type="button" onClick={() => switchMode('signin')}>Already have an account? Sign in</button>
              </section>
            </div>
          </div>
        </div>
        {error && <p className="auth-error" role="alert">{error}</p>}
        <p className="auth-privacy">Your farmer profile and chat history are kept in your account on this app.</p>
      </section>
    </div>
  )
}
