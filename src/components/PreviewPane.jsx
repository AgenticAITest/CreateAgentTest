import { useMemo, forwardRef, useState } from 'react'
import { extractHtmlFromResponse, extractMermaidFromResponse } from '../utils/promptEnhancer'
import { injectEditorScript } from '../utils/editorInjector'

// Generate HTML that renders a Mermaid diagram with zoom support and detailed error handling
function createMermaidHtml(mermaidCode, zoom = 100) {
  // Escape the mermaid code for safe embedding in JavaScript string
  const escapedCode = mermaidCode
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      background: #0f0a1a;
      width: 100%;
      height: 100%;
      overflow: auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .diagram-container {
      min-width: 100%;
      min-height: 100%;
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 20px;
    }
    .mermaid-wrapper {
      transform: scale(${zoom / 100});
      transform-origin: top left;
    }
    .mermaid {
      background: #1a1425;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #3d2e5a;
    }
    .error-container {
      background: #1a1425;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ef4444;
      max-width: 900px;
    }
    .error-header {
      color: #ef4444;
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .error-header svg {
      width: 18px;
      height: 18px;
    }
    .error-message {
      color: #fca5a5;
      background: #450a0a;
      padding: 12px;
      border-radius: 6px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
      margin-bottom: 16px;
    }
    .error-location {
      color: #f59e0b;
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .code-preview {
      background: #0f0a1a;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #3d2e5a;
    }
    .code-preview-header {
      background: #251d35;
      padding: 8px 12px;
      font-size: 11px;
      color: #94a3b8;
      border-bottom: 1px solid #3d2e5a;
    }
    .code-lines {
      padding: 12px 0;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
      line-height: 1.6;
      overflow-x: auto;
    }
    .code-line {
      display: flex;
      padding: 0 12px;
    }
    .code-line:hover {
      background: #251d35;
    }
    .code-line.error-line {
      background: #450a0a;
    }
    .code-line.error-line:hover {
      background: #5c0d0d;
    }
    .line-number {
      color: #64748b;
      min-width: 40px;
      text-align: right;
      padding-right: 16px;
      user-select: none;
      flex-shrink: 0;
    }
    .line-number.error-line-num {
      color: #ef4444;
      font-weight: 600;
    }
    .line-content {
      color: #e2e8f0;
      white-space: pre;
    }
    .error-line .line-content {
      color: #fca5a5;
    }
    .error-indicator {
      color: #ef4444;
      margin-left: 4px;
    }
  </style>
</head>
<body>
  <div class="diagram-container">
    <div class="mermaid-wrapper">
      <div id="mermaid-output" class="mermaid">
${mermaidCode}
      </div>
    </div>
  </div>
  <script>
    const mermaidCode = \`${escapedCode}\`;

    // Parse error message to extract line number
    function parseErrorLocation(errorStr) {
      // Common patterns in Mermaid error messages
      const patterns = [
        /line\\s*(\\d+)/i,
        /at line\\s*(\\d+)/i,
        /Line\\s*(\\d+)/i,
        /row\\s*(\\d+)/i,
        /(\\d+):(\\d+)/,  // line:column format
        /character\\s*(\\d+)/i
      ];

      for (const pattern of patterns) {
        const match = errorStr.match(pattern);
        if (match) {
          return { line: parseInt(match[1], 10), column: match[2] ? parseInt(match[2], 10) : null };
        }
      }
      return null;
    }

    // Create error display with line numbers
    function showError(error) {
      const container = document.querySelector('.diagram-container');
      const errorMsg = error.message || error.str || String(error);
      const location = parseErrorLocation(errorMsg);

      const lines = mermaidCode.split('\\n');
      const errorLine = location?.line || null;

      // Determine which lines to show (context around error)
      let startLine = 0;
      let endLine = lines.length;
      if (errorLine && lines.length > 20) {
        startLine = Math.max(0, errorLine - 8);
        endLine = Math.min(lines.length, errorLine + 8);
      }

      const codeHtml = lines.slice(startLine, endLine).map((line, idx) => {
        const lineNum = startLine + idx + 1;
        const isErrorLine = lineNum === errorLine;
        return \`<div class="code-line \${isErrorLine ? 'error-line' : ''}">
          <span class="line-number \${isErrorLine ? 'error-line-num' : ''}">\${lineNum}</span>
          <span class="line-content">\${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}\${isErrorLine ? '<span class="error-indicator"> ← error</span>' : ''}</span>
        </div>\`;
      }).join('');

      const locationText = errorLine
        ? \`Error at line \${errorLine}\${location?.column ? ', column ' + location.column : ''}\`
        : 'Error location could not be determined - check syntax below';

      container.innerHTML = \`
        <div class="error-container">
          <div class="error-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Mermaid Syntax Error
          </div>
          <div class="error-message">\${errorMsg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div class="error-location">\${locationText}</div>
          <div class="code-preview">
            <div class="code-preview-header">
              \${startLine > 0 ? 'Lines ' + (startLine + 1) + '-' + endLine : 'Mermaid Source'} (Total: \${lines.length} lines)
            </div>
            <div class="code-lines">\${codeHtml}</div>
          </div>
        </div>
      \`;
    }

    // Initialize Mermaid with error handling
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        primaryColor: '#7c3aed',
        primaryTextColor: '#f1f5f9',
        primaryBorderColor: '#3d2e5a',
        lineColor: '#06b6d4',
        secondaryColor: '#251d35',
        tertiaryColor: '#1a1425',
        background: '#0f0a1a',
        mainBkg: '#1a1425',
        nodeBorder: '#3d2e5a',
        clusterBkg: '#251d35',
        clusterBorder: '#3d2e5a',
        titleColor: '#f1f5f9',
        edgeLabelBackground: '#1a1425'
      }
    });

    // Try to render, catch and display errors
    (async () => {
      try {
        // First try to parse/validate
        await mermaid.parse(mermaidCode);
        // If valid, render it
        const { svg } = await mermaid.render('mermaid-diagram', mermaidCode);
        document.getElementById('mermaid-output').innerHTML = svg;
      } catch (error) {
        console.error('Mermaid error:', error);
        showError(error);
      }
    })();
  </script>
</body>
</html>`
}

export const PreviewPane = forwardRef(function PreviewPane({
  messages,
  outputType,
  isEditMode = false,
  editedHtml = null,
  editedMermaid = null
}, ref) {
  // Zoom state for diagrams
  const [zoom, setZoom] = useState(100)

  // Zoom controls
  const zoomIn = () => setZoom(z => Math.min(200, z + 25))
  const zoomOut = () => setZoom(z => Math.max(25, z - 25))
  const zoomReset = () => setZoom(100)

  // Extract HTML from messages (for ui-mockup)
  const originalHtml = useMemo(() => {
    if (outputType !== 'ui-mockup') return null

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i]
      if (msg.role === 'assistant') {
        const html = extractHtmlFromResponse(msg.content)
        if (html) return html
      }
    }
    return null
  }, [messages, outputType])

  // Extract Mermaid from messages (for diagram)
  const originalMermaid = useMemo(() => {
    if (outputType !== 'diagram') return null

    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i]
      if (msg.role === 'assistant') {
        const mermaid = extractMermaidFromResponse(msg.content)
        if (mermaid) return mermaid
      }
    }
    return null
  }, [messages, outputType])

  // Use edited content if available
  const baseHtml = editedHtml || originalHtml
  const baseMermaid = editedMermaid || originalMermaid

  // Inject editor script when in edit mode (HTML only)
  const previewHtml = useMemo(() => {
    if (outputType === 'ui-mockup') {
      if (!baseHtml) return null
      if (isEditMode) {
        return injectEditorScript(baseHtml)
      }
      return baseHtml
    }
    if (outputType === 'diagram') {
      if (!baseMermaid) return null
      return createMermaidHtml(baseMermaid, zoom)
    }
    return null
  }, [baseHtml, baseMermaid, isEditMode, outputType, zoom])

  // Show placeholder for non-preview output types
  if (outputType !== 'ui-mockup' && outputType !== 'diagram') {
    return (
      <div className="flex-1 flex items-center justify-center rounded-lg text-sm border" style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a', color: '#94a3b8' }}>
        Select "UI Mockup" or "Diagram" output type to enable live preview
      </div>
    )
  }

  // Show placeholder when no content
  if (!previewHtml) {
    return (
      <div className="flex-1 flex items-center justify-center rounded-lg text-sm border" style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a', color: '#94a3b8' }}>
        <div className="text-center">
          <p>Live Preview</p>
          <p className="text-xs mt-1">
            {outputType === 'diagram' ? 'Generated diagram will appear here' : 'Generated HTML will appear here'}
          </p>
        </div>
      </div>
    )
  }

  const isModified = outputType === 'ui-mockup' ? !!editedHtml : !!editedMermaid
  const previewLabel = outputType === 'diagram' ? 'Diagram Preview' : 'Live Preview'

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg overflow-hidden border" style={{ borderColor: '#3d2e5a' }}>
      <div className="px-3 py-1 text-xs flex items-center justify-between" style={{ backgroundColor: '#251d35', color: '#cbd5e1' }}>
        <div className="flex items-center gap-2">
          <span>{previewLabel}</span>
          {isEditMode && outputType === 'ui-mockup' && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#7c3aed', color: 'white' }}>
              EDIT MODE
            </span>
          )}
          {isModified && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: '#f59e0b', color: 'white' }}>
              MODIFIED
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Zoom controls for diagram */}
          {outputType === 'diagram' && baseMermaid && (
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={zoomOut}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-dark-border transition-colors"
                title="Zoom out"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <span className="w-12 text-center text-[10px]">{zoom}%</span>
              <button
                onClick={zoomIn}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-dark-border transition-colors"
                title="Zoom in"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={zoomReset}
                className="px-1.5 py-0.5 rounded text-[10px] hover:bg-dark-border transition-colors"
                title="Reset zoom"
              >
                Fit
              </button>
            </div>
          )}
          <button
            onClick={() => {
              const newWindow = window.open('', '_blank')
              newWindow.document.write(previewHtml)
              newWindow.document.close()
            }}
            className="text-primary hover:text-primary-light"
          >
            Open in new tab
          </button>
        </div>
      </div>
      <iframe
        ref={ref}
        srcDoc={previewHtml}
        title={outputType === 'diagram' ? 'Diagram Preview' : 'UI Preview'}
        className="flex-1 w-full border-0"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  )
})
