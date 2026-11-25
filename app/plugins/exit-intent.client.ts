export default defineNuxtPlugin(() => {
  // Только desktop + мышь — на touch/mobile бессмысленно
  const desktop = window.matchMedia('(pointer: fine) and (min-width: 1024px)').matches
  if (!desktop) return

  const { open } = useModal()

  function onMouseLeave(e: MouseEvent) {
    if (sessionStorage.getItem('exit-shown')) return
    if (e.clientY > 0) return
    open('exit', { source: 'exit-intent' })
    sessionStorage.setItem('exit-shown', '1')
  }

  document.addEventListener('mouseleave', onMouseLeave)
})
