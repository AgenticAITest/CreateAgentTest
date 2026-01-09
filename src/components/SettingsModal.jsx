import { useState } from 'react'
import { PROVIDERS } from '../utils/apiClient'
import { STATIC_MODELS } from '../utils/models'
import { useOpenRouterModels } from '../hooks/useOpenRouterModels'

export function SettingsModal({ isOpen, onClose, apiKey, setApiKey, provider, setProvider, model, setModel }) {
  const [showKey, setShowKey] = useState(false)

  // Fetch OpenRouter models dynamically
  const {
    models: openRouterModels,
    isLoading: isLoadingModels,
    refreshModels
  } = useOpenRouterModels(provider === 'openrouter' ? apiKey : null)

  // Get models based on provider
  const getModels = () => {
    if (provider === 'openrouter') {
      return openRouterModels
    }
    return STATIC_MODELS[provider] || []
  }

  const models = getModels()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="rounded-xl border w-full max-w-md mx-4 shadow-2xl" style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#3d2e5a' }}>
          <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
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
        <div className="px-6 py-4 space-y-4">
          {/* API Provider */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              API Provider
            </label>
            <select
              value={provider}
              onChange={(e) => {
                const newProvider = e.target.value
                setProvider(newProvider)
                // Reset model when provider changes
                const newModels = newProvider === 'openrouter'
                  ? openRouterModels
                  : (STATIC_MODELS[newProvider] || [])
                setModel(newModels[0]?.value || '')
              }}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
            >
              {PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'openrouter' ? 'sk-or-...' : 'Enter your API key...'}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-muted hover:text-text-primary px-2 py-1"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Stored locally in your browser
            </p>
          </div>

          {/* Model */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-text-secondary">
                Model
                {isLoadingModels && (
                  <span className="ml-2 text-xs text-text-muted">Loading...</span>
                )}
              </label>
              {provider === 'openrouter' && (
                <button
                  type="button"
                  onClick={refreshModels}
                  disabled={isLoadingModels}
                  className="text-xs text-primary hover:text-primary-light disabled:opacity-50"
                >
                  Refresh
                </button>
              )}
            </div>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              disabled={isLoadingModels}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-text-primary"
            >
              {models.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {provider === 'openrouter' && (
              <p className="text-xs text-text-muted mt-1">
                {models.length} models available
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t" style={{ borderColor: '#3d2e5a' }}>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
