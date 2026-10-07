import { computed } from 'vue'
import type { GalleryItem } from '~/types'
import { lockBodyScroll, unlockBodyScroll } from '~/utils/scrollLock'

export function useLightbox() {
  const activeIndex = useState<number | null>('lightbox-index', () => null)
  const items = useState<GalleryItem[]>('lightbox-items', () => [])
  const visible = useState('lightbox-visible', () => false)

  function open(index: number, galleryItems: GalleryItem[]) {
    items.value = galleryItems
    activeIndex.value = index
    visible.value = true
    lockBodyScroll()
  }

  function close() {
    visible.value = false
  }

  function onAfterLeave() {
    activeIndex.value = null
    items.value = []
    unlockBodyScroll()
  }

  function next() {
    if (activeIndex.value === null || !items.value.length) return
    activeIndex.value = (activeIndex.value + 1) % items.value.length
  }

  function prev() {
    if (activeIndex.value === null || !items.value.length) return
    activeIndex.value = (activeIndex.value - 1 + items.value.length) % items.value.length
  }

  const isOpen = computed(() => activeIndex.value !== null)
  const current = computed(() =>
    activeIndex.value !== null ? items.value[activeIndex.value] : null,
  )

  return { activeIndex, items, visible, isOpen, current, open, close, onAfterLeave, next, prev }
}
