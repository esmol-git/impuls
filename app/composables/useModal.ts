import { computed } from 'vue'
import type { ModalPayload, ModalType } from '~/data/modals'
import { lockBodyScroll, unlockBodyScroll } from '~/utils/scrollLock'

export function useModal() {
  const active = useState<ModalType | null>('modal-active', () => null)
  const payload = useState<ModalPayload>('modal-payload', () => ({}))
  const visible = useState('modal-visible', () => false)

  function open(type: ModalType, data?: ModalPayload) {
    active.value = type
    payload.value = data ?? {}
    visible.value = true
    lockBodyScroll()
  }

  function close() {
    visible.value = false
  }

  function onAfterLeave() {
    active.value = null
    payload.value = {}
    unlockBodyScroll()
  }

  const isOpen = computed(() => active.value !== null)

  return { active, payload, visible, isOpen, open, close, onAfterLeave }
}
