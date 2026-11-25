export interface ContactsStatus {
  phone: string
  phoneHours: string
  email: string
  socials: {
    vk: string
    telegram: string
    youtube: string
  }
}

const FALLBACK: ContactsStatus = {
  phone: '',
  phoneHours: '',
  email: '',
  socials: { vk: '', telegram: '', youtube: '' },
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  if (!apiUrl) {
    return FALLBACK
  }

  try {
    return await $fetch<ContactsStatus>(`${apiUrl}/api/settings/contacts`, {
      timeout: 5_000,
    })
  } catch (error) {
    console.warn('[api/settings/contacts] не удалось загрузить контакты из Nest', error)
    return FALLBACK
  }
})
