import { useState } from 'react'
import { DEFAULT_PERSONA_PROMPTS, DEFAULT_OUTPUT_TYPE_PROMPTS, enhancePrompt } from '../utils/promptEnhancer'

const PERSONAS = [
  { value: 'business-analyst', label: 'Business Analyst' },
  { value: 'architect', label: 'Software Architect' },
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'UI/UX Designer' },
  { value: 'product-manager', label: 'Product Manager' },
]

const OUTPUT_TYPES = [
  { value: 'coding', label: 'Coding' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'business-analysis', label: 'Business Analysis' },
  { value: 'ui-mockup', label: 'UI Mockup' },
  { value: 'documentation', label: 'Documentation' },
]

function EditPromptSubModal({ title, value, onChange, onSave, onCancel, onReset }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div
        className="rounded-xl border w-full max-w-2xl mx-4 shadow-2xl"
        style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a' }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#3d2e5a' }}>
          <h3 className="text-md font-semibold text-text-primary">{title}</h3>
          <button
            onClick={onCancel}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={14}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-text-primary font-mono resize-none"
            style={{ backgroundColor: '#0f0a1a' }}
          />
        </div>

        <div className="px-6 py-4 border-t flex justify-between" style={{ borderColor: '#3d2e5a' }}>
          <button
            onClick={onReset}
            className="px-3 py-2 text-sm text-warning hover:text-warning/80 transition-colors"
          >
            Reset to Default
          </button>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-dark-surface-light hover:bg-dark-border rounded-lg text-sm font-medium transition-colors text-text-primary"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors text-white"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PromptEditorModal({
  isOpen,
  onClose,
  systemInstructions,
  persona,
  outputType,
  customPersonas,
  customOutputTypes,
  getPersonaPrompt,
  getOutputTypePrompt,
  isPersonaCustomized,
  isOutputTypeCustomized,
  setPersonaPrompt,
  setOutputTypePrompt,
  resetPersona,
  resetOutputType,
  resetAllPrompts,
}) {
  const [activeTab, setActiveTab] = useState('preview')
  const [editingPersona, setEditingPersona] = useState(null)
  const [editingOutputType, setEditingOutputType] = useState(null)
  const [editText, setEditText] = useState('')

  if (!isOpen) return null

  // Generate combined preview
  const { systemMessage } = enhancePrompt({
    systemInstructions,
    persona,
    outputType,
    userPrompt: '',
    customPersonaPrompts: customPersonas,
    customOutputTypePrompts: customOutputTypes,
  })

  const renderPreviewTab = () => (
    <div className="space-y-4">
      <p className="text-xs text-text-muted">
        This is the combined system message that will be sent to the LLM based on your current settings.
      </p>

      {/* Source indicators */}
      <div className="flex flex-wrap gap-2 text-xs">
        {systemInstructions && (
          <span className="px-2 py-1 rounded" style={{ backgroundColor: '#2d1f42', color: '#c4b5fd' }}>
            System Instructions
          </span>
        )}
        {persona && (
          <span className="px-2 py-1 rounded" style={{ backgroundColor: '#1f2d42', color: '#93c5fd' }}>
            Persona: {PERSONAS.find(p => p.value === persona)?.label || persona}
            {isPersonaCustomized(persona) && <span className="ml-1 text-warning">*</span>}
          </span>
        )}
        {outputType && (
          <span className="px-2 py-1 rounded" style={{ backgroundColor: '#1f422d', color: '#86efac' }}>
            Output: {OUTPUT_TYPES.find(o => o.value === outputType)?.label || outputType}
            {isOutputTypeCustomized(outputType) && <span className="ml-1 text-warning">*</span>}
          </span>
        )}
      </div>

      {/* Combined prompt display */}
      <div
        className="p-4 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-96 overflow-y-auto"
        style={{ backgroundColor: '#0f0a1a', color: '#e2e8f0' }}
      >
        {systemMessage || <span className="text-text-muted italic">No system message configured. Select a persona or output type, or add system instructions.</span>}
      </div>
    </div>
  )

  const renderPersonasTab = () => (
    <div className="space-y-3">
      <p className="text-xs text-text-muted">
        Click on a persona to view or edit its prompt. Customized prompts are marked with *.
      </p>

      {PERSONAS.map(p => (
        <div
          key={p.value}
          className="p-3 rounded-lg cursor-pointer hover:bg-dark-surface-light transition-colors"
          style={{ backgroundColor: '#251d35' }}
          onClick={() => {
            setEditingPersona(p.value)
            setEditText(getPersonaPrompt(p.value))
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">
              {p.label}
              {isPersonaCustomized(p.value) && <span className="ml-1 text-warning">*</span>}
            </span>
            {isPersonaCustomized(p.value) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  resetPersona(p.value)
                }}
                className="text-xs text-danger hover:text-danger/80 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1 line-clamp-2">
            {getPersonaPrompt(p.value).slice(0, 120)}...
          </p>
        </div>
      ))}

      {/* Editing sub-modal */}
      {editingPersona && (
        <EditPromptSubModal
          title={`Edit ${PERSONAS.find(p => p.value === editingPersona)?.label} Prompt`}
          value={editText}
          onChange={setEditText}
          onSave={() => {
            setPersonaPrompt(editingPersona, editText)
            setEditingPersona(null)
          }}
          onCancel={() => setEditingPersona(null)}
          onReset={() => {
            setEditText(DEFAULT_PERSONA_PROMPTS[editingPersona] || '')
          }}
        />
      )}
    </div>
  )

  const renderOutputTypesTab = () => (
    <div className="space-y-3">
      <p className="text-xs text-text-muted">
        Click on an output type to view or edit its prompt. Customized prompts are marked with *.
      </p>

      {OUTPUT_TYPES.map(o => (
        <div
          key={o.value}
          className="p-3 rounded-lg cursor-pointer hover:bg-dark-surface-light transition-colors"
          style={{ backgroundColor: '#251d35' }}
          onClick={() => {
            setEditingOutputType(o.value)
            setEditText(getOutputTypePrompt(o.value))
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-primary">
              {o.label}
              {isOutputTypeCustomized(o.value) && <span className="ml-1 text-warning">*</span>}
            </span>
            {isOutputTypeCustomized(o.value) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  resetOutputType(o.value)
                }}
                className="text-xs text-danger hover:text-danger/80 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          <p className="text-xs text-text-muted mt-1 line-clamp-2">
            {getOutputTypePrompt(o.value).slice(0, 120)}...
          </p>
        </div>
      ))}

      {/* Editing sub-modal */}
      {editingOutputType && (
        <EditPromptSubModal
          title={`Edit ${OUTPUT_TYPES.find(o => o.value === editingOutputType)?.label} Prompt`}
          value={editText}
          onChange={setEditText}
          onSave={() => {
            setOutputTypePrompt(editingOutputType, editText)
            setEditingOutputType(null)
          }}
          onCancel={() => setEditingOutputType(null)}
          onReset={() => {
            setEditText(DEFAULT_OUTPUT_TYPE_PROMPTS[editingOutputType] || '')
          }}
        />
      )}
    </div>
  )

  const tabs = [
    { key: 'preview', label: 'Combined Preview' },
    { key: 'personas', label: 'Personas' },
    { key: 'output-types', label: 'Output Types' },
  ]

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        className="rounded-xl border w-full max-w-2xl mx-4 shadow-2xl max-h-[90vh] flex flex-col"
        style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#3d2e5a' }}>
          <h2 className="text-lg font-semibold text-text-primary">Prompt Editor</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: '#3d2e5a' }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeTab === 'preview' && renderPreviewTab()}
          {activeTab === 'personas' && renderPersonasTab()}
          {activeTab === 'output-types' && renderOutputTypesTab()}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between" style={{ borderColor: '#3d2e5a' }}>
          <button
            onClick={resetAllPrompts}
            className="px-4 py-2 text-sm text-danger hover:text-danger/80 transition-colors"
          >
            Reset All to Defaults
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
