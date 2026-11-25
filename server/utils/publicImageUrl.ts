/**
 * Публичные картинки только из /uploads (прокси на Nest/MinIO).
 * Внешние URL с чужим хостом отбрасываем; абсолютные с /uploads/ → path.
 */
export function publicImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return ''
  const raw = String(imageUrl).trim()
  if (!raw) return ''

  if (/^(javascript|data|vbscript):/i.test(raw)) return ''

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw)
      if (url.pathname.startsWith('/uploads/')) return url.pathname + url.search
    } catch {
      return ''
    }
    return ''
  }

  const path = raw.startsWith('/') ? raw : `/${raw}`
  if (!path.startsWith('/uploads/')) return ''
  return path
}
