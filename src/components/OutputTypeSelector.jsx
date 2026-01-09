const OUTPUT_TYPES = [
  { value: 'coding', label: 'Coding' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'business-analysis', label: 'Business Analysis' },
  { value: 'ui-mockup', label: 'UI Mockup' },
  { value: 'documentation', label: 'Documentation' },
]

export function OutputTypeSelector({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1">
        Output Type
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
      >
        {OUTPUT_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      {value === 'ui-mockup' && (
        <p className="text-xs text-success mt-1">
          Live preview enabled - HTML will render below
        </p>
      )}
    </div>
  )
}
