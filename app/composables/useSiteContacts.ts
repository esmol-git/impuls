import type { SocialLink } from '~/types'

export interface SiteContacts {
  phone: string
  phoneHours: string
  phoneHoursFrom?: string
  phoneHoursTo?: string
  email: string
  socials: {
    vk: string
    telegram: string
    youtube: string
  }
}

const EMPTY: SiteContacts = {
  phone: '',
  phoneHours: '',
  email: '',
  socials: { vk: '', telegram: '', youtube: '' },
}

const SOCIAL_META: { key: keyof SiteContacts['socials']; label: string; icon: SocialLink['icon'] }[] = [
  { key: 'vk', label: 'ВКонтакте', icon: 'vk' },
  { key: 'telegram', label: 'Telegram', icon: 'telegram' },
  { key: 'youtube', label: 'YouTube', icon: 'youtube' },
]

function normalize(row: SiteContacts | null | undefined): SiteContacts {
  if (!row) return { ...EMPTY, socials: { ...EMPTY.socials } }
  return {
    phone: row.phone?.trim() || '',
    phoneHours: row.phoneHours?.trim() || '',
    phoneHoursFrom: row.phoneHoursFrom?.trim() || '',
    phoneHoursTo: row.phoneHoursTo?.trim() || '',
    email: row.email?.trim() || '',
    socials: {
      vk: row.socials?.vk?.trim() || '',
      telegram: row.socials?.telegram?.trim() || '',
      youtube: row.socials?.youtube?.trim() || '',
    },
  }
}

export async function useSiteContacts() {
  // Один ключ + await: payload SSR попадает в клиент без default/EMPTY
  const { data } = await useFetch<SiteContacts>('/api/settings/contacts', {
    key: 'site-contacts',
  })

  const contacts = computed(() => normalize(data.value))

  const phone = computed(() => contacts.value.phone)
  const phoneHours = computed(() => contacts.value.phoneHours)
  const phoneHoursFrom = computed(() => contacts.value.phoneHoursFrom || '')
  const phoneHoursTo = computed(() => contacts.value.phoneHoursTo || '')
  const email = computed(() => contacts.value.email)

  const socialLinks = computed<SocialLink[]>(() =>
    SOCIAL_META
      .map((item) => {
        const href = contacts.value.socials[item.key]
        if (!href) return null
        return { label: item.label, href, icon: item.icon }
      })
      .filter((item): item is SocialLink => Boolean(item)),
  )

  const hasPhone = computed(() => Boolean(phone.value))
  const hasEmail = computed(() => Boolean(email.value))
  const hasSocials = computed(() => socialLinks.value.length > 0)
  const telHref = computed(() =>
    hasPhone.value ? `tel:${phone.value.replace(/[\s()-]/g, '')}` : '',
  )
  const mailtoHref = computed(() => (hasEmail.value ? `mailto:${email.value}` : ''))

  return {
    contacts,
    phone,
    phoneHours,
    phoneHoursFrom,
    phoneHoursTo,
    email,
    socialLinks,
    hasPhone,
    hasEmail,
    hasSocials,
    telHref,
    mailtoHref,
  }
}
