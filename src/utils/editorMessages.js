// Message types for parent-iframe communication

// Parent -> Iframe messages
export const PARENT_MESSAGES = {
  TOGGLE_EDIT_MODE: 'TOGGLE_EDIT_MODE',
  DELETE_SELECTED: 'DELETE_SELECTED',
  UPDATE_STYLE: 'UPDATE_STYLE',
  REQUEST_HTML: 'REQUEST_HTML',
  DESELECT: 'DESELECT',
}

// Iframe -> Parent messages
export const IFRAME_MESSAGES = {
  READY: 'READY',
  ELEMENT_SELECTED: 'ELEMENT_SELECTED',
  ELEMENT_DESELECTED: 'ELEMENT_DESELECTED',
  HTML_UPDATED: 'HTML_UPDATED',
  ELEMENT_DELETED: 'ELEMENT_DELETED',
}

// Message source identifier
export const MESSAGE_SOURCE = 'visual-editor'
