import { lockBodyScroll, unlockBodyScroll } from '~/utils/scrollLock'

export function useCartDrawer() {
  const open = useState('cart-drawer-open', () => false)
  const favoritesOpen = useState('favorites-drawer-open', () => false)

  function show() {
    favoritesOpen.value = false
    open.value = true
    lockBodyScroll()
  }

  function hide() {
    open.value = false
  }

  function toggle() {
    if (open.value) hide()
    else show()
  }

  function onAfterLeave() {
    if (!open.value && !favoritesOpen.value) unlockBodyScroll()
  }

  return { open, show, hide, toggle, onAfterLeave }
}
