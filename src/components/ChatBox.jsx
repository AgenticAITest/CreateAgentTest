import { useState } from 'react'

export function ChatBox({ onSend, isLoading, disabled }) {
  const [input, setInput] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (input.trim() && !isLoading && !disabled) {
      onSend(input)
      setInput('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={disabled ? "Enter API key to start..." : "Enter your prompt... (Shift+Enter for new line)"}
        disabled={isLoading || disabled}
        rows={6}
        className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50 min-h-[140px]"
      />
      <button
        type="submit"
        disabled={isLoading || disabled || !input.trim()}
        className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-dark-border disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors self-end"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Sending
          </span>
        ) : (
          'Send'
        )}
      </button>
    </form>
  )
}
