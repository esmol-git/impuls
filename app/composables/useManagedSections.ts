type MediaType = 'CATALOG' | 'NEWS' | 'REVIEW' | 'GALLERY'

interface SectionStatus {
  key: MediaType
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
    const map = Object.fromEntries((data.value || []).map((row) => [row.key, row.visible]))
    return {
      catalog: Boolean(map.CATALOG),
      news: Boolean(map.NEWS),
      reviews: Boolean(map.REVIEW),
      gallery: Boolean(map.GALLERY),
    }
  })

  return { sections: data, visible }
}
