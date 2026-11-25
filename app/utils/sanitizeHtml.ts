/**
 * Allowlist-санитайзер для HTML из TipTap / CMS.
 * Без DOM на сервере: режем опасные теги и атрибуты.
 */
const BLOCKED_TAGS = new Set([
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'select',
  'link',
  'meta',
  'base',
  'style',
  'svg',
  'math',
  'video',
  'audio',
  'source',
  'track',
])

const ALLOWED_ATTR = new Set([
  'href',
  'src',
  'alt',
  'title',
  'class',
  'target',
  'rel',
  'width',
  'height',
  'colspan',
  'rowspan',
])

function isSafeUrl(value: string) {
  const v = value.trim().toLowerCase()
  if (!v) return false
  if (v.startsWith('#') || v.startsWith('/') || v.startsWith('./') || v.startsWith('../')) return true
  if (v.startsWith('mailto:') || v.startsWith('tel:')) return true
  if (v.startsWith('https://') || v.startsWith('http://')) return true
  if (v.startsWith('//')) return false
  if (v.startsWith('javascript:') || v.startsWith('data:') || v.startsWith('vbscript:')) return false
  return false
}

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return ''

  let html = String(dirty)
    .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  html = html.replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (_full, rawTag: string, rawAttrs: string) => {
    const tag = rawTag.toLowerCase()
    const closing = _full.trimStart().startsWith('</')
    if (BLOCKED_TAGS.has(tag)) return ''
    if (closing) return `</${tag}>`

    const attrs: string[] = []
    const attrRe = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g
    let match: RegExpExecArray | null
    while ((match = attrRe.exec(rawAttrs))) {
      const attrName = match[1]
      if (!attrName) continue
      const name = attrName.toLowerCase()
      const value = match[2] ?? match[3] ?? match[4] ?? ''
      if (name.startsWith('on')) continue
      if (!ALLOWED_ATTR.has(name)) continue
      if ((name === 'href' || name === 'src') && !isSafeUrl(value)) continue
      if (name === 'target' && value !== '_blank' && value !== '_self') continue
      const safe = value.replace(/"/g, '&quot;')
      if (name === 'href' && value && !value.startsWith('#') && !value.startsWith('/')) {
        attrs.push(`rel="noopener noreferrer"`)
      }
      if (name === 'target' && value === '_blank' && !attrs.includes('rel="noopener noreferrer"')) {
        attrs.push(`rel="noopener noreferrer"`)
      }
      attrs.push(`${name}="${safe}"`)
    }

    const unique = [...new Set(attrs)]
    return unique.length ? `<${tag} ${unique.join(' ')}>` : `<${tag}>`
  })

  return html
}
