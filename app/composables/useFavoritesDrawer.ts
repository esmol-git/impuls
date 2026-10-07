import { lockBodyScroll, unlockBodyScroll } from '~/utils/scrollLock'

export function useFavoritesDrawer() {
  const open = useState('favorites-drawer-open', () => false)
  const { open: cartOpen, hide: hideCart } = useCartDrawer()

  function show() {
    if (cartOpen.value) hideCart()
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
    if (!open.value && !cartOpen.value) unlockBodyScroll()
  }

  return { open, show, hide, toggle, onAfterLeave }
}
