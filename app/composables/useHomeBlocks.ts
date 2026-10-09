import type { Component } from 'vue'
import AdvantagesSection from '~/components/AdvantagesSection.vue'
import AudienceSection from '~/components/AudienceSection.vue'
import CatalogSection from '~/components/CatalogSection.vue'
import ChildBenefitsSection from '~/components/ChildBenefitsSection.vue'
import CoachesPreviewSection from '~/components/CoachesPreviewSection.vue'
import ConditionsSection from '~/components/ConditionsSection.vue'
import CtaSection from '~/components/CtaSection.vue'
import EcosystemSection from '~/components/EcosystemSection.vue'
import FaqAccordion from '~/components/FaqAccordion.vue'
import GallerySection from '~/components/GallerySection.vue'
import HeroSection from '~/components/HeroSection.vue'
import HomeProgramsTabs from '~/components/HomeProgramsTabs.vue'
import LocationsPreviewSection from '~/components/LocationsPreviewSection.vue'
import NewsSection from '~/components/NewsSection.vue'
import PainPointsSection from '~/components/PainPointsSection.vue'
import ProgressionSection from '~/components/ProgressionSection.vue'
import ReviewsCarousel from '~/components/ReviewsCarousel.vue'
import StatsBand from '~/components/StatsBand.vue'
import StepsSection from '~/components/StepsSection.vue'
import TrainingQualitySection from '~/components/TrainingQualitySection.vue'
import VideoSection from '~/components/VideoSection.vue'

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
  contentKey?: 'CATALOG' | 'NEWS' | 'REVIEW' | 'GALLERY'
  visible: boolean
}

const blockComponents: Record<HomeBlockKey, Component> = {
  hero: HeroSection,
  stats: StatsBand,
  programs: HomeProgramsTabs,
  painPoints: PainPointsSection,
  audience: AudienceSection,
  childBenefits: ChildBenefitsSection,
  steps: StepsSection,
  progression: ProgressionSection,
  trainingQuality: TrainingQualitySection,
  conditions: ConditionsSection,
  ecosystem: EcosystemSection,
  advantages: AdvantagesSection,
  video: VideoSection,
  locations: LocationsPreviewSection,
  gallery: GallerySection,
  catalog: CatalogSection,
  news: NewsSection,
  reviews: ReviewsCarousel,
  faq: FaqAccordion,
  coaches: CoachesPreviewSection,
  cta: CtaSection,
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
  { key: 'trainingQuality', label: 'Тренировки', description: '', enabled: true, sortOrder: 8, visible: true },
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
  { key: 'coaches', label: 'Тренеры', description: '', enabled: true, sortOrder: 19, visible: true },
  { key: 'cta', label: 'Заявка', description: '', enabled: true, sortOrder: 20, visible: true },
]

export async function useHomeBlocks() {
  const { data } = await useFetch<HomeBlockStatus[]>('/api/settings/home-blocks', {
    key: 'home-blocks',
    default: () => [],
  })

  const blocks = computed(() => {
    const list = data.value?.length ? data.value : FALLBACK_BLOCKS
    return list
      .filter((row) => row.visible)
      .map((row) => ({
        ...row,
        component: blockComponents[row.key],
      }))
      .filter((row) => row.component)
  })

  return { blocks, raw: data }
}
