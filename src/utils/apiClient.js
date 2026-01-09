const API_CONFIGS = {
  gemini: {
    endpoint: (apiKey, model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`,
    defaultModel: 'gemini-2.5-pro-preview-06-05',
    headers: () => ({
      'Content-Type': 'application/json',
    }),
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
  },
  openai: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o',
    headers: (apiKey) => ({
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    }),
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
  },
}

export async function sendChatMessage({ provider, apiKey, messages, systemMessage, model }) {
  const config = API_CONFIGS[provider]
  if (!config) {
    throw new Error(`Unknown provider: ${provider}`)
  }

  const selectedModel = model || config.defaultModel

  // Provider-specific handling
  if (provider === 'gemini') {
    return sendGeminiMessage({ config, apiKey, messages, systemMessage, model: selectedModel })
  }

  if (provider === 'anthropic') {
    return sendAnthropicMessage({ config, apiKey, messages, systemMessage, model: selectedModel })
  }

  // OpenAI-compatible format (OpenRouter, OpenAI)
  const formattedMessages = []

  if (systemMessage) {
    formattedMessages.push({ role: 'system', content: systemMessage })
  }

  formattedMessages.push(...messages)

  const requestBody = {
    model: selectedModel,
    messages: formattedMessages,
    max_tokens: 8192,
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

async function sendAnthropicMessage({ config, apiKey, messages, systemMessage, model }) {
  const response = await fetch(config.endpoint, {
    method: 'POST',
    headers: config.headers(apiKey),
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      system: systemMessage || undefined,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}

async function sendGeminiMessage({ config, apiKey, messages, systemMessage, model }) {
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

  // Convert chat messages
  for (const msg of messages) {
    contents.push({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
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
]
