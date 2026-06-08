import { useState } from 'react'
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google'
import { getAllowedEmailDomain, getGoogleClientId } from '../../config/auth'
import { useAuth } from '../../context/AuthContext'

export function LoginScreen() {
  const { signIn } = useAuth()
  const [error, setError] = useState('')
  const clientId = getGoogleClientId()
  const allowedDomain = getAllowedEmailDomain()

  const handleSuccess = (response: CredentialResponse) => {
    setError('')
    if (!response.credential) {
      setError('Google did not return a credential. Please try again.')
      return
    }
    const result = signIn(response.credential)
    if (!result.ok) setError(result.message)
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-8">
      <div className="bg-card border border-line w-full max-w-[420px] p-9 shadow-[0_4px_24px_rgba(0,0,0,0.08)]">
        <div className="text-center mb-8">
          <div className="font-playfair text-[28px] font-bold text-green tracking-wide">
            Windesign
          </div>
          <div className="font-serif text-[10px] tracking-[3px] uppercase text-muted mt-1">
            HR & Invoice Suite
          </div>
          <p className="text-[12px] text-muted mt-5 italic leading-relaxed">
            Sign in with your Google account to access internal tooling.
          </p>
        </div>

        {!clientId || clientId.includes('your-google-client-id') ? (
          <div className="bg-gold-light border-l-[3px] border-gold py-3 px-4 text-[11px] text-[#7a5c1e] mb-5 leading-relaxed">
            <b>Setup required:</b> Add your Google OAuth Client ID to the <code>.env</code> file as{' '}
            <code>VITE_GOOGLE_CLIENT_ID</code>, then restart the dev server.
          </div>
        ) : (
          <div className="flex justify-center mb-5">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={() => setError('Google sign-in failed. Please try again.')}
              useOneTap={false}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>
        )}

        {allowedDomain && (
          <p className="text-center text-[10px] text-muted italic">
            Restricted to <b className="text-green not-italic">@{allowedDomain}</b> accounts
          </p>
        )}

        {error && (
          <div className="mt-5 bg-[#fdecea] border-l-[3px] border-danger py-2.5 px-3 text-[11px] text-danger">
            {error}
          </div>
        )}

        <div className="mt-8 pt-5 border-t border-line text-[9px] text-muted text-center leading-relaxed">
          Internal use only · Windesign Labs (OPC) Pvt. Ltd.
        </div>
      </div>
    </div>
  )
}
