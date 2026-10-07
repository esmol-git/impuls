import type { PainPoint } from '~/types'

export const painPointsSection = {
  title: 'Вам это знакомо?',
  joinTitle: 'Присоединяйтесь к футбольной школе ФК «Импульс»',
  joinSubtitle: 'Мы воспитываем чемпионов!',
  joinCta: 'Записаться на бесплатное занятие',
} as const

export const painPoints: PainPoint[] = [
  {
    id: 'sport',
    icon: 'search',
    text: 'Ищете тот вид спорта, который подойдёт вашему ребёнку?',
  },
  {
    id: 'health',
    icon: 'health',
    text: 'Хотите, чтобы ребёнок был здоров и физически развит?',
  },
  {
    id: 'gadget',
    icon: 'gadget',
    text: 'Ищете способ оторвать ребёнка от гаджетов?',
  },
  {
    id: 'bad-coach',
    icon: 'coach',
    text: 'Футбол — главная страсть, но тренер кричит, не уделяет внимания или недооценивает?',
  },
  {
    id: 'quality',
    icon: 'quality',
    text: 'Нужны качественные тренировки — результат, а не имитация процесса?',
  },
  {
    id: 'friends',
    icon: 'friends',
    text: 'Ребёнку нужна правильная среда и верные друзья?',
  },
]
