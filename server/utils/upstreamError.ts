/** 404 от Nest → 404; сеть/5xx/таймаут → 503 (не маскируем аварию как «не найдено»). */
export function rethrowUpstreamNotFound(error: unknown, notFoundMessage: string): never {
  const status = Number((error as { statusCode?: number, status?: number })?.statusCode
    ?? (error as { status?: number })?.status
    ?? 0)

  if (status === 404) {
    throw createError({ statusCode: 404, statusMessage: notFoundMessage })
  }

  console.warn('[bff] upstream unavailable', error)
  throw createError({
    statusCode: 503,
    statusMessage: 'Сервис временно недоступен',
  })
}
