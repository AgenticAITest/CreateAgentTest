import html2canvas from 'html2canvas'

/**
 * Download HTML content as a file
 */
export function downloadHtmlFile(html, filename) {
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}.html`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Capture screenshot of an iframe element
 * Returns a data URL of the captured image
 */
export async function captureScreenshot(iframeElement) {
  if (!iframeElement) {
    console.error('No iframe element provided')
    return null
  }

  try {
    // Get the iframe's document
    const iframeDoc = iframeElement.contentDocument || iframeElement.contentWindow?.document
    if (!iframeDoc) {
      console.error('Cannot access iframe document')
      return null
    }

    // Use html2canvas to capture the iframe body
    const canvas = await html2canvas(iframeDoc.body, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scale: 2, // Higher quality
      logging: false,
      // Exclude editor overlay and related elements
      ignoreElements: (element) => {
        return element.classList?.contains('editor-overlay') ||
               element.classList?.contains('editor-highlight') ||
               element.hasAttribute?.('data-editor')
      }
    })

    return canvas.toDataURL('image/png')
  } catch (error) {
    console.error('Failed to capture screenshot:', error)
    return null
  }
}

/**
 * Download an image from a data URL
 */
export function downloadImage(dataUrl, filename) {
  const a = document.createElement('a')
  a.href = dataUrl
  a.download = `${filename}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * Sanitize filename by removing invalid characters
 */
export function sanitizeFilename(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid characters
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .toLowerCase()
    .slice(0, 50) // Limit length
}
