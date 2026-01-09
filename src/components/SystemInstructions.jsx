export function SystemInstructions({ value, onChange }) {
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
      <p className="text-xs text-text-muted mt-1">
        These instructions are prepended to every request
      </p>
    </div>
  )
}
