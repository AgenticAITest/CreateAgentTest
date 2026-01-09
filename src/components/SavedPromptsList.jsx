import { useState } from 'react'

function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export function SavedPromptsList({ prompts, onDelete, onCopyPrompt }) {
  const [expandedId, setExpandedId] = useState(null)

  if (prompts.length === 0) {
    return (
      <div className="flex flex-col">
        <label className="block text-sm font-medium text-secondary">
          Saved Prompts
        </label>
        <p className="text-xs text-text-muted py-2 text-center">No saved prompts yet</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-secondary mb-2">
        Saved Prompts
      </label>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {prompts.map(prompt => (
          <div key={prompt.id} className="rounded-lg border transition-colors" style={{ backgroundColor: '#1a1425', borderColor: 'transparent' }}>
            {/* Header */}
            <div
              onClick={() => setExpandedId(expandedId === prompt.id ? null : prompt.id)}
              className="px-3 py-2 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="text-sm font-medium truncate text-text-primary">{prompt.name}</div>
                  <div className="text-xs text-text-muted flex items-center gap-2">
                    <span>{prompt.model}</span>
                    <span>·</span>
                    <span>{formatRelativeTime(prompt.timestamp)}</span>
                  </div>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-secondary transition-transform ${expandedId === prompt.id ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {/* Expanded Content */}
            {expandedId === prompt.id && (
              <div className="px-3 pb-3 space-y-2 border-t pt-2" style={{ borderColor: '#3d2e5a' }}>
                {prompt.description && (
                  <p className="text-xs text-text-secondary">{prompt.description}</p>
                )}

                <div className="rounded p-2 text-xs" style={{ backgroundColor: '#0f0a1a' }}>
                  <div className="text-text-muted mb-1">
                    {prompt.promptCount > 1 ? `Prompts (${prompt.promptCount}):` : 'Original Prompt:'}
                  </div>
                  <div className="text-text-secondary whitespace-pre-wrap max-h-32 overflow-y-auto">{prompt.userPrompt}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(prompt.userPrompt)
                      onCopyPrompt?.(prompt.userPrompt)
                    }}
                    className="flex-1 px-2 py-1.5 bg-secondary/20 hover:bg-secondary/30 text-secondary-light rounded text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    Copy Prompt
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(prompt.id)
                    }}
                    className="px-2 py-1.5 bg-danger/20 hover:bg-danger/30 text-danger rounded text-xs transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
