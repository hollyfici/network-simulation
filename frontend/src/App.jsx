import Dashboard from './components/Dashboard'
import AlertBanner from './components/AlertBanner'
import { useZoneData } from './hooks/useZoneData'

function App() {
  const { error, clearError } = useZoneData()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {error && (
        <AlertBanner 
          message={error} 
          type="error" 
          onClose={clearError}
        />
      )}
      <Dashboard />
    </div>
  )
}

export default App