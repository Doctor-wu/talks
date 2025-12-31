import fs from 'node:fs'
import path from 'node:path'

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function isNonEmptyObject(obj) {
  return !!obj && typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length > 0
}

function makeRichText(text) {
  // Mirror @tldraw/tlschema/src/misc/TLRichText.ts::toRichText
  const t = typeof text === 'string' ? text : ''
  const lines = t.split('\n')
  const content = lines.map((line) => {
    if (!line) return { type: 'paragraph' }
    return { type: 'paragraph', content: [{ type: 'text', text: line }] }
  })
  return { type: 'doc', content }
}

function richTextToPlainText(richText) {
  if (!richText || typeof richText !== 'object') return ''
  const parts = []
  const walk = (node) => {
    if (!node || typeof node !== 'object') return
    if (node.type === 'text' && typeof node.text === 'string') parts.push(node.text)
    const content = node.content
    if (Array.isArray(content)) content.forEach(walk)
  }
  walk(richText)
  return parts.join('')
}

const ENUMS = {
  font: ['draw', 'sans', 'serif', 'mono'],
  size: ['s', 'm', 'l', 'xl'],
  dash: ['draw', 'solid', 'dashed', 'dotted'],
  fill: ['none', 'semi', 'solid', 'pattern', 'fill'],
  textAlign: ['start', 'middle', 'end'],
  horizontalAlign: ['start', 'middle', 'end', 'start-legacy', 'end-legacy', 'middle-legacy'],
  verticalAlign: ['start', 'middle', 'end'],
  color: [
    'black',
    'grey',
    'light-violet',
    'violet',
    'blue',
    'light-blue',
    'yellow',
    'orange',
    'green',
    'light-green',
    'light-red',
    'red',
    'white',
  ],
  arrowKind: ['arc', 'elbow'],
  arrowhead: ['arrow', 'triangle', 'square', 'dot', 'pipe', 'diamond', 'inverted', 'bar', 'none'],
  geo: [
    'cloud',
    'rectangle',
    'ellipse',
    'triangle',
    'diamond',
    'pentagon',
    'hexagon',
    'octagon',
    'star',
    'rhombus',
    'rhombus-2',
    'oval',
    'trapezoid',
    'arrow-right',
    'arrow-left',
    'arrow-up',
    'arrow-down',
    'x-box',
    'check-box',
    'heart',
  ],
}

function ensureEnum(props, key, allowed, defaultValue) {
  if (allowed.includes(props[key])) return false
  props[key] = defaultValue
  return true
}

function ensureNumber(props, key, defaultValue, { nonZero = false, positive = false } = {}) {
  const v = props[key]
  if (typeof v !== 'number' || Number.isNaN(v)) {
    props[key] = defaultValue
    return true
  }
  if (nonZero && v === 0) {
    props[key] = defaultValue
    return true
  }
  if (positive && v < 0) {
    props[key] = defaultValue
    return true
  }
  return false
}

function ensureString(props, key, defaultValue = '') {
  if (typeof props[key] === 'string') return false
  props[key] = defaultValue
  return true
}

function findTemplateFile(dir) {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
  for (const f of files) {
    const p = path.join(dir, f)
    try {
      const j = readJson(p)
      if (j?.schema?.schemaVersion === 2 && isNonEmptyObject(j?.schema?.sequences))
        return p
    }
    catch {
      // ignore
    }
  }
  return null
}

const dir = process.argv[2] ?? 'talks/2025/moegobff_sz/src/public/tldraw'

if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
  console.error(`[fix-tldraw-docs] Directory not found: ${dir}`)
  process.exit(1)
}

const templatePath = process.argv[3] ?? findTemplateFile(dir)
if (!templatePath) {
  console.error(
    `[fix-tldraw-docs] Could not find a template JSON with non-empty schema.sequences in: ${dir}`
  )
  process.exit(1)
}

const template = readJson(templatePath)
const templateSequences = template?.schema?.sequences
if (!isNonEmptyObject(templateSequences)) {
  console.error(
    `[fix-tldraw-docs] Template has empty schema.sequences: ${templatePath}`
  )
  process.exit(1)
}

const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
let changedCount = 0
let skippedCount = 0

for (const f of files) {
  const p = path.join(dir, f)
  let j
  try {
    j = readJson(p)
  }
  catch (e) {
    console.warn(`[fix-tldraw-docs] Skip invalid JSON: ${p}`)
    skippedCount++
    continue
  }

  if (!j || typeof j !== 'object' || Array.isArray(j) || !j.store) {
    skippedCount++
    continue
  }

  let changed = false
  const store = j.store

  // 1) Ensure base document/page records exist (tldraw store references these).
  if (!store['document:document']) {
    store['document:document'] = {
      gridSize: 10,
      name: '',
      meta: {},
      id: 'document:document',
      typeName: 'document',
    }
    changed = true
  }
  if (!store['page:page']) {
    store['page:page'] = {
      meta: {},
      id: 'page:page',
      name: 'Page 1',
      index: 'a1',
      typeName: 'page',
    }
    changed = true
  }

  // 2) If shapes are missing parentId, default them to the single page.
  for (const [key, rec] of Object.entries(store)) {
    if (!rec || typeof rec !== 'object') continue
    if (rec.typeName === 'shape' && !rec.parentId) {
      rec.parentId = 'page:page'
      changed = true
    }
    // For legacy files, some records may lack meta; keep it consistent.
    if ((rec.typeName === 'shape' || rec.typeName === 'page' || rec.typeName === 'document') && !('meta' in rec)) {
      rec.meta = {}
      changed = true
    }
    // Ensure id matches the key when missing.
    if (!rec.id && typeof key === 'string') {
      rec.id = key
      changed = true
    }

    // 2.1) Fix shape prop compatibility for tldraw 3.x validation.
    if (rec.typeName === 'shape') {
      if (!rec.props || typeof rec.props !== 'object') rec.props = {}

      // Common legacy: align === 'justify' -> 'start'
      if (rec.props.align === 'justify') {
        rec.props.align = 'start'
        changed = true
      }

      // Arrow: props.kind is required and must be "arc" | "elbow"
      if (rec.type === 'arrow') {
        // Defaults from tldraw/src/lib/shapes/arrow/ArrowShapeUtil.tsx::getDefaultProps
        changed = ensureEnum(rec.props, 'kind', ENUMS.arrowKind, 'arc') || changed
        changed = ensureEnum(rec.props, 'dash', ENUMS.dash, 'draw') || changed
        changed = ensureEnum(rec.props, 'size', ENUMS.size, 'm') || changed
        changed = ensureEnum(rec.props, 'fill', ENUMS.fill, 'none') || changed
        changed = ensureEnum(rec.props, 'color', ENUMS.color, 'black') || changed
        changed = ensureEnum(rec.props, 'labelColor', ENUMS.color, 'black') || changed
        changed = ensureEnum(rec.props, 'arrowheadStart', ENUMS.arrowhead, 'none') || changed
        changed = ensureEnum(rec.props, 'arrowheadEnd', ENUMS.arrowhead, 'arrow') || changed
        changed = ensureEnum(rec.props, 'font', ENUMS.font, 'draw') || changed

        changed = ensureNumber(rec.props, 'bend', 0) || changed
        changed = ensureNumber(rec.props, 'labelPosition', 0.5) || changed
        changed = ensureNumber(rec.props, 'scale', 1, { nonZero: true }) || changed
        changed = ensureNumber(rec.props, 'elbowMidPoint', 0.5) || changed

        // Ensure start/end vec models
        if (!rec.props.start || typeof rec.props.start !== 'object') {
          rec.props.start = { x: 0, y: 0 }
          changed = true
        } else {
          if (typeof rec.props.start.x !== 'number') {
            rec.props.start.x = 0
            changed = true
          }
          if (typeof rec.props.start.y !== 'number') {
            rec.props.start.y = 0
            changed = true
          }
        }
        if (!rec.props.end || typeof rec.props.end !== 'object') {
          rec.props.end = { x: 2, y: 0 }
          changed = true
        } else {
          if (typeof rec.props.end.x !== 'number') {
            rec.props.end.x = 2
            changed = true
          }
          if (typeof rec.props.end.y !== 'number') {
            rec.props.end.y = 0
            changed = true
          }
        }

        // Arrow label: require props.text string. Prefer legacy richText extraction.
        if (typeof rec.props.text !== 'string') {
          rec.props.text = richTextToPlainText(rec.props.richText)
          changed = true
        }

        // Remove legacy/unrecognized arrow props that may fail strict validation
        if ('richText' in rec.props) {
          delete rec.props.richText
          changed = true
        }
      }

      // Text: props.richText is required (object). If missing, derive from props.text.
      if (rec.type === 'text') {
        // Defaults from tldraw/src/lib/shapes/text/TextShapeUtil.tsx::getDefaultProps
        changed = ensureEnum(rec.props, 'color', ENUMS.color, 'black') || changed
        changed = ensureEnum(rec.props, 'size', ENUMS.size, 'm') || changed
        changed = ensureEnum(rec.props, 'font', ENUMS.font, 'draw') || changed
        changed = ensureEnum(rec.props, 'textAlign', ENUMS.textAlign, 'start') || changed
        changed = ensureNumber(rec.props, 'w', 8, { nonZero: true }) || changed
        changed = ensureNumber(rec.props, 'scale', 1, { nonZero: true }) || changed
        if (typeof rec.props.autoSize !== 'boolean') {
          rec.props.autoSize = true
          changed = true
        }

        if (!isNonEmptyObject(rec.props.richText)) {
          rec.props.richText = makeRichText(rec.props.text)
          changed = true
        }

        // Remove legacy fields
        if ('text' in rec.props) {
          delete rec.props.text
          changed = true
        }
        if ('align' in rec.props) {
          delete rec.props.align
          changed = true
        }
      }

      // Geo: ensure full props set + remove legacy props.text
      if (rec.type === 'geo') {
        // Defaults from tldraw/src/lib/shapes/geo/GeoShapeUtil.tsx::getDefaultProps
        changed = ensureNumber(rec.props, 'w', 100, { nonZero: true }) || changed
        changed = ensureNumber(rec.props, 'h', 100, { nonZero: true }) || changed
        changed = ensureEnum(rec.props, 'geo', ENUMS.geo, 'rectangle') || changed
        changed = ensureEnum(rec.props, 'dash', ENUMS.dash, 'draw') || changed
        changed = ensureNumber(rec.props, 'growY', 0, { positive: true }) || changed
        changed = ensureString(rec.props, 'url', '') || changed
        changed = ensureNumber(rec.props, 'scale', 1, { nonZero: true }) || changed

        changed = ensureEnum(rec.props, 'color', ENUMS.color, 'black') || changed
        changed = ensureEnum(rec.props, 'labelColor', ENUMS.color, 'black') || changed
        changed = ensureEnum(rec.props, 'fill', ENUMS.fill, 'none') || changed
        changed = ensureEnum(rec.props, 'size', ENUMS.size, 'm') || changed
        changed = ensureEnum(rec.props, 'font', ENUMS.font, 'draw') || changed
        changed = ensureEnum(rec.props, 'align', ENUMS.horizontalAlign, 'middle') || changed
        changed = ensureEnum(rec.props, 'verticalAlign', ENUMS.verticalAlign, 'middle') || changed

        if (!isNonEmptyObject(rec.props.richText)) {
          rec.props.richText = makeRichText(rec.props.text)
          changed = true
        }
        if ('text' in rec.props) {
          delete rec.props.text
          changed = true
        }
      }
    }
  }

  // 3) Ensure schema exists and has sequences (required for interpreting record versions).
  if (!j.schema || typeof j.schema !== 'object') {
    j.schema = { schemaVersion: 2, sequences: { ...templateSequences } }
    changed = true
  }
  else {
    if (j.schema.schemaVersion !== 2) {
      j.schema.schemaVersion = 2
      changed = true
    }
    if (!isNonEmptyObject(j.schema.sequences)) {
      j.schema.sequences = { ...templateSequences }
      changed = true
    }
  }

  if (!changed) continue

  // Write backup once
  const backupPath = `${p}.bak`
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(p, backupPath)
  }

  writeJson(p, j)
  changedCount++
}

console.log(
  `[fix-tldraw-docs] Done. Template=${path.relative(process.cwd(), templatePath)} changed=${changedCount} skipped=${skippedCount}`
)


