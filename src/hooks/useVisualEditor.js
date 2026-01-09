import { useState, useCallback, useEffect, useRef } from 'react'
import { PARENT_MESSAGES, IFRAME_MESSAGES, MESSAGE_SOURCE } from '../utils/editorMessages'

export function useVisualEditor(iframeRef) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedElement, setSelectedElement] = useState(null)
  const [editedHtml, setEditedHtml] = useState(null)
  const [isEditorReady, setIsEditorReady] = useState(false)

  // Send message to iframe
  const sendToIframe = useCallback((type, data = {}) => {
    if (!iframeRef?.current?.contentWindow) return

    iframeRef.current.contentWindow.postMessage(
      { source: MESSAGE_SOURCE, type, ...data },
      '*'
    )
  }, [iframeRef])

  // Handle messages from iframe
  useEffect(() => {
    function handleMessage(e) {
      if (!e.data || e.data.source !== MESSAGE_SOURCE) return

      const { type, ...data } = e.data

      switch (type) {
        case IFRAME_MESSAGES.READY:
          setIsEditorReady(true)
          break
        case IFRAME_MESSAGES.ELEMENT_SELECTED:
          setSelectedElement(data.element)
          break
        case IFRAME_MESSAGES.ELEMENT_DESELECTED:
          setSelectedElement(null)
          break
        case IFRAME_MESSAGES.HTML_UPDATED:
          setEditedHtml(data.html)
          break
        case IFRAME_MESSAGES.ELEMENT_DELETED:
          setSelectedElement(null)
          break
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Reset editor state when iframe changes
  useEffect(() => {
    setIsEditorReady(false)
    setSelectedElement(null)
  }, [iframeRef?.current?.src])

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    const newMode = !isEditMode
    setIsEditMode(newMode)
    sendToIframe(PARENT_MESSAGES.TOGGLE_EDIT_MODE, { enabled: newMode })

    if (!newMode) {
      setSelectedElement(null)
    }
  }, [isEditMode, sendToIframe])

  // Enable edit mode
  const enableEditMode = useCallback(() => {
    setIsEditMode(true)
    sendToIframe(PARENT_MESSAGES.TOGGLE_EDIT_MODE, { enabled: true })
  }, [sendToIframe])

  // Disable edit mode
  const disableEditMode = useCallback(() => {
    setIsEditMode(false)
    sendToIframe(PARENT_MESSAGES.TOGGLE_EDIT_MODE, { enabled: false })
    setSelectedElement(null)
  }, [sendToIframe])

  // Delete selected element
  const deleteSelected = useCallback(() => {
    if (!selectedElement) return
    sendToIframe(PARENT_MESSAGES.DELETE_SELECTED)
  }, [selectedElement, sendToIframe])

  // Update selected element's style
  const updateStyle = useCallback((styles) => {
    if (!selectedElement) return
    sendToIframe(PARENT_MESSAGES.UPDATE_STYLE, { styles })
  }, [selectedElement, sendToIframe])

  // Request current HTML from iframe
  const requestHtml = useCallback(() => {
    sendToIframe(PARENT_MESSAGES.REQUEST_HTML)
  }, [sendToIframe])

  // Deselect current element
  const deselect = useCallback(() => {
    sendToIframe(PARENT_MESSAGES.DESELECT)
    setSelectedElement(null)
  }, [sendToIframe])

  // Clear edited HTML (reset to original)
  const clearEdits = useCallback(() => {
    setEditedHtml(null)
  }, [])

  return {
    isEditMode,
    isEditorReady,
    selectedElement,
    editedHtml,
    toggleEditMode,
    enableEditMode,
    disableEditMode,
    deleteSelected,
    updateStyle,
    requestHtml,
    deselect,
    clearEdits,
  }
}
