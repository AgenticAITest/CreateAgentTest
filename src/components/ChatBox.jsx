import { useState, useRef } from 'react'

const MAX_IMAGES = 4
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export function ChatBox({ onSend, isLoading, disabled, supportsImages = true }) {
  const [input, setInput] = useState('')
  const [images, setImages] = useState([])
  const [imageError, setImageError] = useState(null)
  const fileInputRef = useRef(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    if ((input.trim() || images.length > 0) && !isLoading && !disabled) {
      onSend(input, images)
      setInput('')
      setImages([])
      setImageError(null)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    setImageError(null)

    // Check total image count
    if (images.length + files.length > MAX_IMAGES) {
      setImageError(`Maximum ${MAX_IMAGES} images allowed`)
      e.target.value = ''
      return
    }

    const newImages = []

    for (const file of files) {
      // Validate file type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setImageError(`Invalid file type: ${file.name}. Use JPEG, PNG, GIF, or WebP.`)
        continue
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setImageError(`File too large: ${file.name}. Maximum size is 5MB.`)
        continue
      }

      // Convert to base64
      try {
        const base64 = await fileToBase64(file)
        newImages.push({
          data: base64.split(',')[1], // Remove data:image/...;base64, prefix
          mimeType: file.type,
          fileName: file.name,
          preview: base64 // Keep full data URL for preview
        })
      } catch (err) {
        setImageError(`Failed to read file: ${file.name}`)
      }
    }

    setImages(prev => [...prev, ...newImages].slice(0, MAX_IMAGES))
    e.target.value = '' // Reset input
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImageError(null)
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {/* Image thumbnails */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-dark-surface border border-dark-border rounded-lg">
          {images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img.preview}
                alt={img.fileName}
                className="h-16 w-16 object-cover rounded-md border border-dark-border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                x
              </button>
              <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white px-1 truncate rounded-b-md">
                {img.fileName}
              </span>
            </div>
          ))}
          <span className="self-center text-xs text-dark-text-secondary">
            {images.length}/{MAX_IMAGES}
          </span>
        </div>
      )}

      {/* Image error message */}
      {imageError && (
        <div className="text-red-400 text-xs px-1">
          {imageError}
        </div>
      )}

      {/* Input row */}
      <div className="flex gap-2">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(',')}
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Image attachment button */}
        <button
          type="button"
          onClick={openFilePicker}
          disabled={isLoading || disabled || !supportsImages || images.length >= MAX_IMAGES}
          title={!supportsImages ? "This provider doesn't support images" : images.length >= MAX_IMAGES ? "Maximum images reached" : "Attach images"}
          className="px-3 py-2 bg-dark-surface hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed border border-dark-border rounded-lg text-sm transition-colors self-end"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? "Enter API key to start..." : "Enter your prompt... (Shift+Enter for new line)"}
          disabled={isLoading || disabled}
          rows={6}
          className="flex-1 bg-dark-surface border border-dark-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none disabled:opacity-50 min-h-[140px]"
        />

        <button
          type="submit"
          disabled={isLoading || disabled || (!input.trim() && images.length === 0)}
          className="px-4 py-2 bg-primary hover:bg-primary-hover disabled:bg-dark-border disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors self-end"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending
            </span>
          ) : (
            'Send'
          )}
        </button>
      </div>
    </form>
  )
}

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
