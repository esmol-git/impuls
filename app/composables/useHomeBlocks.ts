import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'
import HeroSection from '~/components/HeroSection.vue'

export type HomeBlockKey =
  | 'hero'
  | 'stats'
  | 'programs'
  | 'painPoints'
  | 'audience'
  | 'childBenefits'
  | 'steps'
  | 'progression'
  | 'trainingQuality'
  | 'conditions'
  | 'ecosystem'
  | 'advantages'
  | 'video'
  | 'locations'
  | 'gallery'
  | 'catalog'
  | 'news'
  | 'reviews'
  | 'faq'
  | 'coaches'
  | 'cta'

export interface HomeBlockStatus {
  key: HomeBlockKey
  label: string
  description: string
  enabled: boolean
  sortOrder: number
  contentKey?: 'CATALOG' | 'NEWS' | 'REVIEW' | 'GALLERY' | 'COACHES'
  visible: boolean
}

/** Hero синхронно (LCP); остальное — async chunk ниже fold */
const blockComponents: Record<HomeBlockKey, Component> = {
  hero: HeroSection,
  stats: defineAsyncComponent(() => import('~/components/StatsBand.vue')),
  programs: defineAsyncComponent(() => import('~/components/HomeProgramsTabs.vue')),
  painPoints: defineAsyncComponent(() => import('~/components/PainPointsSection.vue')),
  audience: defineAsyncComponent(() => import('~/components/AudienceSection.vue')),
  childBenefits: defineAsyncComponent(() => import('~/components/ChildBenefitsSection.vue')),
  steps: defineAsyncComponent(() => import('~/components/StepsSection.vue')),
  progression: defineAsyncComponent(() => import('~/components/ProgressionSection.vue')),
  trainingQuality: defineAsyncComponent(() => import('~/components/TrainingQualitySection.vue')),
  conditions: defineAsyncComponent(() => import('~/components/ConditionsSection.vue')),
  ecosystem: defineAsyncComponent(() => import('~/components/EcosystemSection.vue')),
  advantages: defineAsyncComponent(() => import('~/components/AdvantagesSection.vue')),
  video: defineAsyncComponent(() => import('~/components/VideoSection.vue')),
  locations: defineAsyncComponent(() => import('~/components/LocationsPreviewSection.vue')),
  gallery: defineAsyncComponent(() => import('~/components/GallerySection.vue')),
  catalog: defineAsyncComponent(() => import('~/components/CatalogSection.vue')),
  news: defineAsyncComponent(() => import('~/components/NewsSection.vue')),
  reviews: defineAsyncComponent(() => import('~/components/ReviewsCarousel.vue')),
  faq: defineAsyncComponent(() => import('~/components/FaqAccordion.vue')),
  coaches: defineAsyncComponent(() => import('~/components/CoachesPreviewSection.vue')),
  cta: defineAsyncComponent(() => import('~/components/CtaSection.vue')),
}

/** Fallback, если API недоступен — как раньше в data/home.ts */
const FALLBACK_BLOCKS: HomeBlockStatus[] = [
  { key: 'hero', label: 'Герой', description: '', enabled: true, sortOrder: 0, visible: true },
  { key: 'stats', label: 'Цифры', description: '', enabled: true, sortOrder: 1, visible: true },
  { key: 'programs', label: 'Группы', description: '', enabled: true, sortOrder: 2, visible: true },
  { key: 'painPoints', label: 'Боли', description: '', enabled: true, sortOrder: 3, visible: true },
  { key: 'audience', label: 'Для кого', description: '', enabled: true, sortOrder: 4, visible: true },
  { key: 'childBenefits', label: 'Польза', description: '', enabled: true, sortOrder: 5, visible: true },
  { key: 'steps', label: 'Как начать', description: '', enabled: true, sortOrder: 6, visible: true },
  { key: 'progression', label: 'Прогрессия', description: '', enabled: true, sortOrder: 7, visible: true },
  { key: 'trainingQuality', label: 'О школе', description: '', enabled: true, sortOrder: 8, visible: true },
  { key: 'conditions', label: 'Условия', description: '', enabled: true, sortOrder: 9, visible: true },
  { key: 'ecosystem', label: 'Экосистема', description: '', enabled: true, sortOrder: 10, visible: true },
  { key: 'advantages', label: 'Преимущества', description: '', enabled: false, sortOrder: 11, visible: false },
  { key: 'video', label: 'Видео', description: '', enabled: true, sortOrder: 12, visible: true },
  { key: 'locations', label: 'Адреса', description: '', enabled: true, sortOrder: 13, visible: true },
  { key: 'gallery', label: 'Галерея', description: '', enabled: true, sortOrder: 14, visible: true, contentKey: 'GALLERY' },
  { key: 'catalog', label: 'Каталог', description: '', enabled: true, sortOrder: 15, visible: true, contentKey: 'CATALOG' },
  { key: 'news', label: 'Новости', description: '', enabled: true, sortOrder: 16, visible: true, contentKey: 'NEWS' },
  { key: 'reviews', label: 'Отзывы', description: '', enabled: true, sortOrder: 17, visible: true, contentKey: 'REVIEW' },
  { key: 'faq', label: 'FAQ', description: '', enabled: true, sortOrder: 18, visible: true },
  { key: 'coaches', label: 'Тренеры', description: '', enabled: true, sortOrder: 19, visible: true, contentKey: 'COACHES' },
  { key: 'cta', label: 'Заявка', description: '', enabled: true, sortOrder: 20, visible: true },
]

export async function useHomeBlocks() {
  const { data } = await useFetch<HomeBlockStatus[]>('/api/settings/home-blocks', {
    key: 'home-blocks',
    default: () => [],
  })

  const statusList = computed(() => (data.value?.length ? data.value : FALLBACK_BLOCKS))

  const blocks = computed(() => {
    return statusList.value
      .filter((row) => row.visible)
      .map((row) => ({
        ...row,
        component: blockComponents[row.key],
      }))
      .filter((row) => row.component)
  })

  function isBlockVisible(key: HomeBlockKey) {
    const row = statusList.value.find((item) => item.key === key)
    return row?.visible ?? false
  }

  return { blocks, raw: data, isBlockVisible, statusList }
}
