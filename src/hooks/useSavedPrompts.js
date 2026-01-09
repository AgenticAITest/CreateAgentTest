import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useSavedPrompts() {
  const [promptsData, setPromptsData] = useLocalStorage('ai-builder-saved-prompts', {
    prompts: []
  })

  // Generate unique ID
  const generateId = () => `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Save a new prompt
  const savePrompt = useCallback((promptData) => {
    const id = generateId()
    const newPrompt = {
      id,
      name: promptData.name,
      description: promptData.description || '',
      model: promptData.model,
      provider: promptData.provider,
      userPrompt: promptData.userPrompt,
      outputType: promptData.outputType,
      timestamp: Date.now(),
      hasScreenshot: promptData.hasScreenshot || false,
    }

    setPromptsData(prev => ({
      prompts: [newPrompt, ...prev.prompts]
    }))

    return id
  }, [setPromptsData])

  // Delete a prompt
  const deletePrompt = useCallback((id) => {
    setPromptsData(prev => ({
      prompts: prev.prompts.filter(p => p.id !== id)
    }))
  }, [setPromptsData])

  // Get a single prompt by ID
  const getPrompt = useCallback((id) => {
    return promptsData.prompts.find(p => p.id === id)
  }, [promptsData.prompts])

  return {
    savedPrompts: promptsData.prompts,
    savePrompt,
    deletePrompt,
    getPrompt,
  }
}
