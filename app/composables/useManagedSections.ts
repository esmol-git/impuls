type SiteSectionKey = 'CATALOG' | 'NEWS' | 'REVIEW' | 'GALLERY' | 'COACHES'

interface SectionStatus {
  key: SiteSectionKey
  enabled: boolean
  itemCount: number
  canEnable: boolean
  visible: boolean
}

/** Видимость разделов, которыми управляет админка */
export async function useManagedSections() {
  const { data } = await useFetch<SectionStatus[]>('/api/settings/sections', {
    key: 'managed-sections',
    default: () => [],
  })

  const visible = computed(() => {
    const rows = data.value || []
    // Пустой ответ / сбой — fail-open, не прячем разделы
    if (!rows.length) {
      return { catalog: true, news: true, reviews: true, gallery: true, coaches: true }
    }
    const map = Object.fromEntries(rows.map((row) => [row.key, row.visible]))
    return {
      catalog: Boolean(map.CATALOG),
      news: Boolean(map.NEWS),
      reviews: Boolean(map.REVIEW),
      gallery: Boolean(map.GALLERY),
      coaches: Boolean(map.COACHES),
    }
  })

  return { sections: data, visible }
}
