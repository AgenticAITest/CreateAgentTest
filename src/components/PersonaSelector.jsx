const PERSONAS = [
  { value: '', label: 'None (General Assistant)' },
  { value: 'business-analyst', label: 'Business Analyst' },
  { value: 'architect', label: 'Software Architect' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'UI/UX Designer' },
  { value: 'product-manager', label: 'Product Manager' },
]

export function PersonaSelector({ value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-text-secondary mb-1">
        Persona
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-text-primary"
      >
        {PERSONAS.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  )
}
