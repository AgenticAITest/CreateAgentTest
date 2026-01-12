import { useState, useEffect, useMemo, useRef } from 'react'

// Generate HTML that renders a Mermaid diagram with detailed error handling
function createMermaidHtml(mermaidCode) {
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
    body {
      background: #0f0a1a;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    .mermaid {
      background: #1a1425;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #3d2e5a;
    }
    .error-container {
      background: #1a1425;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #ef4444;
      max-width: 100%;
    }
    .error-header {
      color: #ef4444;
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .error-header svg {
      width: 16px;
      height: 16px;
    }
    .error-message {
      color: #fca5a5;
      background: #450a0a;
      padding: 10px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 11px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .error-location {
      color: #f59e0b;
      font-weight: 500;
      margin-top: 10px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div id="mermaid-output" class="mermaid">
${mermaidCode}
  </div>
  <script>
    const mermaidCode = \`${escapedCode}\`;

    // Parse error message to extract line number
    function parseErrorLocation(errorStr) {
      const patterns = [
        /line\\s*(\\d+)/i,
        /at line\\s*(\\d+)/i,
        /Line\\s*(\\d+)/i,
        /row\\s*(\\d+)/i,
        /(\\d+):(\\d+)/,
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

    function showError(error) {
      const container = document.body;
      const errorMsg = error.message || error.str || String(error);
      const location = parseErrorLocation(errorMsg);

      const locationText = location?.line
        ? \`Line \${location.line}\${location.column ? ', column ' + location.column : ''}\`
        : 'Check syntax in editor';

      container.innerHTML = \`
        <div class="error-container">
          <div class="error-header">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            Syntax Error
          </div>
          <div class="error-message">\${errorMsg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div class="error-location">\${locationText}</div>
        </div>
      \`;
    }

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

    (async () => {
      try {
        await mermaid.parse(mermaidCode);
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

export function MermaidEditor({
  isOpen,
  onClose,
  mermaidCode,
  onSave,
}) {
  const [code, setCode] = useState('')
  const [debouncedCode, setDebouncedCode] = useState('')
  const iframeRef = useRef(null)

  // Initialize code when modal opens, reset when it closes
  useEffect(() => {
    if (isOpen && mermaidCode) {
      setCode(mermaidCode)
      setDebouncedCode(mermaidCode)
    }
    // Reset when closing to ensure fresh state on reopen
    if (!isOpen) {
      setCode('')
      setDebouncedCode('')
    }
  }, [isOpen, mermaidCode])

  // Debounce code changes for live preview
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCode(code)
    }, 500)
    return () => clearTimeout(timer)
  }, [code])

  // Generate preview HTML
  const previewHtml = useMemo(() => {
    if (!debouncedCode) return null
    return createMermaidHtml(debouncedCode)
  }, [debouncedCode])

  // Handle save
  const handleSave = () => {
    onSave(code)
    onClose()
  }

  // Handle export as SVG
  const handleExportSvg = () => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument
      const svg = iframeDoc?.querySelector('svg')
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg)
        const blob = new Blob([svgData], { type: 'image/svg+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'diagram.svg'
        a.click()
        URL.revokeObjectURL(url)
      }
    }
  }

  // Handle export as PNG
  const handleExportPng = async () => {
    if (iframeRef.current) {
      const iframeDoc = iframeRef.current.contentDocument
      const svg = iframeDoc?.querySelector('svg')
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()

        img.onload = () => {
          canvas.width = img.width * 2
          canvas.height = img.height * 2
          ctx.scale(2, 2)
          ctx.fillStyle = '#0f0a1a'
          ctx.fillRect(0, 0, canvas.width, canvas.height)
          ctx.drawImage(img, 0, 0)

          const pngUrl = canvas.toDataURL('image/png')
          const a = document.createElement('a')
          a.href = pngUrl
          a.download = 'diagram.png'
          a.click()
        }

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div
        className="rounded-xl border w-full max-w-6xl mx-4 shadow-2xl flex flex-col"
        style={{ backgroundColor: '#1a1425', borderColor: '#3d2e5a', height: '85vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#3d2e5a' }}>
          <h2 className="text-lg font-semibold text-text-primary">Edit Mermaid Diagram</h2>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content - Side by Side */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Code Editor */}
          <div className="w-1/2 flex flex-col border-r" style={{ borderColor: '#3d2e5a' }}>
            <div className="px-4 py-2 text-xs font-medium text-text-secondary border-b" style={{ borderColor: '#3d2e5a' }}>
              Mermaid Source Code
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 w-full bg-dark-bg px-4 py-3 text-sm font-mono text-text-primary resize-none focus:outline-none"
              style={{ backgroundColor: '#0f0a1a' }}
              spellCheck={false}
            />
          </div>

          {/* Right: Live Preview */}
          <div className="w-1/2 flex flex-col">
            <div className="px-4 py-2 text-xs font-medium text-text-secondary border-b" style={{ borderColor: '#3d2e5a' }}>
              Live Preview
            </div>
            {previewHtml ? (
              <iframe
                ref={iframeRef}
                srcDoc={previewHtml}
                title="Mermaid Preview"
                className="flex-1 w-full border-0"
                sandbox="allow-scripts"
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
                Enter Mermaid code to see preview
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-between" style={{ borderColor: '#3d2e5a' }}>
          <div className="flex gap-2">
            <button
              onClick={handleExportSvg}
              className="px-3 py-2 text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export SVG
            </button>
            <button
              onClick={handleExportPng}
              className="px-3 py-2 text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Export PNG
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-dark-surface-light hover:bg-dark-border rounded-lg text-sm font-medium transition-colors text-text-primary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg text-sm font-medium transition-colors text-white"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
