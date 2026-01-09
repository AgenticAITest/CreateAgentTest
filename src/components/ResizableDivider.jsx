import { useCallback, useEffect, useState } from 'react'

export function ResizableDivider({ onResize, minLeft = 200, maxLeft = 500, containerRef }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !containerRef?.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newWidth = e.clientX - containerRect.left

    // Constrain within min/max bounds
    const clampedWidth = Math.min(Math.max(newWidth, minLeft), maxLeft)
    onResize(clampedWidth)
  }, [isDragging, containerRef, minLeft, maxLeft, onResize])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div
      onMouseDown={handleMouseDown}
      className="w-1 cursor-col-resize transition-colors flex-shrink-0"
      style={{
        backgroundColor: isDragging ? '#7c3aed' : '#3d2e5a'
      }}
      onMouseEnter={(e) => !isDragging && (e.target.style.backgroundColor = '#7c3aed80')}
      onMouseLeave={(e) => !isDragging && (e.target.style.backgroundColor = '#3d2e5a')}
    />
  )
}
