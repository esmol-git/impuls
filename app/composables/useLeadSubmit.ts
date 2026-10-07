import { ref } from 'vue'
import type { CartLine } from '~/utils/commerce'

export interface LeadPayload {
  name: string
  phone: string
  age?: string
  message?: string
  source?: string
  location?: string
  program?: string
  variant?: 'full' | 'compact'
  guestToken?: string
  items?: CartLine[]
}

export function useLeadSubmit() {
  const loading = ref(false)
  const error = ref('')

  async function submit(data: LeadPayload) {
    loading.value = true
    error.value = ''
    try {
      return await $fetch<{ ok: boolean, mock?: boolean }>('/api/lead', {
        method: 'POST',
        body: data,
      })
    } catch {
      error.value = 'Не удалось отправить заявку. Попробуйте позже.'
      throw new Error('submit failed')
    } finally {
      loading.value = false
    }
  }

  return { loading, error, submit }
}
