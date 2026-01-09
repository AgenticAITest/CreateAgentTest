import { useState, useEffect, useCallback } from 'react'
import { OPENROUTER_FALLBACK_MODELS } from '../utils/models'

const CACHE_KEY = 'ai-builder-openrouter-models'
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours

export function useOpenRouterModels(apiKey) {
  const [models, setModels] = useState(OPENROUTER_FALLBACK_MODELS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchModels = useCallback(async () => {
    if (!apiKey) {
      setModels(OPENROUTER_FALLBACK_MODELS)
      return
    }

    // Check cache first
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { models: cachedModels, timestamp } = JSON.parse(cached)
        if (Date.now() - timestamp < CACHE_DURATION_MS) {
          setModels(cachedModels)
          return
        }
      }
    } catch (e) {
      // Cache read failed, continue to fetch
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey.trim()}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`)
      }

      const data = await response.json()

      // Transform API response to { value, label } format
      // Sort by name for consistent ordering
      const transformedModels = data.data
        .map(model => ({
          value: model.id,
          label: model.name || model.id,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))

      // Cache the results
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        models: transformedModels,
        timestamp: Date.now(),
      }))

      setModels(transformedModels)
    } catch (err) {
      console.error('Failed to fetch OpenRouter models:', err)
      setError(err.message)
      setModels(OPENROUTER_FALLBACK_MODELS)
    } finally {
      setIsLoading(false)
    }
  }, [apiKey])

  // Fetch models when API key changes
  useEffect(() => {
    fetchModels()
  }, [fetchModels])

  // Manual refresh function
  const refreshModels = useCallback(() => {
    localStorage.removeItem(CACHE_KEY)
    fetchModels()
  }, [fetchModels])

  return { models, isLoading, error, refreshModels }
}
