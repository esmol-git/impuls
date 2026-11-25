const MIN_MS = 420
const MAX_MS = 1800

/** Снимает ранний #site-boot после гидрации / готовности страницы. */
export function useSiteBoot() {
  const done = useState('site-boot-done', () => false)

  function dismiss() {
    if (done.value) return
    done.value = true
    if (!import.meta.client) return
    const el = document.getElementById('site-boot')
    if (!el) return
    el.classList.add('is-done')
    el.setAttribute('aria-busy', 'false')
    window.setTimeout(() => el.remove(), 500)
  }

  onMounted(() => {
    if (done.value) {
      dismiss()
      return
    }

    const started = performance.now()
    let finished = false

    const finish = () => {
      if (finished) return
      finished = true
      const elapsed = performance.now() - started
      const wait = Math.max(0, MIN_MS - elapsed)
      window.setTimeout(dismiss, wait)
    }

    const hardCap = window.setTimeout(finish, MAX_MS)

    const whenReady = () => {
      window.clearTimeout(hardCap)
      // Дать hero/GSAP стартануть кадр
      requestAnimationFrame(() => requestAnimationFrame(finish))
    }

    if (document.readyState === 'complete') {
      whenReady()
    } else {
      window.addEventListener('load', whenReady, { once: true })
    }
  })

  return { done, dismiss }
}
