import { useState, useEffect } from 'react'
import { downloadHtmlFile, captureScreenshot, downloadImage, sanitizeFilename } from '../utils/downloadUtils'
import { extractHtmlFromResponse } from '../utils/promptEnhancer'

export function SavePromptModal({
  isOpen,
  onClose,
  onSave,
  messages,
  model,
  provider,
  outputType,
  iframeRef,
  editedHtml = null
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [useEditedHtml, setUseEditedHtml] = useState(true)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setDescription('')
      setIsSaving(false)
      setUseEditedHtml(!!editedHtml)
    }
  }, [isOpen, editedHtml])

  // Get ALL user prompts and generated code
  const userPrompts = messages.filter(m => m.role === 'user').map(m => m.content)
  const allUserPromptsText = userPrompts.join('\n\n---\n\n')
  const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')?.content || ''
  const originalHtml = extractHtmlFromResponse(lastAssistantMessage)
  const generatedHtml = (useEditedHtml && editedHtml) ? editedHtml : originalHtml
  const isUiMockup = outputType === 'ui-mockup'
  const hasEdits = !!editedHtml

  const handleSave = async () => {
    if (!name.trim()) return

    setIsSaving(true)
    const filename = sanitizeFilename(name)

    try {
      // Download HTML file
      if (generatedHtml) {
        downloadHtmlFile(generatedHtml, filename)
      }

      // Capture and download screenshot if UI mockup
      let hasScreenshot = false
      if (isUiMockup && iframeRef?.current) {
        const screenshotDataUrl = await captureScreenshot(iframeRef.current)
        if (screenshotDataUrl) {
          downloadImage(screenshotDataUrl, filename)
          hasScreenshot = true
        }
      }

      // Save prompt metadata with all user prompts
      onSave({
        name: name.trim(),
        description: description.trim(),
        model,
        provider,
        userPrompt: allUserPromptsText,
        promptCount: userPrompts.length,
        outputType,
        hasScreenshot,
      })

      onClose()
    } catch (error) {
      console.error('Failed to save prompt:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="rounded-xl border w-full max-w-md mx-4 shadow-2xl" style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#3d2e5a' }}>
          <h2 className="text-lg font-semibold text-text-primary">Save Prompt</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Prompt Name */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Prompt Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Restaurant Landing Page"
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary text-text-primary"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What makes this prompt good? Any notes for future use..."
              rows={3}
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-secondary resize-none text-text-primary"
            />
          </div>

          {/* Info Display */}
          <div className="bg-dark-bg rounded-lg p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-text-muted">Model:</span>
              <span className="text-text-secondary">{model}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Provider:</span>
              <span className="text-text-secondary">{provider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Output Type:</span>
              <span className="text-text-secondary">{outputType}</span>
            </div>
          </div>

          {/* Edited HTML Toggle */}
          {hasEdits && (
            <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#251d35' }}>
              <input
                type="checkbox"
                id="useEditedHtml"
                checked={useEditedHtml}
                onChange={(e) => setUseEditedHtml(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="useEditedHtml" className="text-sm text-text-secondary cursor-pointer">
                Use edited HTML
              </label>
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
                Modified
              </span>
            </div>
          )}

          {/* What will be saved */}
          <div className="text-xs text-text-muted">
            <p className="font-medium text-text-secondary mb-1">Will download:</p>
            <ul className="list-disc list-inside space-y-0.5">
              {generatedHtml && (
                <li>
                  {sanitizeFilename(name || 'prompt')}.html
                  {hasEdits && <span className="text-warning ml-1">({useEditedHtml ? 'edited' : 'original'})</span>}
                </li>
              )}
              {isUiMockup && <li>{sanitizeFilename(name || 'prompt')}.png (screenshot)</li>}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex gap-3" style={{ borderColor: '#3d2e5a' }}>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-dark-surface-light hover:bg-dark-border rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="flex-1 px-4 py-2 bg-secondary hover:bg-secondary-hover disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save & Download'}
          </button>
        </div>
      </div>
    </div>
  )
}
