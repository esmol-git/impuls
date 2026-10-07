interface ApiCoach {
  id: string
  name: string
  role: string
  experience: string
  bio: string
  specialties?: string[]
  imageUrl?: string | null
  imageAlt?: string | null
  sortOrder: number
  published: boolean
}

/** В браузере отдаём относительный /uploads — его проксирует Nuxt на API */
function publicImageUrl(imageUrl: string) {
  if (!imageUrl) return imageUrl
  if (/^https?:\/\//i.test(imageUrl)) {
    try {
      const url = new URL(imageUrl)
      if (url.pathname.startsWith('/uploads/')) return url.pathname
    } catch {
      /* keep as is */
    }
    return imageUrl
  }
  return imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  if (!apiUrl) {
    return []
  }

  try {
    const items = await $fetch<ApiCoach[]>(`${apiUrl}/api/coaches`)
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      role: item.role,
      experience: item.experience,
      bio: item.bio,
      specialties: item.specialties || [],
      imageAlt: item.imageAlt || undefined,
      imageSrc: item.imageUrl ? publicImageUrl(item.imageUrl) : undefined,
    }))
  } catch (error) {
    console.warn('[api/coaches] не удалось загрузить тренеров из Nest', error)
    return []
  }
})
