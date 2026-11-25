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
  'ФК «Импульс» — это не просто секция, а большая футбольная семья, где слово «мы» — наш главный капитан. Мы создали школу в Ярославле, в которой каждый ребёнок с первого дня чувствует себя своим, а родители всегда находятся в открытом диалоге с тренерами. Наша сила в единстве и поддержке: на поле, в команде, в коллективе.',
  'Главная ценность для нас — это баланс. Мы категорически против криков и давления, но при этом учим строгой дисциплине и уважению к делу. У нас дети не боятся ошибаться, ведь ошибка — это часть пути к результату и победе. Тренировки строятся на игровых упражнениях, чтобы ребёнок влюблялся в футбол, а не просто «отбывал» время на поле.',
  'Мы выстраиваем настоящую систему. Наши программы рассчитаны на детей от 4 до 15 лет, то есть от первых неуверенных касаний мяча до серьёзной подготовки к турнирам и сборным. В каждой возрастной группе свой темп, чёткие задачи и прозрачный прогресс, который видят родители. Мы не гонимся за сиюминутным результатом, а планомерно ведём каждого ребёнка к раскрытию его потенциала.',
  'За всем этим стоит сильная команда профессионалов. Наши тренеры не останавливаются в развитии: еженедельные методические объединения, обмен опытом и семинары с приглашёнными экспертами (включая спортивных психологов) позволяют нам держать высокую планку. Мы не просто «водим мяч», мы воспитываем характер, учим думать на поле и быть командой.',
  'Мы гордимся тем, что «Импульс» стал одной из крупнейших школ города. Но наше главное достижение — это горящие глаза детей, которые бегут на тренировки без уговоров, и доверие родителей. У нас спорт и развитие идут рука об руку, а каждый ребёнок получает шанс стать сильнее не только физически, но и как личность. Присоединяйтесь к нашей большой семье! Ведь футбол — это игра для всех. И каждый здесь найдёт своё место на поле.',
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
  { year: '2014', text: 'Основание школы и первые группы для малышей' },
  { year: '2018', text: 'Запуск соревновательных команд и внутренних турниров' },
  { year: '2022', text: 'Центр обучения тренеров и единая методическая платформа' },
  { year: 'Сегодня', text: '15+ площадок, 1200+ воспитанников, программы для всех уровней' },
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
