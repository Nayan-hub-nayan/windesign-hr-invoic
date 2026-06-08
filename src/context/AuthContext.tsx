import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { jwtDecode } from 'jwt-decode'
import { AUTH_STORAGE_KEY, isEmailAllowed } from '../config/auth'
import type { AuthSession, AuthUser } from '../types/auth'
import { load, save } from '../utils/storage'

interface GoogleJwtPayload {
  sub: string
  email: string
  name: string
  picture: string
  email_verified?: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (credential: string) => { ok: true } | { ok: false; message: string }
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function parseCredential(credential: string): AuthUser | null {
  try {
    const payload = jwtDecode<GoogleJwtPayload>(credential)
    if (!payload.email || !payload.sub) return null
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture || '',
      emailVerified: Boolean(payload.email_verified),
    }
  } catch {
    return null
  }
}

function readStoredSession(): AuthSession | null {
  const session = load<AuthSession | null>(AUTH_STORAGE_KEY, null)
  if (!session?.credential || !session.user) return null
  const user = parseCredential(session.credential)
  if (!user || user.sub !== session.user.sub) return null
  if (!isEmailAllowed(user.email)) return null
  return { ...session, user }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setSession(readStoredSession())
    setIsLoading(false)
  }, [])

  const signIn = useCallback((credential: string) => {
    const user = parseCredential(credential)
    if (!user) {
      return { ok: false as const, message: 'Could not verify Google sign-in. Please try again.' }
    }
    if (!isEmailAllowed(user.email)) {
      const domain = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN
      return {
        ok: false as const,
        message: domain
          ? `Only @${domain} accounts are allowed for this tool.`
          : 'This account is not allowed.',
      }
    }
    const next: AuthSession = {
      user,
      credential,
      signedInAt: Date.now(),
    }
    save(AUTH_STORAGE_KEY, next)
    setSession(next)
    return { ok: true as const }
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setSession(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isLoading,
      signIn,
      signOut,
    }),
    [session, isLoading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
