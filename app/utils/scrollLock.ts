let lockCount = 0
let scrollY = 0
let measuredScrollbarWidth: number | null = null

function getScrollbarWidth(): number {
  const fromLayout = window.innerWidth - document.documentElement.clientWidth
  if (fromLayout > 0) return fromLayout

  if (measuredScrollbarWidth !== null) return measuredScrollbarWidth

  const outer = document.createElement('div')
  outer.style.cssText = 'visibility:hidden;overflow:scroll;position:absolute;top:-9999px;width:100px;height:100px'
  document.body.appendChild(outer)

  const inner = document.createElement('div')
  inner.style.width = '100%'
  outer.appendChild(inner)

  measuredScrollbarWidth = outer.offsetWidth - inner.offsetWidth
  document.body.removeChild(outer)

  return measuredScrollbarWidth
}

function applyLockStyles() {
  scrollY = window.scrollY
  const scrollbarWidth = getScrollbarWidth()

  document.documentElement.style.setProperty(
    '--scrollbar-width',
    scrollbarWidth > 0 ? `${scrollbarWidth}px` : '0px',
  )
  document.documentElement.classList.add('scroll-locked')

  const body = document.body
  body.style.position = 'fixed'
  body.style.top = `-${scrollY}px`
  body.style.left = '0'
  body.style.right = '0'
  body.style.width = '100%'
}

function restoreScrollPosition(y: number) {
  const html = document.documentElement
  const previousBehavior = html.style.scrollBehavior

  html.style.scrollBehavior = 'auto'
  window.scrollTo(0, y)
  html.style.scrollBehavior = previousBehavior
}

function clearLockStyles() {
  const y = scrollY
  const body = document.body
  const html = document.documentElement

  body.style.position = ''
  body.style.top = ''
  body.style.left = ''
  body.style.right = ''
  body.style.width = ''

  html.classList.remove('scroll-locked')
  html.style.removeProperty('--scrollbar-width')

  requestAnimationFrame(() => {
    restoreScrollPosition(y)
  })
}

export function lockBodyScroll() {
  if (!import.meta.client) return

  if (lockCount === 0) applyLockStyles()
  lockCount++
}

export function unlockBodyScroll() {
  if (!import.meta.client) return

  lockCount = Math.max(0, lockCount - 1)
  if (lockCount > 0) return

  clearLockStyles()
}

export function resetBodyScroll() {
  if (!import.meta.client) return

  lockCount = 0
  clearLockStyles()
}
