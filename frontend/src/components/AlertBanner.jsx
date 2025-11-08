export default function AlertBanner({ message, type = 'error', onClose }) {
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-400 text-green-800'
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800'
      case 'error':
      default:
        return 'bg-red-100 border-red-400 text-red-800'
    }
  }

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 border rounded-lg px-6 py-4 shadow-lg ${getStyles()}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="font-medium">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-lg font-bold hover:opacity-70 transition-opacity"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}