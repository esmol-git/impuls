import type { AgeProgram } from '~/types'

export type { AgeProgram } from '~/types'

export const programsSection = {
  titleBefore: 'Занятия для детей',
  titleAccent: 'от 4 до 16 лет',
} as const

export const ageTabs = ['4–6 лет', '7–9 лет', '10–12 лет', '12–16 лет'] as const

const baseFeatures = {
  beginner: [
    { icon: 'clock' as const, text: '1–2 тренировки в неделю' },
    { icon: 'game' as const, text: 'Игровой формат занятий' },
    { icon: 'users' as const, text: 'Для любого уровня подготовки' },
    { icon: 'trophy' as const, text: 'Участие в турнирах' },
    { icon: 'ball' as const, text: 'Мини-футбол в упражнениях' },
  ],
  advanced: [
    { icon: 'clock' as const, text: '2–3 тренировки в неделю' },
    { icon: 'calendar' as const, text: 'Расширенная программа' },
    { icon: 'users' as const, text: 'Для мотивированных игроков' },
    { icon: 'trophy' as const, text: 'Регулярные соревнования' },
    { icon: 'ball' as const, text: 'Техника и тактика' },
  ],
}

export const agePrograms: AgeProgram[] = [
  {
    id: '4-6',
    tabLabel: '4–6 лет',
    groupLabel: 'Младшая группа 4–6 лет',
    description: 'Первые шаги в футболе через игру. Развиваем координацию, учимся работать в команде и полюбить спорт без давления.',
    schedule: '2–3 раза в неделю, утро и вечер. Точное расписание по филиалам.',
    levels: [
      { id: '4-6-beginner', title: 'Группы начальной подготовки', features: baseFeatures.beginner, buttonVariant: 'brand' },
      { id: '4-6-advanced', title: 'Группы продвинутой подготовки', features: baseFeatures.advanced, buttonVariant: 'accent' },
    ],
  },
  {
    id: '7-9',
    tabLabel: '7–9 лет',
    groupLabel: 'Средняя группа 7–9 лет',
    description: 'Отработка базовой техники, первые элементы тактики и регулярные игровые форматы на тренировках.',
    schedule: '3 раза в неделю. Группы в будни и в выходные.',
    levels: [
      { id: '7-9-beginner', title: 'Группы начальной подготовки', features: baseFeatures.beginner, buttonVariant: 'brand' },
      { id: '7-9-advanced', title: 'Группы продвинутой подготовки', features: baseFeatures.advanced, buttonVariant: 'accent' },
    ],
  },
  {
    id: '10-12',
    tabLabel: '10–12 лет',
    groupLabel: 'Группа 10–12 лет',
    description: 'Углублённая работа над техникой, физической подготовкой и игровым мышлением. Подготовка к турнирам.',
    schedule: '3–4 тренировки в неделю. Расписание зависит от уровня группы.',
    levels: [
      { id: '10-12-beginner', title: 'Группы начальной подготовки', features: baseFeatures.beginner, buttonVariant: 'brand' },
      { id: '10-12-advanced', title: 'Группы продвинутой подготовки', features: baseFeatures.advanced, buttonVariant: 'accent' },
    ],
  },
  {
    id: '12-16',
    tabLabel: '12–16 лет',
    groupLabel: 'Группа 12–16 лет',
    description: 'Интенсивные тренировки для тех, кто хочет расти в футболе: техника, тактика, анализ игры и участие в соревнованиях.',
    schedule: '4 тренировки в неделю для продвинутых групп. Индивидуальный график по запросу.',
    levels: [
      { id: '12-16-beginner', title: 'Группы начальной подготовки', features: baseFeatures.beginner, buttonVariant: 'brand' },
      { id: '12-16-advanced', title: 'Группы продвинутой подготовки', features: baseFeatures.advanced, buttonVariant: 'accent' },
    ],
  },
]
