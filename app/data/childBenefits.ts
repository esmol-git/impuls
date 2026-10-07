import type { ChildBenefitCard } from '~/types'

export const childBenefitsSection = {
  titleBefore: 'В нашей школе ваш ребёнок',
  titleAccent: 'получит всё необходимое',
} as const

export const childBenefitCards: ChildBenefitCard[] = [
  {
    id: 'individual',
    title: 'Индивидуальное внимание с учётом возраста и особенностей каждого',
    imageAlt: 'Индивидуальный подход на тренировке',
  },
  {
    id: 'fun',
    title: 'Заниматься интересно — ребёнок влюбляется в футбол',
    imageAlt: 'Дети на тренировке',
  },
  {
    id: 'program',
    title: 'Сбалансированная программа без стресса и давления',
    imageAlt: 'Тренировка на поле',
  },
  {
    id: 'girls',
    title: 'Да, у нас тренируются и девочки!',
    imageAlt: 'Девочка на тренировке',
  },
  {
    id: 'pro',
    title: 'Путь в профессиональный футбол для одарённых игроков',
    imageAlt: 'Юные футболисты',
  },
  {
    id: 'games',
    title: 'Игровая практика на соревнованиях — играют все',
    imageAlt: 'Матч команды',
  },
]
