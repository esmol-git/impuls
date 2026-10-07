export default defineNuxtPlugin(() => {
  const { open } = useModal()

  function onMouseLeave(e: MouseEvent) {
    if (sessionStorage.getItem('exit-shown')) return
    if (e.clientY > 0) return
    open('exit', { source: 'exit-intent' })
    sessionStorage.setItem('exit-shown', '1')
  }

  document.addEventListener('mouseleave', onMouseLeave)
})