export const DEFAULT_PERSONA_PROMPTS = {
  'business-analyst': `You are acting as a Business Analyst. Focus on requirements gathering, stakeholder needs, process optimization, and business value. Use clear, non-technical language when possible and emphasize ROI and business outcomes.`,
  'architect': `You are acting as a Software Architect. Focus on system design, scalability, maintainability, and technical trade-offs. Consider patterns, principles (SOLID, DRY), and long-term implications of design decisions.`,
  'developer': `You are acting as a Software Developer. Focus on clean, working code with good practices. Be practical and implementation-focused. Consider edge cases and error handling.`,
  'designer': `You are acting as a Senior UI/UX Designer with 10+ years of experience at top design agencies. You have expertise in:
- Modern design systems (Material Design, Apple HIG, Tailwind UI patterns)
- Visual design: color theory, typography, spacing, visual hierarchy
- Creating polished, pixel-perfect interfaces that feel premium
- Current design trends: glassmorphism, neumorphism, gradient meshes, micro-animations
- Accessibility and inclusive design
Your designs are sophisticated, cohesive, and would be featured on Dribbble or Behance.`,
  'product-manager': `You are acting as a Product Manager. Focus on user stories, feature prioritization, market fit, and balancing stakeholder needs. Think about MVP scope and iterative delivery.`,
}

export const DEFAULT_OUTPUT_TYPE_PROMPTS = {
  'coding': `Provide clean, well-structured code. Include comments only where logic isn't self-evident. Use modern best practices for the relevant language/framework.`,
  'architecture': `Provide architectural diagrams (using ASCII or describe components clearly), explain component relationships, data flows, and justify design decisions.`,
  'business-analysis': `Provide structured analysis with clear sections: Problem Statement, Requirements, Acceptance Criteria, and Success Metrics.`,
  'ui-mockup': `You are an expert UI/UX designer creating HIGH-FIDELITY, PRODUCTION-READY mockups.

DESIGN QUALITY REQUIREMENTS:
- Create sophisticated, modern, visually stunning designs that look like they came from a professional design tool (Figma, Sketch)
- Use a refined color palette with primary, secondary, and accent colors. Include subtle gradients where appropriate
- Apply proper visual hierarchy: larger/bolder headings, appropriate font weights, consistent spacing scale (8px base)
- Add depth with subtle box-shadows (layered shadows for cards/modals), and subtle borders
- Use modern typography: clean sans-serif fonts, proper line-height (1.5-1.6), letter-spacing for headings
- Include micro-interactions hints: hover states, transitions, button states
- Add visual polish: rounded corners (8-16px), proper padding (16-24px), consistent margins
- Use whitespace generously - don't crowd elements
- Include subtle background patterns or gradients for sections
- Add icons using Unicode symbols or simple SVG shapes where appropriate

LAYOUT & STRUCTURE:
- Use CSS Grid and Flexbox for sophisticated layouts
- Create clear visual sections with proper separation
- Implement responsive design with mobile-first approach
- Use max-width containers (1200px) with proper centering

COLOR GUIDANCE:
- Use a cohesive color scheme (suggest: modern blues, teals, or purple gradients)
- Ensure sufficient contrast for accessibility
- Use color to guide attention and indicate interactivity
- Apply subtle hover/active state colors

IMAGES - IMPORTANT:
- ALWAYS use real images from Unsplash for a realistic look
- Use this format: https://images.unsplash.com/photo-[PHOTO-ID]?w=[WIDTH]&h=[HEIGHT]&fit=crop
- Common useful Unsplash photo IDs:
  - Food/Restaurant: photo-1414235077428-338989a2e8c0, photo-1504674900247-0877df9cc836, photo-1540189549336-e6e99c3679fe, photo-1565299624946-b28f40a0ae38, photo-1482049016gy16-c8e0a4ceb5bc, photo-1567620905732-d2e7edabdf7f
  - People/Team: photo-1560250097-0b93528c311a, photo-1573497019940-1c28c88b4f3e, photo-1472099645785-5658abf4ff4e
  - Office/Business: photo-1497366216548-37526070297c, photo-1497215842964-222b430dc094
  - Nature/Landscape: photo-1506905925346-21bda4d32df4, photo-1469474968028-56623f02e42e
  - Technology: photo-1518770660439-4636190af475, photo-1550751827-4bd374c3f58b
  - Fashion/Lifestyle: photo-1483985988355-763728e1935b, photo-1445205170230-053b83016050
- Alternatively, use: https://source.unsplash.com/[WIDTH]x[HEIGHT]/?[KEYWORDS] for dynamic images by keyword
  - Example: https://source.unsplash.com/800x600/?fine-dining,food
  - Example: https://source.unsplash.com/400x300/?jakarta,restaurant
- NEVER use placeholder.com, placehold.it, or gray placeholder boxes
- Each image should have appropriate alt text

TECHNICAL REQUIREMENTS:
- Generate complete, self-contained HTML with all CSS in a <style> tag
- Do NOT use external JavaScript dependencies or CDNs
- Must render correctly in isolation
- Wrap output in markdown code block with \`\`\`html

Create designs that would impress a client - polished, professional, and modern with REAL images.`,
  'documentation': `Provide clear, well-organized documentation. Use appropriate headings, code examples where helpful, and consider the target audience's technical level.`,
  'diagram': `Create diagrams using Mermaid syntax. Supported diagram types:
- flowchart (for process flows, activity diagrams, swimlanes)
- sequenceDiagram (for interactions between systems/actors)
- classDiagram (for class relationships)
- stateDiagram-v2 (for state machines)
- gantt (for timelines and schedules)
- erDiagram (for entity relationships)

IMPORTANT RULES:
- Wrap the diagram in a \`\`\`mermaid code block
- Use clear, descriptive labels for nodes
- For swimlanes/activity diagrams, use flowchart with subgraphs for each role/lane
- Keep node IDs short (A, B, C or descriptive like validatePO) but labels descriptive
- Use decision diamonds {Decision?} for yes/no branches
- Add comments with %% to explain complex logic
- Use proper arrow types: --> for flow, -.-> for optional, ==> for emphasis

Example swimlane/activity diagram structure:
\`\`\`mermaid
flowchart TB
    subgraph Carrier["Carrier"]
        A[Arrive at dock]
    end
    subgraph Clerk["Warehouse Clerk"]
        B[Receive delivery note]
        C{Validate PO?}
        D[Assign dock door]
    end
    subgraph System["WMS System"]
        E[Check PO validity]
        F[Return result]
    end
    A --> B
    B --> C
    C -->|Check| E
    E --> F
    F -->|Valid| D
    F -->|Invalid| G[Reject delivery]
\`\`\`

For complex processes, break into logical sections and use clear labeling.`,
}

export function enhancePrompt({
  systemInstructions,
  persona,
  outputType,
  userPrompt,
  customPersonaPrompts = {},
  customOutputTypePrompts = {}
}) {
  const parts = []

  if (systemInstructions?.trim()) {
    parts.push(systemInstructions.trim())
  }

  if (persona) {
    const personaPrompt = customPersonaPrompts[persona] ?? DEFAULT_PERSONA_PROMPTS[persona]
    if (personaPrompt) {
      parts.push(personaPrompt)
    }
  }

  if (outputType) {
    const outputPrompt = customOutputTypePrompts[outputType] ?? DEFAULT_OUTPUT_TYPE_PROMPTS[outputType]
    if (outputPrompt) {
      parts.push(`Output Format Instructions:\n${outputPrompt}`)
    }
  }

  const systemMessage = parts.join('\n\n')

  return {
    systemMessage,
    userMessage: userPrompt,
  }
}

export function extractHtmlFromResponse(content) {
  if (!content) return null

  // Pattern 1: Match HTML code blocks with flexible language tag
  // Handles: ```html, ``` html, ```HTML, ```htm, ```markup, ```xml
  const htmlBlockRegex = /```\s*(?:html?|markup|xml)\s*\n?([\s\S]*?)```/gi
  const matches = [...content.matchAll(htmlBlockRegex)]

  if (matches.length > 0) {
    // Return the last HTML block (most likely the final/complete version)
    const html = matches[matches.length - 1][1].trim()
    if (html) return html
  }

  // Pattern 2: Match generic code blocks that contain HTML-like content
  const codeBlockRegex = /```\s*\n?([\s\S]*?)```/gi
  const codeMatches = [...content.matchAll(codeBlockRegex)]

  for (const match of codeMatches) {
    const code = match[1].trim()
    // Check if this code block contains HTML (more flexible check)
    if (
      code.includes('<!DOCTYPE') ||
      code.includes('<html') ||
      code.includes('<head') ||
      code.includes('<body') ||
      (code.includes('<div') && code.includes('<style')) ||
      (code.includes('<div') && code.includes('class='))
    ) {
      return code
    }
  }

  // Pattern 3: Handle unclosed code blocks (model truncation or formatting issues)
  // Match ```html or similar followed by content to end of string (greedy)
  const unclosedBlockRegex = /```\s*(?:html?|markup|xml)\s*\n?([\s\S]+)$/i
  const unclosedMatch = content.match(unclosedBlockRegex)
  if (unclosedMatch) {
    const code = unclosedMatch[1].trim()
    // Verify it looks like HTML
    if (code.includes('<!DOCTYPE') || code.includes('<html') || (code.includes('<div') && code.includes('<style'))) {
      console.log('extractHtmlFromResponse: Matched unclosed code block, length:', code.length)
      return code
    }
  }

  // Pattern 4: DOCTYPE html (full document without code blocks)
  const htmlDocRegex = /<!DOCTYPE html>[\s\S]*<\/html>/i
  const docMatch = content.match(htmlDocRegex)
  if (docMatch) {
    return docMatch[0]
  }

  // Pattern 5: <html> without DOCTYPE
  const htmlTagRegex = /<html[\s\S]*<\/html>/i
  const htmlMatch = content.match(htmlTagRegex)
  if (htmlMatch) {
    return htmlMatch[0]
  }

  // Pattern 6: Just head and body (no html wrapper)
  const headBodyRegex = /<head[\s\S]*<\/head>[\s\S]*<body[\s\S]*<\/body>/i
  const headBodyMatch = content.match(headBodyRegex)
  if (headBodyMatch) {
    return `<!DOCTYPE html><html>${headBodyMatch[0]}</html>`
  }

  // Pattern 7: Body content only (fallback for minimal responses)
  const bodyRegex = /<body[\s\S]*<\/body>/i
  const bodyMatch = content.match(bodyRegex)
  if (bodyMatch) {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>${bodyMatch[0]}</html>`
  }

  // Pattern 8: Look for any substantial HTML structure with divs
  const divStructureRegex = /<div[\s\S]*<\/div>/i
  const divMatch = content.match(divStructureRegex)
  if (divMatch && divMatch[0].length > 100) {
    // Extract any style tags that might be in the content
    const styleRegex = /<style[\s\S]*?<\/style>/gi
    const styleMatches = content.match(styleRegex)
    const styles = styleMatches ? styleMatches.join('\n') : ''

    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>${divMatch[0]}</body></html>`
  }

  // Pattern 9: Look for style + any HTML elements (some models output styles first)
  const styleFirstRegex = /(<style[\s\S]*?<\/style>[\s\S]*?)(<[a-z][\s\S]*>[\s\S]*<\/[a-z]+>)/i
  const styleFirstMatch = content.match(styleFirstRegex)
  if (styleFirstMatch) {
    const styles = styleFirstMatch[1]
    const htmlContent = styleFirstMatch[2]
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">${styles}</head><body>${htmlContent}</body></html>`
  }

  return null
}

export function extractMermaidFromResponse(content) {
  if (!content) return null

  // Pattern 1: Match ```mermaid code blocks
  const mermaidBlockRegex = /```\s*mermaid\s*\n?([\s\S]*?)```/gi
  const matches = [...content.matchAll(mermaidBlockRegex)]

  if (matches.length > 0) {
    // Return the last mermaid block (most likely the final/complete version)
    const mermaid = matches[matches.length - 1][1].trim()
    if (mermaid) return mermaid
  }

  // Pattern 2: Handle unclosed mermaid code blocks
  const unclosedBlockRegex = /```\s*mermaid\s*\n?([\s\S]+)$/i
  const unclosedMatch = content.match(unclosedBlockRegex)
  if (unclosedMatch) {
    const code = unclosedMatch[1].trim()
    // Verify it looks like Mermaid (starts with a diagram type)
    if (/^(flowchart|sequenceDiagram|classDiagram|stateDiagram|gantt|erDiagram|pie|graph)/i.test(code)) {
      return code
    }
  }

  // Pattern 3: Look for Mermaid content without code blocks (direct output)
  const diagramTypes = ['flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram-v2', 'stateDiagram', 'gantt', 'erDiagram', 'pie', 'graph']
  for (const type of diagramTypes) {
    const regex = new RegExp(`(${type}[\\s\\S]*?)(?=\`\`\`|$)`, 'i')
    const match = content.match(regex)
    if (match && match[1].trim().length > 20) {
      return match[1].trim()
    }
  }

  return null
}
