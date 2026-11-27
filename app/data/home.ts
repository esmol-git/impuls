import type { Advantage, HeroBenefit, HeroContent, HeroStat } from '~/types'
import heroPlayer from '~/assets/img/hero/player.webp'

export const heroContent: HeroContent = {
  titleBefore: 'Запишите ребенка',
  titleAccent: 'на бесплатное занятие',
  titleAfter: 'в футбольную школу «Импульс»',
  subtitle: 'Начни свой путь в футбольный мир уже сегодня',
  ctaPrimary: 'Записаться на первое бесплатное занятие',
  ctaVideo: 'Посмотрите видео о нашей школе',
  ctaVideoTo: '#video',
  imageSrc: heroPlayer,
  imageAlt: 'Футболист в прыжке — школа ФК «Импульс»',
}

export const heroBenefits: HeroBenefit[] = [
  {
    title: 'Рядом с домом',
    description: 'Филиалы в каждом районе Ярославля',
  },
  {
    title: 'Гибкий график и расписание',
    description: 'Подберём удобные дни и время занятий',
  },
  {
    title: 'Подходит для всех',
    description: 'Занятия для мальчиков и девочек от 4 до 15 лет',
  },
  {
    title: 'Лучшая авторская методика',
    description: 'На основе современных отечественных и европейских разработок',
  },
]

export const heroStats: HeroStat[] = [
  { value: '15+', label: 'филиалов', target: 15, suffix: '+' },
  { value: '700+', label: 'воспитанников', target: 700, suffix: '+' },
  { value: '4–15', label: 'возраст' },
  { value: '5+', label: 'лет работы', target: 5, suffix: '+' },
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
