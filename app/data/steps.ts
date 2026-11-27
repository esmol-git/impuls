import type { EnrollmentStep } from '~/types'

export const enrollmentSteps: EnrollmentStep[] = [
  {
    step: 1,
    icon: 'form',
    title: 'Оставьте заявку',
    description: 'Заполните форму на сайте или позвоните — перезвоним в течение дня',
  },
  {
    step: 2,
    icon: 'trial',
    title: 'Приходите на пробное',
    description: 'Бесплатное занятие с тренером, знакомство с площадкой и группой',
  },
  {
    step: 3,
    icon: 'train',
    title: 'Начинайте тренировки',
    description: 'Подберём группу по возрасту и уровню, удобное расписание',
  },
]
