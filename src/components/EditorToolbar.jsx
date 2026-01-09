export function EditorToolbar({
  isEditMode,
  onToggleEditMode,
  selectedElement,
  onDelete,
  onStyleEdit,
  hasEdits,
  onResetEdits,
  onExport,
  disabled = false
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Edit Mode Toggle */}
      <button
        onClick={onToggleEditMode}
        disabled={disabled}
        className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
          isEditMode
            ? 'bg-primary text-white'
            : 'bg-dark-surface-light text-text-secondary hover:text-text-primary hover:bg-dark-border'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isEditMode ? 'Exit edit mode' : 'Enter edit mode'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        {isEditMode ? 'Exit Edit' : 'Edit Mode'}
      </button>

      {/* Show these controls only in edit mode */}
      {isEditMode && (
        <>
          {/* Divider */}
          <div className="h-5 w-px bg-dark-border" />

          {/* Delete Button */}
          <button
            onClick={onDelete}
            disabled={!selectedElement}
            className={`p-1.5 rounded transition-colors ${
              selectedElement
                ? 'text-danger hover:bg-danger/20'
                : 'text-text-muted cursor-not-allowed opacity-50'
            }`}
            title="Delete selected element"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Style Edit Button */}
          <button
            onClick={onStyleEdit}
            disabled={!selectedElement}
            className={`p-1.5 rounded transition-colors ${
              selectedElement
                ? 'text-accent hover:bg-accent/20'
                : 'text-text-muted cursor-not-allowed opacity-50'
            }`}
            title="Edit styles"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Selected Element Info */}
          {selectedElement && (
            <span className="text-text-muted px-2 py-1 rounded" style={{ backgroundColor: '#1a1425' }}>
              {selectedElement.tagName}
              {selectedElement.id && <span className="text-primary">#{selectedElement.id}</span>}
              {selectedElement.className && (
                <span className="text-accent">.{selectedElement.className.split(' ')[0]}</span>
              )}
            </span>
          )}
        </>
      )}

      {/* Show edit indicators */}
      {hasEdits && (
        <>
          <div className="h-5 w-px bg-dark-border" />

          {/* Reset Edits */}
          <button
            onClick={onResetEdits}
            className="p-1.5 rounded text-warning hover:bg-warning/20 transition-colors"
            title="Reset all edits"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="px-2 py-1.5 rounded text-success hover:bg-success/20 transition-colors flex items-center gap-1"
            title="Export edited HTML"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            Export
          </button>
        </>
      )}
    </div>
  )
}
