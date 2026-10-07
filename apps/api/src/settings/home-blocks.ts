/** Канонический список блоков главной (порядок = дефолт на сайте) */
export const HOME_BLOCK_DEFS = [
  { key: 'hero', label: 'Герой', description: 'Первый экран с формой записи', defaultEnabled: true },
  { key: 'stats', label: 'Цифры', description: 'Полоса со статистикой школы', defaultEnabled: true },
  { key: 'programs', label: 'Группы', description: 'Возрастные программы занятий', defaultEnabled: true },
  { key: 'painPoints', label: 'Боли родителей', description: 'Блок с типичными сомнениями', defaultEnabled: true },
  { key: 'audience', label: 'Для кого', description: 'Аудитория школы', defaultEnabled: true },
  { key: 'childBenefits', label: 'Польза для ребёнка', description: 'Что получает ребёнок', defaultEnabled: true },
  { key: 'steps', label: 'Как начать', description: 'Шаги до первой тренировки', defaultEnabled: true },
  { key: 'progression', label: 'Прогрессия', description: 'Путь развития игрока', defaultEnabled: true },
  { key: 'trainingQuality', label: 'Качество тренировок', description: 'Как устроены занятия', defaultEnabled: true },
  { key: 'conditions', label: 'Условия', description: 'Условия занятий', defaultEnabled: true },
  { key: 'ecosystem', label: 'Экосистема', description: 'Что входит в школу', defaultEnabled: true },
  { key: 'advantages', label: 'Преимущества', description: 'Почему выбирают нас', defaultEnabled: false },
  { key: 'video', label: 'Видео', description: 'Видео о школе', defaultEnabled: true },
  { key: 'locations', label: 'Адреса', description: 'Филиалы на главной', defaultEnabled: true },
  { key: 'gallery', label: 'Галерея', description: 'Фото с тренировок', defaultEnabled: true },
  { key: 'catalog', label: 'Каталог', description: 'Товары на главной (нужен контент)', defaultEnabled: true, contentKey: 'CATALOG' },
  { key: 'news', label: 'Новости', description: 'Новости на главной (нужен контент)', defaultEnabled: true, contentKey: 'NEWS' },
  { key: 'reviews', label: 'Отзывы', description: 'Скриншоты отзывов (нужен контент)', defaultEnabled: true, contentKey: 'REVIEW' },
  { key: 'faq', label: 'FAQ', description: 'Частые вопросы', defaultEnabled: true },
  { key: 'coaches', label: 'Тренеры', description: 'Превью команды', defaultEnabled: true },
  { key: 'cta', label: 'Заявка', description: 'Нижний блок записи', defaultEnabled: true },
] as const

export type HomeBlockKey = (typeof HOME_BLOCK_DEFS)[number]['key']

export const HOME_BLOCK_KEYS = HOME_BLOCK_DEFS.map((item) => item.key)

export function isHomeBlockKey(value: string): value is HomeBlockKey {
  return (HOME_BLOCK_KEYS as readonly string[]).includes(value)
}
