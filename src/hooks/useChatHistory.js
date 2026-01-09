import { useCallback, useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'

export function useChatHistory() {
  const [chatHistory, setChatHistory] = useLocalStorage('ai-builder-chats', {
    chats: [],
    currentChatId: null
  })

  const migrationDone = useRef(false)

  // Migrate legacy messages on first load
  useEffect(() => {
    if (migrationDone.current) return
    migrationDone.current = true

    try {
      const legacyMessages = localStorage.getItem('ai-builder-messages')
      if (legacyMessages) {
        const messages = JSON.parse(legacyMessages)
        if (Array.isArray(messages) && messages.length > 0) {
          const id = generateId()
          const now = Date.now()
          const title = messages[0]?.content?.slice(0, 50) || 'Previous Conversation'

          setChatHistory(prev => ({
            chats: [
              { id, title, timestamp: now, updatedAt: now, messages },
              ...prev.chats
            ],
            currentChatId: id
          }))

          localStorage.removeItem('ai-builder-messages')
        }
      }
    } catch (e) {
      console.error('Migration failed:', e)
    }
  }, [])

  // Generate unique ID
  const generateId = () => `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Create a new chat with title and messages
  const createChat = useCallback((title, messages) => {
    const id = generateId()
    const now = Date.now()

    setChatHistory(prev => ({
      chats: [
        { id, title, timestamp: now, updatedAt: now, messages },
        ...prev.chats
      ],
      currentChatId: id
    }))

    return id
  }, [setChatHistory])

  // Update existing chat messages
  const updateChat = useCallback((id, messages) => {
    setChatHistory(prev => ({
      ...prev,
      chats: prev.chats.map(chat =>
        chat.id === id
          ? { ...chat, messages, updatedAt: Date.now() }
          : chat
      )
    }))
  }, [setChatHistory])

  // Load a chat (sets currentChatId, returns messages)
  const loadChat = useCallback((id) => {
    const chat = chatHistory.chats.find(c => c.id === id)
    if (chat) {
      setChatHistory(prev => ({ ...prev, currentChatId: id }))
      return chat.messages
    }
    return []
  }, [chatHistory.chats, setChatHistory])

  // Delete a chat
  const deleteChat = useCallback((id) => {
    setChatHistory(prev => ({
      chats: prev.chats.filter(c => c.id !== id),
      currentChatId: prev.currentChatId === id ? null : prev.currentChatId
    }))
  }, [setChatHistory])

  // Start fresh (new unsaved chat)
  const startNewChat = useCallback(() => {
    setChatHistory(prev => ({ ...prev, currentChatId: null }))
  }, [setChatHistory])

  // Rename a chat
  const renameChat = useCallback((id, newTitle) => {
    setChatHistory(prev => ({
      ...prev,
      chats: prev.chats.map(chat =>
        chat.id === id ? { ...chat, title: newTitle } : chat
      )
    }))
  }, [setChatHistory])

  // Derived values
  const currentChat = chatHistory.chats.find(c => c.id === chatHistory.currentChatId)
  const isNewChat = chatHistory.currentChatId === null

  return {
    chats: chatHistory.chats,
    currentChatId: chatHistory.currentChatId,
    currentChat,
    isNewChat,
    createChat,
    updateChat,
    loadChat,
    deleteChat,
    startNewChat,
    renameChat,
  }
}
