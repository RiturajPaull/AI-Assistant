import { Sparkles, AlertCircle } from 'lucide-react'

function AppCard({ data }) {
  if (!data) return null

  const { success, message } = data

  return (
    <div className={`response-card app-card ${success ? 'success' : 'error'}`}>
      <div className="assistant-bubble">
        {success ? (
          <Sparkles className="assistant-icon text-amber-400" size={20} />
        ) : (
          <AlertCircle className="assistant-icon text-rose-400" size={20} />
        )}
        <div className="assistant-message">{message}</div>
      </div>
    </div>
  )
}

export default AppCard
