/** Общие типы проекта */

export type SectionAlign = 'left' | 'center'

export interface SectionHeading {
  label?: string
  title: string
  description?: string
  align?: SectionAlign
}

export interface SectionAction {
  label: string
  to: string
}

export interface SectionConfig extends SectionHeading {
  action?: SectionAction
}

export type FeatureIcon = 'coach' | 'field' | 'ball' | 'shield'

export type PainPointIcon = 'search' | 'health' | 'gadget' | 'coach' | 'quality' | 'friends'

export interface PainPoint {
  id: string
  text: string
  icon: PainPointIcon
}

export interface AudienceCard {
  id: string
  title: string
  description: string
  imageAlt: string
  imageSrc?: string
}

export interface Advantage {
  title: string
  description: string
  icon: FeatureIcon
}

export type TrainingIcon = 'method' | 'trophy' | 'coach' | 'clipboard' | 'field' | 'boot' | 'jersey' | 'feedback'

export interface TrainingPoint {
  id: string
  text: string
  icon: TrainingIcon
}

export interface EcosystemCard {
  id: string
  title: string
  items: string[]
}

export interface ConditionCard {
  step: number
  title: string
  description: string
}

export interface ChildBenefitCard {
  id: string
  title: string
  description: string
  imageAlt: string
  imageSrc?: string
}

export interface HeroStat {
  value: string
  label: string
  /** Целевое число для count-up; без него значение статичное (например «4–15»). */
  target?: number
  prefix?: string
  suffix?: string
}

export type EnrollmentStepIcon = 'form' | 'trial' | 'train'

export interface EnrollmentStep {
  step: number
  title: string
  description: string
  icon?: EnrollmentStepIcon
}

export interface SocialLink {
  label: string
  href: string
  icon: 'vk' | 'telegram' | 'youtube'
}

export interface HeroBenefit {
  title: string
  description: string
}

export interface HeroContent {
  titleBefore: string
  titleAccent: string
  titleAfter: string
  subtitle: string
  ctaPrimary: string
  ctaVideo: string
  ctaVideoTo: string
  imageSrc?: string
  imageAlt: string
}

export interface Coach {
  id: string
  name: string
  role: string
  experience: string
  bio: string
  specialties?: string[]
  imageAlt?: string
  imageSrc?: string
}

export type ProgramFeatureIcon = 'clock' | 'calendar' | 'users' | 'trophy' | 'ball' | 'game'

export interface ProgramFeature {
  text: string
  icon: ProgramFeatureIcon
}

export interface ProgramLevel {
  id: string
  /** Например: «Формат: группы» */
  eyebrow?: string
  title: string
  features: ProgramFeature[]
  buttonVariant: 'brand' | 'accent'
}

export interface AgeProgram {
  id: string
  tabLabel: string
  groupLabel: string
  description: string
  schedule: string
  levels: [ProgramLevel, ProgramLevel]
  /** Вырезанная фигура между карточками уровней */
  figureSrc?: string
  figureAlt?: string
}
export interface NewsItem {
  slug: string
  title: string
  excerpt: string
  date: string
  /** ISO дата публикации для SEO (publishAt || createdAt) */
  publishedAt?: string
  category: string
  imageUrl?: string
  body?: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface GalleryItem {
  id: string
  alt: string
  src?: string
}

export interface Location {
  id: string
  name: string
  address: string
  /** [широта, долгота] для Яндекс.Карт */
  coords?: [number, number]
}

export interface EducationSection {
  id: string
  title: string
  content: string
}

export interface BreadcrumbItem {
  label: string
  to?: string
}
