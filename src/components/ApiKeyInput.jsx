import { useState } from 'react'
import { PROVIDERS } from '../utils/apiClient'
import { STATIC_MODELS } from '../utils/models'
import { useOpenRouterModels } from '../hooks/useOpenRouterModels'

export function ApiKeyInput({ apiKey, setApiKey, provider, setProvider, model, setModel }) {
  const [showKey, setShowKey] = useState(false)

  // Fetch OpenRouter models dynamically
  const {
    models: openRouterModels,
    isLoading: isLoadingModels
  } = useOpenRouterModels(provider === 'openrouter' ? apiKey : null)

  // Get models based on provider
  const getModels = () => {
    if (provider === 'openrouter') {
      return openRouterModels
    }
    return STATIC_MODELS[provider] || []
  }

  const models = getModels()

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          API Provider
        </label>
        <select
          value={provider}
          onChange={(e) => {
            const newProvider = e.target.value
            setProvider(newProvider)
            const newModels = newProvider === 'openrouter'
              ? openRouterModels
              : (STATIC_MODELS[newProvider] || [])
            setModel(newModels[0]?.value || '')
          }}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {PROVIDERS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          API Key
        </label>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={provider === 'openrouter' ? 'sk-or-...' : 'Enter your API key...'}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-200 px-2 py-1"
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Stored locally in your browser
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Model
          {isLoadingModels && (
            <span className="ml-2 text-xs text-gray-500">Loading...</span>
          )}
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={isLoadingModels}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {models.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
