import { useState, useCallback } from 'react'
import { sendChatMessage } from '../utils/apiClient'
import { enhancePrompt } from '../utils/promptEnhancer'

export function useAIChat({
  apiKey,
  provider,
  model,
  systemInstructions,
  persona,
  outputType,
  customPersonaPrompts = {},
  customOutputTypePrompts = {}
}) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(async (userPrompt, images = []) => {
    if (!apiKey) {
      setError('Please enter your API key')
      return
    }

    if (!userPrompt.trim() && images.length === 0) {
      return
    }

    setError(null)
    setIsLoading(true)

    // Include images in user message if provided
    const userMessage = {
      role: 'user',
      content: userPrompt || 'Please analyze these images.',
      ...(images.length > 0 && { images })
    }
    setMessages((prev) => [...prev, userMessage])

    try {
      const { systemMessage } = enhancePrompt({
        systemInstructions,
        persona,
        outputType,
        userPrompt,
        customPersonaPrompts,
        customOutputTypePrompts,
      })

      const allMessages = [...messages, userMessage]

      const response = await sendChatMessage({
        provider,
        apiKey,
        model,
        messages: allMessages,
        systemMessage,
      })

      const assistantMessage = { role: 'assistant', content: response }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (err) {
      setError(err.message)
      // Remove the user message if request failed
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }, [apiKey, provider, model, systemInstructions, persona, outputType, messages, customPersonaPrompts, customOutputTypePrompts])

  const clearChat = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  }
}
