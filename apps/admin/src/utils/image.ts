/** Лимит исходного файла до серверной конвертации в WebP */
export const MAX_IMAGE_BYTES = 20 * 1024 * 1024

/** На клиенте только проверка; WebP и сжатие делает API (sharp → MinIO). */
export async function prepareImageUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Только изображения')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`Файл больше ${Math.round(MAX_IMAGE_BYTES / (1024 * 1024))} МБ`)
  }
  return file
}
