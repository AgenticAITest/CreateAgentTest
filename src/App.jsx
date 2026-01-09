import { useEffect, useState, useRef, useCallback } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useAIChat } from './hooks/useAIChat'
import { useChatHistory } from './hooks/useChatHistory'
import { useSavedPrompts } from './hooks/useSavedPrompts'
import { useVisualEditor } from './hooks/useVisualEditor'
import { SettingsModal } from './components/SettingsModal'
import { TitlePromptModal } from './components/TitlePromptModal'
import { SavePromptModal } from './components/SavePromptModal'
import { ChatsList } from './components/ChatsList'
import { SavedPromptsList } from './components/SavedPromptsList'
import { SystemInstructions } from './components/SystemInstructions'
import { PersonaSelector } from './components/PersonaSelector'
import { OutputTypeSelector } from './components/OutputTypeSelector'
import { ChatBox } from './components/ChatBox'
import { ChatHistory } from './components/ChatHistory'
import { PreviewPane } from './components/PreviewPane'
import { ResizableDivider } from './components/ResizableDivider'
import { EditorToolbar } from './components/EditorToolbar'
import { StylePanel } from './components/StylePanel'
import { downloadHtmlFile, sanitizeFilename } from './utils/downloadUtils'

function App() {
  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Title prompt modal state
  const [isTitlePromptOpen, setIsTitlePromptOpen] = useState(false)
  const [pendingMessages, setPendingMessages] = useState(null)

  // Save prompt modal state
  const [isSavePromptOpen, setIsSavePromptOpen] = useState(false)

  // Style panel state
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false)

  // Iframe ref for screenshot capture
  const iframeRef = useRef(null)

  // Visual editor hook
  const {
    isEditMode,
    selectedElement,
    editedHtml,
    toggleEditMode,
    deleteSelected,
    updateStyle,
    clearEdits,
  } = useVisualEditor(iframeRef)

  // Container ref for resizable panels
  const mainContainerRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Resizable panel widths
  const [sidebarWidth, setSidebarWidth] = useLocalStorage('ai-builder-sidebar-width', 320)
  const [chatWidth, setChatWidth] = useLocalStorage('ai-builder-chat-width', 450)

  // Persisted settings
  const [apiKey, setApiKey] = useLocalStorage('ai-builder-api-key', '')
  const [provider, setProvider] = useLocalStorage('ai-builder-provider', 'gemini')
  const [model, setModel] = useLocalStorage('ai-builder-model', 'gemini-2.5-pro-preview-06-05')
  const [systemInstructions, setSystemInstructions] = useLocalStorage('ai-builder-system', '')
  const [persona, setPersona] = useLocalStorage('ai-builder-persona', '')
  const [outputType, setOutputType] = useLocalStorage('ai-builder-output-type', 'ui-mockup')

  // Chat history management
  const {
    chats,
    currentChatId,
    currentChat,
    isNewChat,
    createChat,
    updateChat,
    loadChat,
    deleteChat,
    startNewChat,
    renameChat,
  } = useChatHistory()

  // Saved prompts management
  const {
    savedPrompts,
    savePrompt,
    deletePrompt,
  } = useSavedPrompts()

  // Chat state
  const {
    messages,
    setMessages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  } = useAIChat({
    apiKey,
    provider,
    model,
    systemInstructions,
    persona,
    outputType,
  })

  // Track previous message count to detect new messages
  const prevMessageCount = useRef(0)
  const hasPromptedForTitle = useRef(false)

  // Load chat when currentChatId changes (user selected a chat)
  useEffect(() => {
    if (currentChatId && currentChat) {
      setMessages(currentChat.messages)
      hasPromptedForTitle.current = true // Already saved chat, don't prompt again
    }
  }, [currentChatId])

  // Auto-save existing chats (no auto-prompt for new chats)
  useEffect(() => {
    // Skip if no messages or still loading
    if (messages.length === 0 || isLoading) {
      prevMessageCount.current = messages.length
      return
    }

    // Detect if a new message was added (not just loading existing)
    const isNewMessage = messages.length > prevMessageCount.current
    prevMessageCount.current = messages.length

    if (!isNewMessage) return

    // Only auto-save if it's an existing chat
    if (currentChatId) {
      updateChat(currentChatId, messages)
    }
  }, [messages, isLoading, currentChatId, updateChat])

  // Handle manual save chat
  const handleSaveChat = () => {
    if (messages.length > 0) {
      setPendingMessages([...messages])
      setIsTitlePromptOpen(true)
    }
  }

  // Handle title save
  const handleSaveWithTitle = (title) => {
    if (pendingMessages) {
      createChat(title, pendingMessages)
      setPendingMessages(null)
    }
    setIsTitlePromptOpen(false)
  }

  // Handle title prompt cancel
  const handleTitlePromptClose = () => {
    setIsTitlePromptOpen(false)
    setPendingMessages(null)
    // Chat continues unsaved until next message
    hasPromptedForTitle.current = false
  }

  // Handle chat selection
  const handleSelectChat = (id) => {
    const loadedMessages = loadChat(id)
    setMessages(loadedMessages)
    prevMessageCount.current = loadedMessages.length
    hasPromptedForTitle.current = true
  }

  // Handle new chat
  const handleNewChat = () => {
    clearChat()
    startNewChat()
    prevMessageCount.current = 0
    hasPromptedForTitle.current = false
  }

  // Handle delete chat
  const handleDeleteChat = (id) => {
    deleteChat(id)
    if (id === currentChatId) {
      clearChat()
      prevMessageCount.current = 0
      hasPromptedForTitle.current = false
    }
  }

  // Handle rename chat
  const handleRenameChat = (id, newTitle) => {
    renameChat(id, newTitle)
  }

  // Handle clear current chat
  const handleClearChat = () => {
    clearChat()
    if (currentChatId) {
      updateChat(currentChatId, [])
    }
    prevMessageCount.current = 0
  }

  // Handle save prompt
  const handleSavePrompt = (promptData) => {
    savePrompt(promptData)
  }

  // Handle copy prompt (show toast or feedback)
  const handleCopyPrompt = (text) => {
    // Could add toast notification here
    console.log('Prompt copied to clipboard')
  }

  // Handle export edited HTML
  const handleExportEditedHtml = () => {
    if (editedHtml) {
      const timestamp = new Date().toISOString().slice(0, 10)
      downloadHtmlFile(editedHtml, `edited-mockup-${timestamp}`)
    }
  }

  // Handle style update from panel
  const handleStyleUpdate = (styles) => {
    updateStyle(styles)
    setIsStylePanelOpen(false)
  }

  // Check if there's an assistant response to save
  const hasAssistantResponse = messages.some(m => m.role === 'assistant')

  // Suggested title from first user message
  const suggestedTitle = pendingMessages?.[0]?.content?.slice(0, 50) || ''

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#0f0a1a' }}>
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between border-b" style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a' }}>
        <div>
          <h1 className="text-xl font-bold text-text-primary">AI Agent Builder</h1>
          <p className="text-xs text-text-muted">Configure your AI assistant and generate outputs</p>
        </div>
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-text-muted hover:text-text-primary hover:bg-dark-surface-light rounded-lg transition-colors"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </header>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
        provider={provider}
        setProvider={setProvider}
        model={model}
        setModel={setModel}
      />

      {/* Title Prompt Modal */}
      <TitlePromptModal
        isOpen={isTitlePromptOpen}
        onClose={handleTitlePromptClose}
        onSave={handleSaveWithTitle}
        suggestedTitle={suggestedTitle}
      />

      {/* Save Prompt Modal */}
      <SavePromptModal
        isOpen={isSavePromptOpen}
        onClose={() => setIsSavePromptOpen(false)}
        onSave={handleSavePrompt}
        messages={messages}
        model={model}
        provider={provider}
        outputType={outputType}
        iframeRef={iframeRef}
        editedHtml={editedHtml}
      />

      {/* Style Panel */}
      <StylePanel
        isOpen={isStylePanelOpen}
        onClose={() => setIsStylePanelOpen(false)}
        selectedElement={selectedElement}
        onUpdateStyle={handleStyleUpdate}
      />

      <div className="flex-1 flex overflow-hidden" ref={mainContainerRef}>
        {/* Left Sidebar - Settings */}
        <aside
          className="p-4 overflow-y-auto flex flex-col gap-4 flex-shrink-0"
          style={{ width: `${sidebarWidth}px`, minWidth: '200px', maxWidth: '500px', backgroundColor: '#1a1425' }}
        >
          {/* My Chats */}
          <ChatsList
            chats={chats}
            currentChatId={currentChatId}
            onSelectChat={handleSelectChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            onRenameChat={handleRenameChat}
          />

          <hr style={{ borderColor: '#3d2e5a' }} />

          {/* Saved Prompts */}
          <SavedPromptsList
            prompts={savedPrompts}
            onDelete={deletePrompt}
            onCopyPrompt={handleCopyPrompt}
          />

          <hr style={{ borderColor: '#3d2e5a' }} />

          <SystemInstructions
            value={systemInstructions}
            onChange={setSystemInstructions}
          />

          <PersonaSelector
            value={persona}
            onChange={setPersona}
          />

          <OutputTypeSelector
            value={outputType}
            onChange={setOutputType}
          />
        </aside>

        {/* Sidebar Resizer */}
        <ResizableDivider
          onResize={setSidebarWidth}
          minLeft={200}
          maxLeft={500}
          containerRef={mainContainerRef}
        />

        {/* Main Content */}
        <main className="flex-1 flex min-w-0" ref={chatContainerRef}>
          {/* Chat Panel */}
          <div
            className="flex flex-col p-4 flex-shrink-0"
            style={{ width: `${chatWidth}px`, minWidth: '300px', maxWidth: '800px' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-text-secondary">Chat</div>
              <div className="flex items-center gap-3">
                {/* Save Chat button - only show for unsaved chats with messages */}
                {!currentChatId && messages.length > 0 && !isLoading && (
                  <button
                    onClick={handleSaveChat}
                    className="text-xs flex items-center gap-1 transition-colors"
                    style={{ color: '#06b6d4' }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Save Chat
                  </button>
                )}
                {/* Save Prompt button */}
                {hasAssistantResponse && !isLoading && (
                  <button
                    onClick={() => setIsSavePromptOpen(true)}
                    className="text-xs text-success hover:text-success/80 flex items-center gap-1 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h5a2 2 0 012 2v7a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h5v5.586l-1.293-1.293zM9 4a1 1 0 012 0v2H9V4z" />
                    </svg>
                    Save Prompt
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-danger/20 border border-danger/50 text-danger text-sm px-3 py-2 rounded-lg mb-2">
                {error}
              </div>
            )}

            <ChatHistory
              messages={messages}
              onClear={handleClearChat}
            />

            <div className="mt-4">
              <ChatBox
                onSend={sendMessage}
                isLoading={isLoading}
                disabled={!apiKey}
              />
            </div>
          </div>

          {/* Chat/Preview Resizer */}
          <ResizableDivider
            onResize={setChatWidth}
            minLeft={300}
            maxLeft={800}
            containerRef={chatContainerRef}
          />

          {/* Preview Panel */}
          <div className="flex-1 flex flex-col p-4 min-w-[300px]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-text-secondary">
                {outputType === 'ui-mockup' ? 'Live Preview' : 'Output'}
              </div>
              {outputType === 'ui-mockup' && hasAssistantResponse && (
                <EditorToolbar
                  isEditMode={isEditMode}
                  onToggleEditMode={toggleEditMode}
                  selectedElement={selectedElement}
                  onDelete={deleteSelected}
                  onStyleEdit={() => setIsStylePanelOpen(true)}
                  hasEdits={!!editedHtml}
                  onResetEdits={clearEdits}
                  onExport={handleExportEditedHtml}
                  disabled={!hasAssistantResponse}
                />
              )}
            </div>
            <PreviewPane
              ref={iframeRef}
              messages={messages}
              outputType={outputType}
              isEditMode={isEditMode}
              editedHtml={editedHtml}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
