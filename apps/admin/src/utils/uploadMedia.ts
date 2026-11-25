import { api } from '@/api/client'

/** Загрузка файла в /api/admin/media/upload → URL на CDN/uploads. */
export async function uploadMediaFile(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const uploaded = await api<{ url: string }>('/api/admin/media/upload', {
    method: 'POST',
    body,
  })
  return uploaded.url
}
