import type { CartLine } from '~/utils/commerce'

export type ModalType = 'lead' | 'callback' | 'exit' | 'checkout'

export interface ModalPayload {
  source?: string
  location?: string
  program?: string
  /** Состав желаемой покупки (гостевая корзина → заявка) */
  items?: CartLine[]
}

export const modalCopy = {
  lead: {
    title: 'Оставить заявку',
    description: 'Заполните форму — мы свяжемся с вами.',
    submit: 'Отправить',
  },
  callback: {
    title: 'Обратный звонок',
    description: 'Оставьте номер — мы перезвоним.',
    submit: 'Жду звонка',
  },
  exit: {
    title: 'Уже уходите?',
    description: 'Оставьте заявку — свяжемся с вами.',
    submit: 'Оставить заявку',
  },
  checkout: {
    title: 'Оформление заявки',
    description: 'Укажите контакты — мы подтвердим состав и свяжемся с вами.',
    submit: 'Отправить заявку',
  },
} as const
