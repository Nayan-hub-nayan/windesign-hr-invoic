export const AUTH_STORAGE_KEY = 'windesign_auth_session'

export function getGoogleClientId(): string {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''
}

export function getAllowedEmailDomain(): string {
  // return (import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN ?? '').trim().toLowerCase()
  return (import.meta.env.VITE_ALLOWED_EMAIL ?? '').trim().toLowerCase()

}

export function isEmailAllowed(email: string): boolean {
  const domain = getAllowedEmailDomain()
  if (!domain) return true
  return email.toLowerCase().endsWith(domain)

}
