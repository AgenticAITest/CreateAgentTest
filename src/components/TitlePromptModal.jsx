import { useState, useEffect } from 'react'

export function TitlePromptModal({ isOpen, onClose, onSave, suggestedTitle = '' }) {
  const [title, setTitle] = useState(suggestedTitle)

  // Reset title when modal opens with new suggestion
  useEffect(() => {
    if (isOpen) {
      setTitle(suggestedTitle)
    }
  }, [isOpen, suggestedTitle])

  const handleSave = () => {
    const finalTitle = title.trim() || 'Untitled Chat'
    onSave(finalTitle)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="rounded-xl border w-full max-w-sm mx-4 shadow-2xl" style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#3d2e5a' }}>
          <h2 className="text-lg font-semibold text-text-primary">Save Chat</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <label className="block text-sm font-medium text-text-secondary mb-1">
            Chat Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for this conversation..."
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent text-text-primary"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: '#3d2e5a' }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-dark-surface-light hover:bg-dark-border rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover rounded-lg text-sm font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
