import { useAuth } from './context/AuthContext'
import { LoginScreen } from './components/auth/LoginScreen'
import SuiteApp from './SuiteApp'

export default function App() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <p className="text-muted text-sm font-serif italic">Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return <SuiteApp />
}
