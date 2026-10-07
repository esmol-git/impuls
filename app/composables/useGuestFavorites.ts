import type { CatalogItem } from '~/utils/catalog'

const STORAGE_KEY = 'impuls-guest-favorites'

export interface FavoriteItem {
  mediaId: string
  title: string
  sku?: string
  category?: string
  description?: string
  imageUrl?: string
  unitPrice: number
  addedAt: string
}

function isFavorite(value: unknown): value is FavoriteItem {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return typeof row.mediaId === 'string' && typeof row.title === 'string'
}

function readStorage(): FavoriteItem[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isFavorite)
  } catch {
    return []
  }
}

function writeStorage(items: FavoriteItem[]) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore
  }
}

/** Избранное гостя (localStorage). Позже — синхронизация с API без регистрации. */
export function useGuestFavorites() {
  const items = useState<FavoriteItem[]>('guest-favorites', () => [])
  const hydrated = useState('guest-favorites-hydrated', () => false)

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    items.value = readStorage()
    hydrated.value = true
  }

  function persist() {
    writeStorage(items.value)
  }

  function has(mediaId: string) {
    return items.value.some((item) => item.mediaId === mediaId)
  }

  function remove(mediaId: string) {
    hydrate()
    items.value = items.value.filter((row) => row.mediaId !== mediaId)
    persist()
  }

  function toggle(item: CatalogItem) {
    hydrate()
    if (has(item.id)) {
      remove(item.id)
      return
    }
      const image = item.imageUrls?.[0] || item.imageUrl || undefined
      items.value = [
        {
          mediaId: item.id,
          title: item.title,
          sku: item.sku || undefined,
          category: item.category || undefined,
          description: item.description || undefined,
          imageUrl: image,
          unitPrice: item.salePrice ?? item.price ?? 0,
          addedAt: new Date().toISOString(),
        },
        ...items.value,
      ]
    persist()
  }

  const count = computed(() => items.value.length)
  const isEmpty = computed(() => items.value.length === 0)

  if (import.meta.client) {
    hydrate()
  }

  return { items, count, isEmpty, hydrate, has, remove, toggle }
}
