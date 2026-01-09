import { useMemo, forwardRef } from 'react'
import { extractHtmlFromResponse } from '../utils/promptEnhancer'
import { injectEditorScript } from '../utils/editorInjector'

export const PreviewPane = forwardRef(function PreviewPane({ messages, outputType, isEditMode = false, editedHtml = null }, ref) {
  // Extract HTML from messages
  const originalHtml = useMemo(() => {
    if (outputType !== 'ui-mockup') return null

    // Find the last assistant message with HTML
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i]
      if (msg.role === 'assistant') {
        const html = extractHtmlFromResponse(msg.content)
        if (html) return html
      }
    }
    return null
  }, [messages, outputType])

  // Use edited HTML if available, otherwise use original
  const baseHtml = editedHtml || originalHtml

  // Inject editor script when in edit mode
  const previewHtml = useMemo(() => {
    if (!baseHtml) return null
    if (isEditMode) {
      return injectEditorScript(baseHtml)
    }
    return baseHtml
  }, [baseHtml, isEditMode])

  if (outputType !== 'ui-mockup') {
    return (
      <div className="flex-1 flex items-center justify-center rounded-lg text-sm border" style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a', color: '#94a3b8' }}>
        Select "UI Mockup" output type to enable live preview
      </div>
    )
  }

  if (!previewHtml) {
    return (
      <div className="flex-1 flex items-center justify-center rounded-lg text-sm border" style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a', color: '#94a3b8' }}>
        <div className="text-center">
          <p>Live Preview</p>
          <p className="text-xs mt-1">Generated HTML will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg overflow-hidden border" style={{ borderColor: '#3d2e5a' }}>
      <div className="px-3 py-1 text-xs flex items-center justify-between" style={{ backgroundColor: '#251d35', color: '#cbd5e1' }}>
        <div className="flex items-center gap-2">
          <span>Live Preview</span>
          {isEditMode && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#7c3aed', color: 'white' }}>
              EDIT MODE
            </span>
          )}
          {editedHtml && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
              MODIFIED
            </span>
          )}
        </div>
        <button
          onClick={() => {
            const newWindow = window.open('', '_blank')
            newWindow.document.write(baseHtml)
            newWindow.document.close()
          }}
          className="text-primary hover:text-primary-light"
        >
          Open in new tab
        </button>
      </div>
      <iframe
        ref={ref}
        srcDoc={previewHtml}
        title="UI Preview"
        className="flex-1 w-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
})
