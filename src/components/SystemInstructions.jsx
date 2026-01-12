export function SystemInstructions({ value, onChange, onPreviewClick, hasCustomizations }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1">
        System Instructions
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter guardrails and base instructions for the AI..."
        rows={4}
        className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none text-text-primary placeholder-text-muted"
      />
      <div className="flex items-center justify-between mt-1">
        <p className="text-xs text-text-muted">
          These instructions are prepended to every request
        </p>
        {onPreviewClick && (
          <button
            onClick={onPreviewClick}
            className="text-xs text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
            title="See how the LLM will see your system instructions combined with persona and output type prompts"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
            Preview full prompt
            {hasCustomizations && (
              <span className="w-1.5 h-1.5 rounded-full bg-warning" title="Custom prompts active"></span>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
