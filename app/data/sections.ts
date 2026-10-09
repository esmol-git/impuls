import type { SectionConfig } from '~/types'

/** Заголовки и описания секций — меняйте здесь, не в компонентах */
export const sections = {
  stats: {
    label: 'Цифры',
    title: 'Импульс в цифрах',
  },
  programs: {
    label: 'Группы',
    title: 'Занятия для детей',
    description: 'Выберите возрастную группу — от первых шагов до соревновательного уровня.',
    align: 'center',
  },
  steps: {
    label: 'Старт',
    title: 'Как начать заниматься',
    description: 'Три простых шага до первой тренировки',
    align: 'center',
  },
  locations: {
    label: 'Адреса',
    title: 'Тренируемся рядом с домом',
    description: 'Филиалы в разных районах города — подберём удобную площадку.',
    action: { label: 'Все адреса', to: '/contacts' },
  },
  advantages: {
    label: 'Почему мы',
    title: 'Преимущества школы',
    description: 'Всё, что важно родителям и детям на пути в футбол.',
  },
  video: {
    label: 'Видео',
    title: 'Посмотрите, как проходят наши тренировки',
    description: 'Атмосфера занятий, тренеры и дети в деле.',
  },
  gallery: {
    label: 'Галерея',
    title: 'Жизнь школы в кадре',
    description: 'Тренировки, турниры и жизнь школы — в кадрах.',
    action: { label: 'Вся галерея', to: '/gallery' },
  },
  catalog: {
    label: 'Каталог',
    title: 'Товары школы',
    description: 'Форма и экипировка для тренировок.',
    action: { label: 'Весь каталог', to: '/catalog' },
  },
  news: {
    label: 'Новости',
    title: 'Последние события',
    description: 'Турниры, сборы и новости из жизни школы.',
    action: { label: 'Все новости', to: '/news' },
  },
  reviews: {
    title: 'Посмотрите, что говорят родители о нашей школе',
    align: 'left',
  },
  faq: {
    label: 'FAQ',
    title: 'Частые вопросы',
    description: 'Ответы на то, что чаще всего спрашивают перед записью.',
  },
  coaches: {
    label: 'Команда',
    title: 'Наши тренеры',
    description: 'Профессионалы, которые учат играть и любить футбол.',
    action: { label: 'Вся команда', to: '/coaches' },
  },
  cta: {
    title: 'Запишите ребёнка на бесплатное занятие',
    description: 'Оставьте заявку — перезвоним, ответим на вопросы и подберём группу.',
    action: { label: 'Записаться бесплатно', to: '' },
  },
} as const satisfies Record<string, SectionConfig>
