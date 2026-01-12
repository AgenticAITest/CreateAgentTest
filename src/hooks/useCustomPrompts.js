import { useLocalStorage } from './useLocalStorage'
import { DEFAULT_PERSONA_PROMPTS, DEFAULT_OUTPUT_TYPE_PROMPTS } from '../utils/promptEnhancer'

export function useCustomPrompts() {
  const [customPersonas, setCustomPersonas] = useLocalStorage('ai-builder-custom-personas', {})
  const [customOutputTypes, setCustomOutputTypes] = useLocalStorage('ai-builder-custom-output-types', {})

  // Get effective prompt (custom or default)
  const getPersonaPrompt = (personaKey) => {
    return customPersonas[personaKey] ?? DEFAULT_PERSONA_PROMPTS[personaKey] ?? ''
  }

  const getOutputTypePrompt = (outputTypeKey) => {
    return customOutputTypes[outputTypeKey] ?? DEFAULT_OUTPUT_TYPE_PROMPTS[outputTypeKey] ?? ''
  }

  // Check if prompt has been customized
  const isPersonaCustomized = (personaKey) => {
    return Object.prototype.hasOwnProperty.call(customPersonas, personaKey)
  }

  const isOutputTypeCustomized = (outputTypeKey) => {
    return Object.prototype.hasOwnProperty.call(customOutputTypes, outputTypeKey)
  }

  // Update custom prompt
  const setPersonaPrompt = (personaKey, prompt) => {
    setCustomPersonas(prev => ({ ...prev, [personaKey]: prompt }))
  }

  const setOutputTypePrompt = (outputTypeKey, prompt) => {
    setCustomOutputTypes(prev => ({ ...prev, [outputTypeKey]: prompt }))
  }

  // Reset to default (remove from custom)
  const resetPersona = (personaKey) => {
    setCustomPersonas(prev => {
      const next = { ...prev }
      delete next[personaKey]
      return next
    })
  }

  const resetOutputType = (outputTypeKey) => {
    setCustomOutputTypes(prev => {
      const next = { ...prev }
      delete next[outputTypeKey]
      return next
    })
  }

  // Reset all
  const resetAllPrompts = () => {
    setCustomPersonas({})
    setCustomOutputTypes({})
  }

  return {
    customPersonas,
    customOutputTypes,
    getPersonaPrompt,
    getOutputTypePrompt,
    isPersonaCustomized,
    isOutputTypeCustomized,
    setPersonaPrompt,
    setOutputTypePrompt,
    resetPersona,
    resetOutputType,
    resetAllPrompts,
  }
}
