import type { Ref } from 'vue'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

function listFocusable(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => {
    if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') return false
    // offsetParent null у position:fixed — не используем его
    const style = getComputedStyle(el)
    return style.visibility !== 'hidden' && style.display !== 'none'
  })
}

/**
 * Ловит Tab внутри контейнера, возвращает фокус на триггер при закрытии.
 */
export function useFocusTrap(
  container: Ref<HTMLElement | null | undefined>,
  active: Ref<boolean>,
  options?: { onEscape?: () => void },
) {
  let previouslyFocused: HTMLElement | null = null

  function onKeydown(e: KeyboardEvent) {
    if (!active.value) return
    const root = container.value
    if (!root) return

    if (e.key === 'Escape') {
      options?.onEscape?.()
      return
    }

    if (e.key !== 'Tab') return

    const nodes = listFocusable(root)
    if (!nodes.length) {
      e.preventDefault()
      root.focus()
      return
    }

    const first = nodes[0]
    const last = nodes[nodes.length - 1]
    if (!first || !last) return
    const current = document.activeElement as HTMLElement | null

    if (e.shiftKey) {
      if (current === first || !root.contains(current)) {
        e.preventDefault()
        last.focus()
      }
      return
    }

    if (current === last || !root.contains(current)) {
      e.preventDefault()
      first.focus()
    }
  }

  function activate() {
    previouslyFocused = (document.activeElement as HTMLElement | null) || null
    document.addEventListener('keydown', onKeydown, true)
    nextTick(() => {
      const root = container.value
      if (!root) return
      const nodes = listFocusable(root)
      ;(nodes[0] || root).focus()
    })
  }

  function deactivate() {
    document.removeEventListener('keydown', onKeydown, true)
    if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus()
    }
    previouslyFocused = null
  }

  watch(
    active,
    (isActive) => {
      if (isActive) activate()
      else deactivate()
    },
    { flush: 'post' },
  )

  onUnmounted(() => {
    document.removeEventListener('keydown', onKeydown, true)
  })
}
