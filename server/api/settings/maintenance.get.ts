export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  if (!apiUrl) {
    return { enabled: false }
  }

  try {
    return await $fetch<{ enabled: boolean }>(`${apiUrl}/api/settings/maintenance`, {
      timeout: 5_000,
    })
  } catch (error) {
    console.warn('[api/settings/maintenance] не удалось загрузить статус из Nest', error)
    return { enabled: false }
  }
})
