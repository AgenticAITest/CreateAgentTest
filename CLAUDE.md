# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` - Start Vite development server
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Architecture

This is an **AI Agent Builder** - a React/Vite application that provides a configurable chat interface for interacting with multiple AI providers. Users can configure system instructions, personas, and output types to customize AI responses.

### Core Flow

1. **App.jsx** orchestrates the entire application - settings sidebar, chat panel, and preview pane
2. User settings (API key, provider, persona, output type) are persisted via `useLocalStorage` hook
3. Chat messages flow through `useAIChat` hook → `apiClient.js` → AI provider APIs
4. `promptEnhancer.js` combines system instructions + persona + output type into a system message
5. For UI mockups, responses are parsed by `extractHtmlFromResponse()` and rendered in an iframe

### Multi-Provider API Client (src/utils/apiClient.js)

Supports four providers with different API formats:
- **Gemini**: Uses `contents` array with `role: 'model'/'user'`, system instructions injected as initial user/model exchange
- **Anthropic**: Uses `system` field separately, messages use `role: 'user'/'assistant'`
- **OpenAI/OpenRouter**: Standard OpenAI format with `role: 'system'/'user'/'assistant'`

### Prompt Enhancement System (src/utils/promptEnhancer.js)

Defines persona prompts (business-analyst, architect, developer, designer, product-manager) and output type prompts (coding, architecture, business-analysis, ui-mockup, documentation). These are combined into a system message.

The `ui-mockup` output type includes detailed instructions for generating production-quality HTML with real Unsplash images.

### State Management

All persistent state uses `useLocalStorage` hook with `ai-builder-*` prefixed keys. Chat state (messages, loading, error) lives in `useAIChat` hook.
