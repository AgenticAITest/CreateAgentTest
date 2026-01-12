import { PARENT_MESSAGES, IFRAME_MESSAGES, MESSAGE_SOURCE } from './editorMessages'

export function generateEditorScript() {
  return `
(function() {
  const MESSAGE_SOURCE = '${MESSAGE_SOURCE}';
  const PARENT_MESSAGES = ${JSON.stringify(PARENT_MESSAGES)};
  const IFRAME_MESSAGES = ${JSON.stringify(IFRAME_MESSAGES)};

  let isEditMode = true;
  let selectedElement = null;
  let overlay = null;
  let isDragging = false;
  let isResizing = false;
  let isEditingText = false;
  let dragStart = { x: 0, y: 0 };
  let elementStart = { x: 0, y: 0 };
  let resizeHandle = null;
  let originalSize = { width: 0, height: 0 };

  // Notify parent window
  function notifyParent(type, data = {}) {
    window.parent.postMessage({ source: MESSAGE_SOURCE, type, ...data }, '*');
  }

  // Get element info for parent
  function getElementInfo(el) {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const computed = window.getComputedStyle(el);
    return {
      tagName: el.tagName.toLowerCase(),
      className: el.className,
      id: el.id,
      rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
      styles: {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        borderColor: computed.borderColor,
        borderWidth: computed.borderWidth,
        borderRadius: computed.borderRadius,
        padding: computed.padding,
        margin: computed.margin,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
      }
    };
  }

  // Create selection overlay with resize handles
  function createOverlay() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'editor-overlay';
    overlay.innerHTML = \`
      <div class="editor-overlay-border"></div>
      <div class="editor-overlay-label"></div>
      <div class="editor-resize-handle" data-handle="nw"></div>
      <div class="editor-resize-handle" data-handle="n"></div>
      <div class="editor-resize-handle" data-handle="ne"></div>
      <div class="editor-resize-handle" data-handle="e"></div>
      <div class="editor-resize-handle" data-handle="se"></div>
      <div class="editor-resize-handle" data-handle="s"></div>
      <div class="editor-resize-handle" data-handle="sw"></div>
      <div class="editor-resize-handle" data-handle="w"></div>
    \`;

    const style = document.createElement('style');
    style.setAttribute('data-editor', 'true');
    style.textContent = \`
      .editor-overlay {
        position: fixed;
        pointer-events: none;
        z-index: 999999;
        display: none;
      }
      .editor-overlay.active {
        display: block;
      }
      .editor-overlay-border {
        position: absolute;
        inset: 0;
        border: 2px solid #7c3aed;
        background: rgba(124, 58, 237, 0.1);
        pointer-events: auto;
        cursor: move;
      }
      .editor-overlay-label {
        position: absolute;
        top: -24px;
        left: 0;
        background: #7c3aed;
        color: white;
        font-size: 11px;
        font-family: system-ui, sans-serif;
        padding: 2px 8px;
        border-radius: 4px 4px 0 0;
        white-space: nowrap;
      }
      .editor-resize-handle {
        position: absolute;
        width: 10px;
        height: 10px;
        background: #7c3aed;
        border: 2px solid white;
        border-radius: 2px;
        pointer-events: auto;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      }
      .editor-resize-handle[data-handle="nw"] { top: -5px; left: -5px; cursor: nw-resize; }
      .editor-resize-handle[data-handle="n"] { top: -5px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
      .editor-resize-handle[data-handle="ne"] { top: -5px; right: -5px; cursor: ne-resize; }
      .editor-resize-handle[data-handle="e"] { top: 50%; right: -5px; transform: translateY(-50%); cursor: e-resize; }
      .editor-resize-handle[data-handle="se"] { bottom: -5px; right: -5px; cursor: se-resize; }
      .editor-resize-handle[data-handle="s"] { bottom: -5px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
      .editor-resize-handle[data-handle="sw"] { bottom: -5px; left: -5px; cursor: sw-resize; }
      .editor-resize-handle[data-handle="w"] { top: 50%; left: -5px; transform: translateY(-50%); cursor: w-resize; }
      .editor-highlight {
        outline: 2px dashed #7c3aed !important;
        outline-offset: 2px;
      }
    \`;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    // Drag handlers on border
    const border = overlay.querySelector('.editor-overlay-border');
    border.addEventListener('mousedown', initDrag);

    // Resize handlers
    overlay.querySelectorAll('.editor-resize-handle').forEach(handle => {
      handle.addEventListener('mousedown', (e) => initResize(e, handle.dataset.handle));
    });
  }

  // Update overlay position
  function updateOverlay() {
    if (!overlay || !selectedElement) return;

    const rect = selectedElement.getBoundingClientRect();
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';

    const label = overlay.querySelector('.editor-overlay-label');
    const tagName = selectedElement.tagName.toLowerCase();
    const className = selectedElement.className ? '.' + selectedElement.className.split(' ')[0] : '';
    const id = selectedElement.id ? '#' + selectedElement.id : '';
    label.textContent = tagName + id + className;
  }

  // Select element
  function selectElement(el) {
    if (selectedElement === el) return;

    if (selectedElement) {
      selectedElement.classList.remove('editor-selected');
    }

    selectedElement = el;

    if (el) {
      el.classList.add('editor-selected');
      createOverlay();
      overlay.classList.add('active');
      updateOverlay();
      notifyParent(IFRAME_MESSAGES.ELEMENT_SELECTED, { element: getElementInfo(el) });
    } else {
      if (overlay) overlay.classList.remove('active');
      notifyParent(IFRAME_MESSAGES.ELEMENT_DESELECTED);
    }
  }

  // Handle click for selection
  function handleClick(e) {
    if (!isEditMode) return;
    if (isEditingText) return;

    // Ignore clicks on overlay itself
    if (e.target.closest('.editor-overlay')) return;

    e.preventDefault();
    e.stopPropagation();

    const target = e.target;

    // Don't select html, body, or script elements
    if (target === document.documentElement ||
        target === document.body ||
        target.tagName === 'SCRIPT' ||
        target.tagName === 'STYLE') {
      selectElement(null);
      return;
    }

    selectElement(target);
  }

  // Handle double-click for text editing
  function handleDoubleClick(e) {
    if (!isEditMode || !selectedElement) return;
    if (e.target.closest('.editor-overlay')) return;
    if (e.target !== selectedElement && !selectedElement.contains(e.target)) return;

    // Skip non-editable elements
    const skip = ['IMG', 'VIDEO', 'IFRAME', 'CANVAS', 'SVG', 'INPUT', 'TEXTAREA', 'SELECT'];
    if (skip.includes(selectedElement.tagName)) return;

    e.preventDefault();
    e.stopPropagation();
    startTextEdit();
  }

  // Start inline text editing
  function startTextEdit() {
    if (isEditingText || !selectedElement) return;
    isEditingText = true;

    // Store original text for cancel
    selectedElement.dataset.originalText = selectedElement.textContent;

    // Make element editable
    selectedElement.contentEditable = 'true';
    selectedElement.focus();

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(selectedElement);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    // Visual feedback - green outline
    selectedElement.style.outline = '2px solid #22c55e';
    selectedElement.style.outlineOffset = '2px';

    // Hide overlay while editing
    if (overlay) overlay.style.display = 'none';

    selectedElement.addEventListener('keydown', handleTextKeydown);
    selectedElement.addEventListener('blur', handleTextBlur);
    notifyParent(IFRAME_MESSAGES.TEXT_EDIT_START);
  }

  // Handle keyboard during text edit
  function handleTextKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      finishTextEdit(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      finishTextEdit(false);
    }
  }

  // Handle blur (clicking outside)
  function handleTextBlur() {
    setTimeout(() => {
      if (isEditingText) finishTextEdit(true);
    }, 100);
  }

  // Finish text editing
  function finishTextEdit(save) {
    if (!isEditingText || !selectedElement) return;
    isEditingText = false;

    selectedElement.removeEventListener('keydown', handleTextKeydown);
    selectedElement.removeEventListener('blur', handleTextBlur);
    selectedElement.contentEditable = 'false';
    selectedElement.style.outline = '';
    selectedElement.style.outlineOffset = '';

    if (!save && selectedElement.dataset.originalText !== undefined) {
      selectedElement.textContent = selectedElement.dataset.originalText;
    }
    delete selectedElement.dataset.originalText;

    if (overlay) overlay.style.display = '';
    updateOverlay();
    notifyParent(IFRAME_MESSAGES.TEXT_EDIT_END);

    if (save) {
      notifyParent(IFRAME_MESSAGES.HTML_UPDATED, { html: getCleanHtml() });
      notifyParent(IFRAME_MESSAGES.ELEMENT_SELECTED, { element: getElementInfo(selectedElement) });
    }
  }

  // Initialize drag
  function initDrag(e) {
    if (!selectedElement || isResizing) return;

    e.preventDefault();
    e.stopPropagation();

    isDragging = true;
    dragStart = { x: e.clientX, y: e.clientY };

    const computed = window.getComputedStyle(selectedElement);
    elementStart = {
      x: parseInt(computed.left) || 0,
      y: parseInt(computed.top) || 0
    };

    // Ensure element has position relative
    if (computed.position === 'static') {
      selectedElement.style.position = 'relative';
    }

    document.body.style.cursor = 'move';
    document.body.style.userSelect = 'none';
  }

  // Initialize resize
  function initResize(e, handle) {
    if (!selectedElement) return;

    e.preventDefault();
    e.stopPropagation();

    isResizing = true;
    resizeHandle = handle;
    dragStart = { x: e.clientX, y: e.clientY };

    const rect = selectedElement.getBoundingClientRect();
    originalSize = { width: rect.width, height: rect.height };

    const computed = window.getComputedStyle(selectedElement);
    elementStart = {
      x: parseInt(computed.left) || 0,
      y: parseInt(computed.top) || 0
    };

    document.body.style.cursor = handle + '-resize';
    document.body.style.userSelect = 'none';
  }

  // Handle mouse move
  function handleMouseMove(e) {
    if (!selectedElement) return;

    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      selectedElement.style.position = 'relative';
      selectedElement.style.left = (elementStart.x + dx) + 'px';
      selectedElement.style.top = (elementStart.y + dy) + 'px';

      updateOverlay();
    }

    if (isResizing) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;

      let newWidth = originalSize.width;
      let newHeight = originalSize.height;
      let newLeft = elementStart.x;
      let newTop = elementStart.y;

      // Handle different resize directions
      if (resizeHandle.includes('e')) {
        newWidth = Math.max(20, originalSize.width + dx);
      }
      if (resizeHandle.includes('w')) {
        newWidth = Math.max(20, originalSize.width - dx);
        newLeft = elementStart.x + dx;
      }
      if (resizeHandle.includes('s')) {
        newHeight = Math.max(20, originalSize.height + dy);
      }
      if (resizeHandle.includes('n')) {
        newHeight = Math.max(20, originalSize.height - dy);
        newTop = elementStart.y + dy;
      }

      selectedElement.style.width = newWidth + 'px';
      selectedElement.style.height = newHeight + 'px';

      if (resizeHandle.includes('w') || resizeHandle.includes('n')) {
        selectedElement.style.position = 'relative';
        selectedElement.style.left = newLeft + 'px';
        selectedElement.style.top = newTop + 'px';
      }

      updateOverlay();
    }
  }

  // Handle mouse up
  function handleMouseUp() {
    if (isDragging || isResizing) {
      isDragging = false;
      isResizing = false;
      resizeHandle = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';

      // Notify parent of HTML change
      notifyParent(IFRAME_MESSAGES.HTML_UPDATED, { html: getCleanHtml() });
    }
  }

  // Get clean HTML without editor artifacts
  function getCleanHtml() {
    const clone = document.documentElement.cloneNode(true);

    // Remove editor elements
    clone.querySelectorAll('.editor-overlay, [data-editor], style[data-editor]').forEach(el => el.remove());

    // Remove editor classes
    clone.querySelectorAll('.editor-selected, .editor-highlight').forEach(el => {
      el.classList.remove('editor-selected', 'editor-highlight');
    });

    // Remove text editing artifacts
    clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
    clone.querySelectorAll('[data-original-text]').forEach(el => el.removeAttribute('data-original-text'));

    return '<!DOCTYPE html>' + clone.outerHTML;
  }

  // Delete selected element
  function deleteSelected() {
    if (!selectedElement) return;

    const parent = selectedElement.parentNode;
    if (parent && selectedElement !== document.body && selectedElement !== document.documentElement) {
      selectedElement.remove();
      selectElement(null);
      notifyParent(IFRAME_MESSAGES.ELEMENT_DELETED);
      notifyParent(IFRAME_MESSAGES.HTML_UPDATED, { html: getCleanHtml() });
    }
  }

  // Update element style
  function updateStyle(styles) {
    if (!selectedElement) return;

    Object.entries(styles).forEach(([prop, value]) => {
      selectedElement.style[prop] = value;
    });

    updateOverlay();
    notifyParent(IFRAME_MESSAGES.HTML_UPDATED, { html: getCleanHtml() });
    notifyParent(IFRAME_MESSAGES.ELEMENT_SELECTED, { element: getElementInfo(selectedElement) });
  }

  // Handle messages from parent
  function handleParentMessage(e) {
    if (!e.data || e.data.source !== MESSAGE_SOURCE) return;

    const { type, ...data } = e.data;

    switch (type) {
      case PARENT_MESSAGES.TOGGLE_EDIT_MODE:
        isEditMode = data.enabled;
        if (!isEditMode) {
          selectElement(null);
        }
        break;
      case PARENT_MESSAGES.DELETE_SELECTED:
        deleteSelected();
        break;
      case PARENT_MESSAGES.UPDATE_STYLE:
        updateStyle(data.styles);
        break;
      case PARENT_MESSAGES.REQUEST_HTML:
        notifyParent(IFRAME_MESSAGES.HTML_UPDATED, { html: getCleanHtml() });
        break;
      case PARENT_MESSAGES.DESELECT:
        selectElement(null);
        break;
    }
  }

  // Hover highlight
  function handleMouseOver(e) {
    if (!isEditMode || isDragging || isResizing) return;
    if (e.target === document.body || e.target === document.documentElement) return;
    if (e.target.closest('.editor-overlay')) return;
    if (e.target === selectedElement) return;

    e.target.classList.add('editor-highlight');
  }

  function handleMouseOut(e) {
    if (!isEditMode) return;
    e.target.classList.remove('editor-highlight');
  }

  // Prevent default behaviors in edit mode
  function preventDefaults(e) {
    if (!isEditMode) return;
    if (e.target.tagName === 'A' || e.target.closest('a')) {
      e.preventDefault();
    }
  }

  // Initialize
  document.addEventListener('click', handleClick, true);
  document.addEventListener('dblclick', handleDoubleClick, true);
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);
  document.addEventListener('click', preventDefaults, true);
  window.addEventListener('message', handleParentMessage);

  // Notify parent that editor is ready
  notifyParent(IFRAME_MESSAGES.READY);
})();
`;
}

// Function to inject editor script into HTML
export function injectEditorScript(html) {
  if (!html) return html;

  const editorScript = generateEditorScript();

  // Try to inject before </body>
  if (html.includes('</body>')) {
    return html.replace(
      '</body>',
      `<script data-editor="true">${editorScript}</script></body>`
    );
  }

  // Try to inject before </html>
  if (html.includes('</html>')) {
    return html.replace(
      '</html>',
      `<script data-editor="true">${editorScript}</script></html>`
    );
  }

  // Append at the end
  return html + `<script data-editor="true">${editorScript}</script>`;
}
