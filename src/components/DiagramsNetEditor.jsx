import { useEffect, useRef, useCallback, useState } from 'react'
import { convert } from '@whitebite/diagram-converter'

export function DiagramsNetEditor({
  isOpen,
  onClose,
  mermaidCode,  // Mermaid source code to convert
  onSave,
  existingXml = null, // Previously saved diagrams.net XML
}) {
  const iframeRef = useRef(null)
  const hasSentData = useRef(false)
  const [isLoading, setIsLoading] = useState(true)
  const [conversionError, setConversionError] = useState(null)

  // Handle messages from diagrams.net
  const handleMessage = useCallback((event) => {
    // Only accept messages from diagrams.net
    if (!event.origin.includes('diagrams.net')) return

    try {
      const msg = typeof event.data === 'string' ? JSON.parse(event.data) : event.data

      if (msg.event === 'init') {
        setIsLoading(false)
        // diagrams.net is ready
        if (iframeRef.current && !hasSentData.current) {
          hasSentData.current = true

          // Use existing XML if available, otherwise convert from Mermaid
          let xmlToLoad = existingXml
          if (!xmlToLoad && mermaidCode) {
            try {
              const result = convert(mermaidCode, { from: 'mermaid', to: 'drawio' })
              xmlToLoad = result.output
              if (result.warnings && result.warnings.length > 0) {
                console.warn('Mermaid conversion warnings:', result.warnings)
              }
            } catch (e) {
              console.error('Mermaid conversion error:', e)
              setConversionError(e.message || 'Failed to convert Mermaid to Draw.io format')
            }
          }

          if (xmlToLoad) {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
              action: 'load',
              xml: xmlToLoad,
              title: 'Diagram'
            }), '*')
          }
        }
      }

      // Debug logging to see what events diagrams.net sends
      console.log('diagrams.net event:', msg.event, msg)

      if (msg.event === 'save') {
        // User clicked save - save the XML and close
        onSave(msg.xml)
        onClose()
      }

      if (msg.event === 'exit') {
        // Check if exit event includes XML data (saveAndExit scenario)
        if (msg.xml) {
          onSave(msg.xml)
        }
        onClose()
      }

      if (msg.event === 'export') {
        // Handle export if needed
        onSave(msg.data)
        onClose()
      }
    } catch (e) {
      console.error('Error parsing diagrams.net message:', e)
    }
  }, [existingXml, mermaidCode, onSave, onClose])

  // Set up message listener
  useEffect(() => {
    if (isOpen) {
      hasSentData.current = false
      setIsLoading(true)
      setConversionError(null)
      window.addEventListener('message', handleMessage)

      // Fallback: hide loading after 5 seconds even if init not received
      const timeout = setTimeout(() => {
        setIsLoading(false)
      }, 5000)

      return () => {
        window.removeEventListener('message', handleMessage)
        clearTimeout(timeout)
      }
    }
  }, [isOpen, handleMessage])

  // Handle iframe load event as backup
  const handleIframeLoad = () => {
    // Give it a moment for the init message, then hide loading
    setTimeout(() => setIsLoading(false), 2000)
  }

  if (!isOpen) return null

  // diagrams.net embed URL with parameters
  const embedUrl = 'https://embed.diagrams.net/?embed=1&proto=json&saveAndExit=1&noSaveBtn=0&noExitBtn=0'

  const hasContent = existingXml || mermaidCode

  return (
    <div className="fixed inset-0 bg-black/90 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a' }}>
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-text-primary">Visual Diagram Editor</h2>
          {existingXml ? (
            <span className="text-xs text-success">(Loading your saved diagram...)</span>
          ) : mermaidCode ? (
            <span className="text-xs text-accent">(Converting Mermaid to editable format...)</span>
          ) : (
            <span className="text-xs text-text-muted">(Create diagram visually)</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Powered by diagrams.net</span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm rounded bg-dark-surface-light hover:bg-dark-border text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Conversion error banner */}
      {conversionError && (
        <div className="px-4 py-2 text-xs border-b flex items-center gap-2" style={{ backgroundColor: '#450a0a', borderColor: '#ef4444', color: '#fca5a5' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>
            <strong>Conversion failed:</strong> {conversionError}.
            Try fixing the Mermaid syntax using "Edit Code" first, or create a new diagram from scratch.
          </span>
        </div>
      )}

      {/* Info banner */}
      {!conversionError && hasContent && (
        <div className="px-4 py-2 text-xs border-b flex items-center gap-2" style={{ backgroundColor: '#251d35', borderColor: '#3d2e5a', color: '#94a3b8' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <span>
            Your diagram has been converted. Edit visually, then click <strong>"Save & Exit"</strong> (File menu or top-right) when done.
          </span>
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10" style={{ top: '60px' }}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg" style={{ backgroundColor: '#1a1425' }}>
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-text-primary text-sm">
              {mermaidCode && !existingXml ? 'Converting and loading diagram...' : 'Loading diagrams.net editor...'}
            </span>
          </div>
        </div>
      )}

      {/* diagrams.net iframe */}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="flex-1 w-full border-0"
        title="diagrams.net Editor"
        onLoad={handleIframeLoad}
        allow="fullscreen"
      />
    </div>
  )
}
