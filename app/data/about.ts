import type { SectionHeading } from '~/types'
import imgRespect from '~/assets/img/about/value-respect.webp'
import imgSystem from '~/assets/img/about/value-system.webp'
import imgGame from '~/assets/img/about/value-game.webp'
import imgIvanov from '~/assets/img/about/ivanov.webp'
import slider01 from '~/assets/img/slider/01.webp'
import slider02 from '~/assets/img/slider/02.webp'
import slider03 from '~/assets/img/slider/03.webp'
import slider04 from '~/assets/img/slider/04.webp'
import slider05 from '~/assets/img/slider/05.webp'
import slider06 from '~/assets/img/slider/06.webp'
import slider07 from '~/assets/img/slider/07.webp'
import slider08 from '~/assets/img/slider/08.webp'
import slider09 from '~/assets/img/slider/09.webp'
import slider10 from '~/assets/img/slider/10.webp'
import slider11 from '~/assets/img/slider/11.webp'
import slider12 from '~/assets/img/slider/12.webp'
import slider13 from '~/assets/img/slider/13.webp'
import slider14 from '~/assets/img/slider/14.webp'

export const aboutIntro: SectionHeading = {
  label: 'О школе',
  title: 'Место, где футбол становится частью жизни',
}

export const aboutParagraphs = [
  'ФК «Импульс» — это большая футбольная семья, где главный капитан — слово «мы». В нашей школе каждый ребёнок с первого дня чувствует себя своим, а родители всегда в открытом диалоге с тренерами. Наша сила в единстве.',
  'Мы против криков и давления, но учим строгой дисциплине. У нас не боятся ошибок, а тренировки строятся на игре, чтобы ребенок действительно влюблялся в футбол.',
  'Мы выстроили четкую систему для детей от 4 до 15 лет: от первых касаний мяча до подготовки в Сборные команды. В каждой группе свои задачи и прозрачный прогресс, который видят родители. Мы не гонимся за сиюминутным результатом, а раскрываем потенциал каждого.',
  'За этим стоит сильная команда. Наши тренеры постоянно развиваются: методические собрания, семинары, обмен опытом.',
  'Мы гордимся, что «Импульс» стал одной из крупнейших школ города. Но главное достижение — горящие глаза детей и доверие родителей. Присоединяйтесь! Ведь футбол — игра для всех, и каждый найдет здесь свое место на поле!',
] as const

export type AboutGallerySlide = {
  src: string
  alt: string
}

export const aboutGallery: AboutGallerySlide[] = [
  { src: slider03, alt: 'Бутсы и мяч на тренировке в «Импульсе»' },
  { src: slider01, alt: 'Тренировка воспитанников футбольной школы «Импульс»' },
  { src: slider02, alt: 'Дети с мячом на занятии в «Импульсе»' },
  { src: slider04, alt: 'Воспитанники «Импульса» на поле' },
  { src: slider05, alt: 'Командная работа на тренировке' },
  { src: slider06, alt: 'Юные футболисты школы «Импульс»' },
  { src: slider07, alt: 'Тренировочный процесс в футбольной школе' },
  { src: slider08, alt: 'Дети отрабатывают навыки с мячом' },
  { src: slider09, alt: 'Занятие в группе «Импульс»' },
  { src: slider10, alt: 'Атмосфера тренировки в школе' },
  { src: slider11, alt: 'Воспитанники на футбольной площадке' },
  { src: slider12, alt: 'Момент с тренировки «Импульс»' },
  { src: slider13, alt: 'Дети играют в футбол на занятии' },
  { src: slider14, alt: 'Жизнь футбольной школы «Импульс»' },
]

export const aboutHighlight = {
  label: 'Руководство',
  role: 'Заместитель директора',
  name: 'Иванов Виктор Витальевич',
  org: 'Футбольная школа «Импульс» Ярославль',
  text: '«Наша задача — чтобы ребёнок ждал тренировку. Мы следим за качеством каждого занятия, развиваем тренеров и создаём среду, в которой хочется играть и побеждать».',
  imageSrc: imgIvanov,
  imageAlt: 'Иванов Виктор Витальевич с воспитанниками школы «Импульс»',
} as const

export const aboutValuesHeading: SectionHeading = {
  label: 'Ценности',
  title: 'На чём строим работу с детьми',
  description: 'Три опоры, которые родители отмечают чаще всего',
  align: 'center',
}

export type AboutValueItem = {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  /** object-position для cover, если важны лица сверху */
  imagePosition?: string
}

export const aboutValues: AboutValueItem[] = [
  {
    title: 'Уважение к ребёнку',
    description: 'Никакого унижения и крика. Мотивация через поддержку, игру и понятные цели на каждой тренировке.',
    imageSrc: imgRespect,
    imageAlt: 'Тренер пожимает руку воспитаннику после тренировки',
    imagePosition: 'center top',
  },
  {
    title: 'Системный подход',
    description: 'Авторская методика, тестирование прогресса и обратная связь родителям — вы всегда в курсе развития.',
    imageSrc: imgSystem,
    imageAlt: 'Тренер разбирает тактику с детьми у доски',
  },
  {
    title: 'Игра и соревнования',
    description: 'Регулярные матчи и турниры: каждый получает игровую практику, а одарённые — путь в представительские команды.',
    imageSrc: imgGame,
    imageAlt: 'Команда «Импульс» с кубком и медалями',
    imagePosition: 'center 40%',
  },
]

export const aboutMilestones = [
  { year: '2022', text: 'Основание школы «Импульс» в Ярославле' },
  { year: '2023', text: 'Создание городского турнира «Лига юных Чемпионов»' },
  { year: '2024', text: 'Запуск регулярных внутренних соревнований «Импульс в футбол»' },
  { year: 'Сегодня', text: '20+ площадок, 800+ воспитанников, программы для всех уровней' },
] as const

export const contactsSections = {
  locations: {
    label: 'Адреса',
    title: 'Тренируемся рядом с домом',
    description: 'Филиалы в разных районах — выберите удобную площадку и запишитесь на пробное занятие.',
  },
  form: {
    label: 'Запись',
    title: 'Оставить заявку',
    description: 'Заполните форму — перезвоним, ответим на вопросы и подберём группу по возрасту и уровню.',
  },
} as const

export const programsPage = {
  heading: {
    label: 'Группы',
    title: 'Возрастные группы',
    description: 'Выберите возраст — покажем программы начальной и продвинутой подготовки.',
  },
} as const
