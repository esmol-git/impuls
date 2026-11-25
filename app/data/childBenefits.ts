import type { ChildBenefitCard } from '~/types'
import imgAttention from '~/assets/img/child-benefits/attention.webp'
import imgLove from '~/assets/img/child-benefits/love.webp'
import imgDiscipline from '~/assets/img/child-benefits/discipline.webp'
import imgEveryone from '~/assets/img/child-benefits/everyone.webp'
import imgResults from '~/assets/img/child-benefits/results.webp'
import imgPractice from '~/assets/img/child-benefits/practice.webp'

export const childBenefitsSection = {
  titleBefore: 'В нашей школе ваш ребёнок',
  titleAccent: 'получит всё необходимое',
} as const

export const childBenefitCards: ChildBenefitCard[] = [
  {
    id: 'attention',
    title: 'Персональное внимание',
    description: 'Индивидуальный подход к каждому с учётом возраста, характера и уровня подготовки.',
    imageSrc: imgAttention,
    imageAlt: 'Тренер объясняет упражнение двум воспитанникам',
  },
  {
    id: 'love',
    title: 'Любовь к игре',
    description: 'Увлекательные тренировки в игровом формате — ребёнок влюбляется в футбол с первых занятий.',
    imageSrc: imgLove,
    imageAlt: 'Радостный воспитанник с мячом на поле',
  },
  {
    id: 'discipline',
    title: 'Здоровая дисциплина',
    description: 'Учим работать в команде и соблюдать правила — без криков, давления и стресса.',
    imageSrc: imgDiscipline,
    imageAlt: 'Командный круг воспитанников с тренером',
  },
  {
    id: 'everyone',
    title: 'Футбол для всех',
    description: 'Да, девочки у нас тоже занимаются! Футбол — игра для каждого!',
    imageSrc: imgEveryone,
    imageAlt: 'Тренер с мальчиками и девочкой на тренировке',
  },
  {
    id: 'results',
    title: 'Работа на результат',
    description: 'Углубленная подготовка для мотивированных игроков, стремящихся к высоким спортивным достижениям.',
    imageSrc: imgResults,
    imageAlt: 'Тренер разбирает тактику на магнитной доске',
  },
  {
    id: 'practice',
    title: 'Постоянная практика',
    description: 'Регулярные внутренние турниры и товарищеские матчи — игровую практику получает каждый ребёнок.',
    imageSrc: imgPractice,
    imageAlt: 'Воспитанники радуются после игры',
  },
]
