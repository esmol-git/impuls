import type { Advantage, HeroBenefit, HeroContent, HeroStat } from '~/types'

/**
 * @deprecated Управление блоками главной — в админке → Настройки → Главная.
 * Оставлены как типы/fallback для совместимости.
 */
export const homeSections = {
  hero: true,
  stats: true,
  programs: true,
  painPoints: true,
  audience: true,
  childBenefits: true,
  steps: true,
  progression: true,
  trainingQuality: true,
  conditions: true,
  ecosystem: true,
  advantages: false,
  video: true,
  locations: true,
  gallery: true,
  catalog: true,
  news: true,
  reviews: true,
  faq: true,
  coaches: true,
  cta: true,
} as const

export type HomeSectionId = keyof typeof homeSections

export const heroContent: HeroContent = {
  titleBefore: 'Запишите ребенка',
  titleAccent: 'на бесплатное занятие',
  titleAfter: 'в футбольную школу «Импульс»',
  subtitle: 'Начни свой путь в футбольный мир уже сегодня',
  ctaPrimary: 'Записаться бесплатно',
  ctaVideo: 'Посмотрите видео о нашей школе',
  ctaVideoTo: '#video',
  imageAlt: 'Дети в форме футбольной школы ФК «Импульс»',
}

export const heroBenefits: HeroBenefit[] = [
  {
    title: 'Рядом с домом',
    description: 'Филиалы в каждом районе города',
  },
  {
    title: 'Гибкий график и расписание',
    description: 'Подберём удобные дни и время',
  },
  {
    title: 'Подходит для всех',
    description: 'Для детей от 4 до 16 лет, любого пола и уровня',
  },
  {
    title: 'Лучшая авторская методика',
    description: 'На основе передовых отечественных и европейских разработок',
  },
]

export const heroStats: HeroStat[] = [
  { value: '15+', label: 'филиалов' },
  { value: '1200+', label: 'воспитанников' },
  { value: '4–16', label: 'лет — возраст' },
  { value: '10+', label: 'лет работы' },
]

export const advantages: Advantage[] = [
  {
    title: 'Авторская методика',
    description: 'Программа на основе стандартов РФС и лучших европейских практик.',
    icon: 'field',
  },
  {
    title: 'Профессиональные тренеры',
    description: 'Педагоги с лицензиями и опытом работы с детьми всех возрастов.',
    icon: 'coach',
  },
  {
    title: 'Игровая практика',
    description: 'Регулярные турниры и матчи — каждый ребёнок выходит на поле.',
    icon: 'ball',
  },
  {
    title: 'Безопасность',
    description: 'Медицинский контроль, страховка и внимание к самочувствию на каждой тренировке.',
    icon: 'shield',
  },
]
