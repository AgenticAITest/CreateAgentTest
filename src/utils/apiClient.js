const API_CONFIGS = {
  gemini: {
    endpoint: (apiKey, model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
    defaultModel: 'gemini-2.5-pro-preview-06-05',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
    supportsImages: true,
  },
  openrouter: {
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    defaultModel: 'openai/gpt-4o-mini',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.href,
      'X-Title': 'AI Agent Builder',
    }),
    supportsImages: true,
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    supportsImages: true,
  },
  anthropic: {
    endpoint: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-3-5-sonnet-20241022',
    headers: (apiKey) => ({
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    }),
    supportsImages: true,
  },
  cerebras: {
    endpoint: 'https://api.cerebras.ai/v1/chat/completions',
    defaultModel: 'llama-3.3-70b',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
    supportsImages: false,
  },
}

// Check if a provider supports image uploads
export function providerSupportsImages(provider) {
  return API_CONFIGS[provider]?.supportsImages ?? false
}

export async function sendChatMessage({ provider, apiKey, messages, systemMessage, model, images }) {
  const config = API_CONFIGS[provider]
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`)
  }

  const selectedModel = model || config.defaultModel

  // Provider-specific handling
  if (provider === 'gemini') {
    return sendGeminiMessage({ config, apiKey, messages, systemMessage, model: selectedModel, images })
  }

  if (provider === 'anthropic') {
    return sendAnthropicMessage({ config, apiKey, messages, systemMessage, model: selectedModel, images })
  }

  // OpenAI-compatible format (OpenRouter, OpenAI, Cerebras)
  const formattedMessages = []

  if (systemMessage) {
    formattedMessages.push({ role: 'system', content: systemMessage })
  }

  // Format messages with image support for OpenAI-compatible APIs
  for (const msg of messages) {
    if (msg.images && msg.images.length > 0 && config.supportsImages) {
      // Message has images - use content array format
      const content = [
        { type: 'text', text: msg.content }
      ]
      for (const img of msg.images) {
        content.push({
          type: 'image_url',
          image_url: { url: `data:${img.mimeType};base64,${img.data}` }
        })
      }
      formattedMessages.push({ role: msg.role, content })
    } else {
      // Text-only message
      formattedMessages.push({ role: msg.role, content: msg.content })
    }
  }

  const requestBody = {
    model: selectedModel,
    messages: formattedMessages,
    max_tokens: 16384,
  }

  console.log('API Request:', { endpoint: config.endpoint, model: selectedModel, messageCount: formattedMessages.length })

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('API Error Response:', errorText)
    let errorMessage
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.error?.message || errorJson.message || `API error: ${response.status}`
    } catch {
      errorMessage = errorText || `API error: ${response.status}`
    }
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function sendAnthropicMessage({ config, apiKey, messages, systemMessage, model, images }) {
  // Format messages with image support for Anthropic
  const formattedMessages = messages.map(m => {
    if (m.images && m.images.length > 0) {
      // Message has images - use content array format
      const content = [
        { type: 'text', text: m.content }
      ]
      for (const img of m.images) {
        content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: img.mimeType,
            data: img.data
          }
        })
      }
      return { role: m.role, content }
    }
    // Text-only message
    return { role: m.role, content: m.content }
  })

  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify({
      model,
      max_tokens: 8192,
      system: systemMessage || undefined,
      messages: formattedMessages,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function sendGeminiMessage({ config, apiKey, messages, systemMessage, model, images }) {
  // Convert messages to Gemini format
  const contents = []

  // Add system instruction as first user message if present
  if (systemMessage) {
    contents.push({
      role: 'user',
      parts: [{ text: `System Instructions:\n${systemMessage}\n\nPlease follow the above instructions for all responses.` }]
    })
    contents.push({
      role: 'model',
      parts: [{ text: 'I understand and will follow these instructions.' }]
    })
  }

  // Convert chat messages with image support
  for (const msg of messages) {
    const parts = [{ text: msg.content }]

    // Add images if present
    if (msg.images && msg.images.length > 0) {
      for (const img of msg.images) {
        parts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.data
          }
        })
      }
    }

    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts
    })
  }

  const endpoint = config.endpoint(apiKey, model)

  console.log('Gemini API Request:', { model, messageCount: contents.length })

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: config.headers(),
    body: JSON.stringify({
      contents,
      generationConfig: {
        maxOutputTokens: 8192,
      }
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Gemini API Error:', errorText)
    let errorMessage
    try {
      const errorJson = JSON.parse(errorText)
      errorMessage = errorJson.error?.message || `API error: ${response.status}`
    } catch {
      errorMessage = errorText || `API error: ${response.status}`
    }
    throw new Error(errorMessage)
  }

  const data = await response.json()
  return data.candidates[0].content.parts[0].text
}

export const PROVIDERS = [
  { value: 'gemini', label: 'Google Gemini', defaultModel: 'gemini-2.5-pro-preview-06-05' },
  { value: 'openrouter', label: 'OpenRouter', defaultModel: 'openai/gpt-4o-mini' },
  { value: 'openai', label: 'OpenAI', defaultModel: 'gpt-4o' },
  { value: 'anthropic', label: 'Anthropic', defaultModel: 'claude-3-5-sonnet-20241022' },
  { value: 'cerebras', label: 'Cerebras', defaultModel: 'llama-3.3-70b' },
]
