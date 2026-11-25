import { ref } from 'vue'
import { api } from '@/api/client'
import type { SectionStatus, SiteSectionKey } from '@/api/types'
import { getErrorMessage } from '@/utils/apiError'
import { useToast } from '@/composables/useToast'

/** Свитч «На сайте» для раздела (CATALOG / NEWS / REVIEW / GALLERY / COACHES). */
export function useSectionVisibility(key: () => SiteSectionKey) {
  const toast = useToast()
  const section = ref<SectionStatus | null>(null)
  const sectionSaving = ref(false)

  async function loadSection() {
    try {
      const list = await api<SectionStatus[]>('/api/admin/settings/sections')
      section.value = list.find((row) => row.key === key()) || null
    } catch {
      section.value = null
    }
  }

  async function onSectionToggle(enabled: boolean) {
    if (!section.value?.canEnable && enabled) {
      toast.error('Сначала добавьте хотя бы один элемент')
      return
    }
    sectionSaving.value = true
    try {
      section.value = await api<SectionStatus>(`/api/admin/settings/sections/${key()}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      })
      toast.success(enabled ? 'Раздел показывается на сайте' : 'Раздел скрыт на сайте')
    } catch (e) {
      toast.error(getErrorMessage(e, 'Не удалось обновить'))
      await loadSection()
    } finally {
      sectionSaving.value = false
    }
  }

  return {
    section,
    sectionSaving,
    loadSection,
    onSectionToggle,
  }
}
