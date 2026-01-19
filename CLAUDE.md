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
6. For diagrams, Mermaid code is extracted via `extractMermaidFromResponse()` and rendered with live preview

### Multi-Provider API Client (src/utils/apiClient.js)

Supports five providers with different API formats:
- **Gemini**: Uses `contents` array with `role: 'model'/'user'`, system instructions injected as initial user/model exchange
- **Anthropic**: Uses `system` field separately, messages use `role: 'user'/'assistant'`
- **OpenAI/OpenRouter/Cerebras**: Standard OpenAI format with `role: 'system'/'user'/'assistant'`

All providers except Cerebras support image uploads (base64-encoded).

### Prompt Enhancement System (src/utils/promptEnhancer.js)

Defines persona prompts (business-analyst, architect, developer, designer, product-manager) and output type prompts (coding, architecture, business-analysis, ui-mockup, diagram, documentation). These are combined into a system message.

The `ui-mockup` output type includes detailed instructions for generating production-quality HTML with real Unsplash images.

### Visual Editor System (iframe-based)

The visual editor allows users to edit AI-generated HTML mockups directly:
- **useVisualEditor.js** - Hook managing edit mode state and parent/iframe communication
- **editorInjector.js** - Injects editor script into iframe HTML via `injectEditorScript()`
- **editorMessages.js** - Defines message protocol constants (`PARENT_MESSAGES`, `IFRAME_MESSAGES`, `MESSAGE_SOURCE`)

Communication flow: Parent sends `TOGGLE_EDIT_MODE`, `DELETE_SELECTED`, `UPDATE_STYLE`, `REQUEST_HTML` messages. Iframe responds with `READY`, `ELEMENT_SELECTED`, `HTML_UPDATED`, `ELEMENT_DELETED` events.

Editor features: element selection with overlay, drag-to-move, resize handles, inline text editing (double-click), style updates.

### Diagram Support

Two diagram editing modes are available:
- **MermaidEditor.jsx** - Code-based editor with live preview, exports to SVG/PNG
- **DiagramsNetEditor.jsx** - Visual editor using embedded diagrams.net, converts Mermaid to Draw.io XML via `@whitebite/diagram-converter`

PreviewPane.jsx handles rendering for both `ui-mockup` and `diagram` output types, with zoom controls for diagrams.

### Chat History (useChatHistory.js)

Manages multiple conversations with auto-migration from legacy single-chat storage:
- Creates, loads, updates, deletes, and renames chats
- Persists to localStorage under `ai-builder-chats` key
- Structure: `{ chats: [{ id, title, timestamp, updatedAt, messages }], currentChatId }`

### State Management

All persistent state uses `useLocalStorage` hook with `ai-builder-*` prefixed keys. Chat state (messages, loading, error) lives in `useAIChat` hook.

### Custom Prompts (useCustomPrompts.js)

Users can customize persona and output type prompts. Customizations are stored separately from defaults, allowing reset to defaults. The `getPersonaPrompt()` and `getOutputTypePrompt()` functions return custom prompts if set, otherwise defaults from `promptEnhancer.js`.

### Saved Prompts (useSavedPrompts.js)

Allows saving complete prompt configurations (messages, model, output type, and optional screenshot) for reuse. Stored in localStorage under `ai-builder-saved-prompts` key.
