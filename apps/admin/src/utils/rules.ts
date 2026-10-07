import type { FormItemRule } from 'element-plus'
import { MAX_IMAGE_BYTES } from '@/utils/image'

const maxMb = Math.round(MAX_IMAGE_BYTES / (1024 * 1024))

export const rules = {
  email: [
    { required: true, message: 'Введите email', trigger: 'blur' },
    { type: 'email', message: 'Некорректный email', trigger: ['blur', 'change'] },
  ] as FormItemRule[],

  password: (min = 6): FormItemRule[] => [
    { required: true, message: 'Введите пароль', trigger: 'blur' },
    { min, message: `Минимум ${min} символов`, trigger: 'blur' },
  ],

  required: (label: string): FormItemRule[] => [
    { required: true, message: `${label} обязательно`, trigger: 'blur' },
  ],

  title: [
    { required: true, message: 'Введите название', trigger: 'blur' },
    { min: 2, message: 'Слишком короткое название', trigger: 'blur' },
    { max: 120, message: 'Максимум 120 символов', trigger: 'blur' },
  ] as FormItemRule[],

  role: [
    { required: true, message: 'Выберите роль', trigger: 'change' },
  ] as FormItemRule[],

  image: [
    {
      required: true,
      validator: (_rule, value: File | null, callback) => {
        if (!value) {
          callback(new Error('Выберите картинку'))
          return
        }
        if (!value.type.startsWith('image/')) {
          callback(new Error('Только изображения'))
          return
        }
        if (value.size > MAX_IMAGE_BYTES) {
          callback(new Error(`Файл больше ${maxMb} МБ`))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ] as FormItemRule[],

  imageOptionalWhenExisting: (hasExisting: () => boolean): FormItemRule[] => [
    {
      validator: (_rule, value: File | null, callback) => {
        if (!value) {
          if (hasExisting()) {
            callback()
            return
          }
          callback(new Error('Выберите картинку'))
          return
        }
        if (!value.type.startsWith('image/')) {
          callback(new Error('Только изображения'))
          return
        }
        if (value.size > MAX_IMAGE_BYTES) {
          callback(new Error(`Файл больше ${maxMb} МБ`))
          return
        }
        callback()
      },
      trigger: 'change',
    },
  ],

  richText: (label = 'Текст'): FormItemRule[] => [
    {
      required: true,
      validator: (_rule, value: string, callback) => {
        const text = (value || '').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
        if (!text) {
          callback(new Error(`Введите ${label.toLowerCase()}`))
          return
        }
        callback()
      },
      trigger: 'blur',
    },
  ],

  price: [
    { required: true, message: 'Укажите цену', trigger: 'blur' },
    {
      type: 'number',
      min: 0,
      message: 'Цена не может быть отрицательной',
      trigger: 'change',
    },
  ] as FormItemRule[],
}
