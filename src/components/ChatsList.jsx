import { useState } from 'react'

function formatRelativeTime(timestamp) {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(timestamp).toLocaleDateString()
}

export function ChatsList({ chats, currentChatId, onSelectChat, onNewChat, onDeleteChat, onRenameChat }) {
  const [editingId, setEditingId] = useState(null)
  const [editingTitle, setEditingTitle] = useState('')

  const startEditing = (chat, e) => {
    e.stopPropagation()
    setEditingId(chat.id)
    setEditingTitle(chat.title)
  }

  const saveEdit = () => {
    if (editingTitle.trim() && editingId) {
      onRenameChat(editingId, editingTitle.trim())
    }
    setEditingId(null)
    setEditingTitle('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-accent">
          My Chats
        </label>
        <button
          onClick={onNewChat}
          className="text-xs text-accent hover:text-accent-light flex items-center gap-1 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          New Chat
        </button>
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {chats.length === 0 ? (
          <p className="text-xs text-text-muted py-2 text-center">No saved chats yet</p>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => editingId !== chat.id && onSelectChat(chat.id)}
              className="group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors border"
              style={{
                backgroundColor: chat.id === currentChatId ? 'rgba(6, 182, 212, 0.2)' : '#1a1425',
                borderColor: chat.id === currentChatId ? 'rgba(6, 182, 212, 0.3)' : 'transparent'
              }}
            >
              <div className="flex-1 min-w-0 pr-2">
                {editingId === chat.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveEdit}
                    autoFocus
                    className="w-full rounded px-2 py-0.5 text-sm focus:outline-none"
                    style={{ backgroundColor: '#0f0a1a', borderColor: '#06b6d4', border: '1px solid #06b6d4' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <>
                    <div className="text-sm truncate text-text-primary">{chat.title}</div>
                    <div className="text-xs text-text-muted">
                      {formatRelativeTime(chat.updatedAt)}
                    </div>
                  </>
                )}
              </div>

              {editingId !== chat.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  {/* Rename button */}
                  <button
                    onClick={(e) => startEditing(chat, e)}
                    className="p-1 text-text-muted hover:text-accent"
                    title="Rename chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteChat(chat.id)
                    }}
                    className="p-1 text-text-muted hover:text-danger"
                    title="Delete chat"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
