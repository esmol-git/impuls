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
