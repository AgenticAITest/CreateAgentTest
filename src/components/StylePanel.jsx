import { useState, useEffect } from 'react'

// Parse CSS color to hex
function parseColor(color) {
  if (!color || color === 'transparent' || color === 'rgba(0, 0, 0, 0)') return ''

  // Handle hex
  if (color.startsWith('#')) return color

  // Handle rgb/rgba
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (match) {
    const r = parseInt(match[1]).toString(16).padStart(2, '0')
    const g = parseInt(match[2]).toString(16).padStart(2, '0')
    const b = parseInt(match[3]).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }

  return ''
}

// Parse spacing value to number
function parseSpacing(value) {
  if (!value) return ''
  const num = parseInt(value)
  return isNaN(num) ? '' : num.toString()
}

export function StylePanel({ isOpen, onClose, selectedElement, onUpdateStyle }) {
  const [styles, setStyles] = useState({
    backgroundColor: '',
    color: '',
    borderColor: '',
    borderRadius: '',
    paddingTop: '',
    paddingRight: '',
    paddingBottom: '',
    paddingLeft: '',
    marginTop: '',
    marginRight: '',
    marginBottom: '',
    marginLeft: '',
  })

  // Update styles when selected element changes
  useEffect(() => {
    if (selectedElement?.styles) {
      const s = selectedElement.styles

      // Parse padding
      const paddingParts = s.padding?.split(' ') || []
      const pTop = paddingParts[0] || '0px'
      const pRight = paddingParts[1] || pTop
      const pBottom = paddingParts[2] || pTop
      const pLeft = paddingParts[3] || pRight

      // Parse margin
      const marginParts = s.margin?.split(' ') || []
      const mTop = marginParts[0] || '0px'
      const mRight = marginParts[1] || mTop
      const mBottom = marginParts[2] || mTop
      const mLeft = marginParts[3] || mRight

      setStyles({
        backgroundColor: parseColor(s.backgroundColor),
        color: parseColor(s.color),
        borderColor: parseColor(s.borderColor),
        borderRadius: parseSpacing(s.borderRadius),
        paddingTop: parseSpacing(pTop),
        paddingRight: parseSpacing(pRight),
        paddingBottom: parseSpacing(pBottom),
        paddingLeft: parseSpacing(pLeft),
        marginTop: parseSpacing(mTop),
        marginRight: parseSpacing(mRight),
        marginBottom: parseSpacing(mBottom),
        marginLeft: parseSpacing(mLeft),
      })
    }
  }, [selectedElement])

  const handleChange = (prop, value) => {
    setStyles(prev => ({ ...prev, [prop]: value }))
  }

  const handleApply = () => {
    const updates = {}

    // Colors
    if (styles.backgroundColor) updates.backgroundColor = styles.backgroundColor
    if (styles.color) updates.color = styles.color
    if (styles.borderColor) {
      updates.borderColor = styles.borderColor
      updates.borderStyle = 'solid'
      updates.borderWidth = '1px'
    }
    if (styles.borderRadius) updates.borderRadius = styles.borderRadius + 'px'

    // Padding
    if (styles.paddingTop || styles.paddingRight || styles.paddingBottom || styles.paddingLeft) {
      updates.padding = `${styles.paddingTop || 0}px ${styles.paddingRight || 0}px ${styles.paddingBottom || 0}px ${styles.paddingLeft || 0}px`
    }

    // Margin
    if (styles.marginTop || styles.marginRight || styles.marginBottom || styles.marginLeft) {
      updates.margin = `${styles.marginTop || 0}px ${styles.marginRight || 0}px ${styles.marginBottom || 0}px ${styles.marginLeft || 0}px`
    }

    onUpdateStyle(updates)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-end z-50">
      <div
        className="h-full w-72 overflow-y-auto shadow-xl"
        style={{ backgroundColor: '#1a1425' }}
      >
        {/* Header */}
        <div className="sticky top-0 px-4 py-3 border-b flex items-center justify-between" style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a' }}>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Edit Styles</h3>
            {selectedElement && (
              <span className="text-xs text-text-muted">
                {selectedElement.tagName}
                {selectedElement.id && `#${selectedElement.id}`}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Colors Section */}
          <div>
            <h4 className="text-xs font-medium text-text-secondary mb-3">Colors</h4>
            <div className="space-y-3">
              <ColorInput
                label="Background"
                value={styles.backgroundColor}
                onChange={(v) => handleChange('backgroundColor', v)}
              />
              <ColorInput
                label="Text Color"
                value={styles.color}
                onChange={(v) => handleChange('color', v)}
              />
              <ColorInput
                label="Border"
                value={styles.borderColor}
                onChange={(v) => handleChange('borderColor', v)}
              />
            </div>
          </div>

          {/* Border Radius */}
          <div>
            <h4 className="text-xs font-medium text-text-secondary mb-3">Border Radius</h4>
            <NumberInput
              label="Radius"
              value={styles.borderRadius}
              onChange={(v) => handleChange('borderRadius', v)}
              suffix="px"
            />
          </div>

          {/* Padding */}
          <div>
            <h4 className="text-xs font-medium text-text-secondary mb-3">Padding</h4>
            <SpacingGrid
              values={{
                top: styles.paddingTop,
                right: styles.paddingRight,
                bottom: styles.paddingBottom,
                left: styles.paddingLeft,
              }}
              onChange={(side, value) => handleChange(`padding${side.charAt(0).toUpperCase() + side.slice(1)}`, value)}
            />
          </div>

          {/* Margin */}
          <div>
            <h4 className="text-xs font-medium text-text-secondary mb-3">Margin</h4>
            <SpacingGrid
              values={{
                top: styles.marginTop,
                right: styles.marginRight,
                bottom: styles.marginBottom,
                left: styles.marginLeft,
              }}
              onChange={(side, value) => handleChange(`margin${side.charAt(0).toUpperCase() + side.slice(1)}`, value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-4 py-3 border-t flex gap-2" style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a' }}>
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors"
            style={{ backgroundColor: '#251d35', color: '#cbd5e1' }}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-3 py-2 rounded text-sm font-medium transition-colors bg-primary hover:bg-primary-hover text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  )
}

function ColorInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-20 text-xs text-text-muted">{label}</label>
      <div className="flex-1 flex items-center gap-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded cursor-pointer border-0 p-0"
          style={{ backgroundColor: 'transparent' }}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className="flex-1 px-2 py-1 rounded text-xs font-mono"
          style={{ backgroundColor: '#0f0a1a', color: '#f1f5f9', borderColor: '#3d2e5a' }}
        />
      </div>
    </div>
  )
}

function NumberInput({ label, value, onChange, suffix = '' }) {
  return (
    <div className="flex items-center gap-2">
      <label className="w-20 text-xs text-text-muted">{label}</label>
      <div className="flex-1 flex items-center">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="w-full px-2 py-1 rounded text-xs"
          style={{ backgroundColor: '#0f0a1a', color: '#f1f5f9', borderColor: '#3d2e5a' }}
        />
        {suffix && <span className="ml-1 text-xs text-text-muted">{suffix}</span>}
      </div>
    </div>
  )
}

function SpacingGrid({ values, onChange }) {
  return (
    <div className="grid grid-cols-3 gap-1 items-center">
      {/* Top row */}
      <div />
      <input
        type="number"
        value={values.top}
        onChange={(e) => onChange('top', e.target.value)}
        placeholder="0"
        className="px-2 py-1 rounded text-xs text-center"
        style={{ backgroundColor: '#0f0a1a', color: '#f1f5f9' }}
      />
      <div />

      {/* Middle row */}
      <input
        type="number"
        value={values.left}
        onChange={(e) => onChange('left', e.target.value)}
        placeholder="0"
        className="px-2 py-1 rounded text-xs text-center"
        style={{ backgroundColor: '#0f0a1a', color: '#f1f5f9' }}
      />
      <div className="h-8 rounded" style={{ backgroundColor: '#3d2e5a' }} />
      <input
        type="number"
        value={values.right}
        onChange={(e) => onChange('right', e.target.value)}
        placeholder="0"
        className="px-2 py-1 rounded text-xs text-center"
        style={{ backgroundColor: '#0f0a1a', color: '#f1f5f9' }}
      />

      {/* Bottom row */}
      <div />
      <input
        type="number"
        value={values.bottom}
        onChange={(e) => onChange('bottom', e.target.value)}
        placeholder="0"
        className="px-2 py-1 rounded text-xs text-center"
        style={{ backgroundColor: '#0f0a1a', color: '#f1f5f9' }}
      />
      <div />
    </div>
  )
}
