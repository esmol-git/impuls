interface ApiCoach {
  id: string
  name: string
  role: string
  experience: string
  bio: string
  specialties?: string[]
  imageUrl?: string | null
  imageAlt?: string | null
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Не указан тренер' })
  }

  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')
  if (!apiUrl) {
    throw createError({ statusCode: 503, statusMessage: 'Сервис временно недоступен' })
  }

  try {
    const item = await $fetch<ApiCoach>(`${apiUrl}/api/coaches/${id}`)
    return {
      id: item.id,
      name: item.name,
      role: item.role,
      experience: item.experience,
      bio: item.bio,
      specialties: item.specialties || [],
      imageAlt: item.imageAlt || undefined,
      imageSrc: item.imageUrl ? publicImageUrl(item.imageUrl) || undefined : undefined,
    }
  } catch (error) {
    rethrowUpstreamNotFound(error, 'Тренер не найден')
  }
})
