import { useEffect, useRef } from 'react'

export function ChatHistory({ messages, onClear }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
        No messages yet. Start a conversation!
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto space-y-4 pr-2">
      {messages.map((msg, idx) => (
        <div
          key={idx}
          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className="max-w-[85%] rounded-lg px-4 py-2 text-sm"
            style={{
              backgroundColor: msg.role === 'user' ? '#7c3aed' : '#1a1425',
              color: '#f1f5f9'
            }}
          >
            <div className={`text-xs mb-1 ${msg.role === 'user' ? 'text-primary-light' : 'text-text-muted'}`}>
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </div>
            {/* Display images if present */}
            {msg.images && msg.images.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {msg.images.map((img, imgIdx) => (
                  <img
                    key={imgIdx}
                    src={img.preview}
                    alt={img.fileName || `Image ${imgIdx + 1}`}
                    className="h-20 w-20 object-cover rounded-md border border-white/20 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => window.open(img.preview, '_blank')}
                    title={`${img.fileName} - Click to view full size`}
                  />
                ))}
              </div>
            )}
            <div className="whitespace-pre-wrap break-words">
              {msg.content}
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />

      {messages.length > 0 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onClear}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors"
          >
            Clear conversation
          </button>
        </div>
      )}
    </div>
  )
}
