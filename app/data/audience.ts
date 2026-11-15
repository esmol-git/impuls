import type { AudienceCard } from '~/types'
import imgBeginners from '~/assets/img/audience/beginners.webp'
import imgGrow from '~/assets/img/audience/grow.webp'
import imgResults from '~/assets/img/audience/results.webp'

export const audienceSection = {
  titleBefore: 'Занятия футболом для детей',
  titleAccent: 'любого возраста, пола и уровня подготовки',
} as const

export const audienceCards: AudienceCard[] = [
  {
    id: 'beginners',
    title: 'Для тех, кто делает первые шаги на поле',
    description:
      'Наша школа идеально подходит для первого знакомства с футболом. Начнём с базовых упражнений и навыков в группах рядом с домом. Создаём безопасную и спокойную атмосферу, подстраивая программу под темп и особенности каждого ребёнка.',
    imageSrc: imgBeginners,
    imageAlt: 'Мальчик в форме «Импульс» на тренировке',
  },
  {
    id: 'grow',
    title: 'Для тех, кто хочет расти',
    description:
      'Подходит для ребят, которые уже уверенно чувствуют себя на поле. Прокачиваем технику и физику, разбираем тактические моменты, даём регулярную игровую практику на турнирах и товарищеских матчах.',
    imageSrc: imgGrow,
    imageAlt: 'Воспитанники школы «Импульс» на поле',
  },
  {
    id: 'results',
    title: 'Для тех, кто стремится к высоким результатам',
    description:
      'Для игроков с высоким уровнем мотивации разрабатываем дополнительные задания. Персональная карта развития игрока, максимальное раскрытие потенциала и подготовка к серьёзным соревнованиям. Помогаем ребятам перейти на новый уровень игры.',
    imageSrc: imgResults,
    imageAlt: 'Команда «Импульс» с тренером и кубком',
  },
]
