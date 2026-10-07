import type { CatalogItem } from '~/utils/catalog'
import type { CartLine } from '~/utils/commerce'
import {
  cartCount,
  cartLineFromCatalog,
  cartTotal,
  formatCartTotal,
} from '~/utils/commerce'

const STORAGE_KEY = 'impuls-guest-cart'

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false
  const row = value as Record<string, unknown>
  return (
    typeof row.mediaId === 'string'
    && typeof row.title === 'string'
    && typeof row.unitPrice === 'number'
    && typeof row.qty === 'number'
    && row.qty >= 1
  )
}

function readStorage(): CartLine[] {
  if (!import.meta.client) return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCartLine).map((line) => ({
      mediaId: line.mediaId,
      title: line.title,
      sku: typeof line.sku === 'string' ? line.sku : undefined,
      category: typeof line.category === 'string' ? line.category : undefined,
      description: typeof line.description === 'string' ? line.description : undefined,
      imageUrl: typeof line.imageUrl === 'string' ? line.imageUrl : undefined,
      unitPrice: Math.max(0, Math.round(line.unitPrice)),
      qty: Math.min(99, Math.max(1, Math.round(line.qty))),
    }))
  } catch {
    return []
  }
}

function writeStorage(lines: CartLine[]) {
  if (!import.meta.client) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
  } catch {
    // ignore
  }
}

export function useGuestCart() {
  const lines = useState<CartLine[]>('guest-cart', () => [])
  const hydrated = useState('guest-cart-hydrated', () => false)

  function hydrate() {
    if (!import.meta.client || hydrated.value) return
    lines.value = readStorage()
    hydrated.value = true
  }

  function persist() {
    writeStorage(lines.value)
  }

  function upsertLine(next: CartLine) {
    const existing = lines.value.find((line) => line.mediaId === next.mediaId)
    if (existing) {
      existing.qty = Math.min(99, existing.qty + next.qty)
      existing.unitPrice = next.unitPrice
      existing.title = next.title
      existing.sku = next.sku
      existing.category = next.category
      existing.description = next.description
      existing.imageUrl = next.imageUrl
      lines.value = [...lines.value]
    } else {
      lines.value = [...lines.value, next]
    }
    persist()
  }

  function add(item: CatalogItem, qty = 1) {
    hydrate()
    upsertLine(cartLineFromCatalog(item, qty))
  }

  function addLine(line: CartLine) {
    hydrate()
    upsertLine({
      mediaId: line.mediaId,
      title: line.title,
      imageUrl: line.imageUrl,
      unitPrice: Math.max(0, Math.round(line.unitPrice)),
      qty: Math.min(99, Math.max(1, Math.round(line.qty))),
    })
  }

  function setQty(mediaId: string, qty: number) {
    hydrate()
    const nextQty = Math.round(qty)
    if (nextQty < 1) {
      remove(mediaId)
      return
    }
    lines.value = lines.value.map((line) =>
      line.mediaId === mediaId
        ? { ...line, qty: Math.min(99, nextQty) }
        : line,
    )
    persist()
  }

  function remove(mediaId: string) {
    hydrate()
    lines.value = lines.value.filter((line) => line.mediaId !== mediaId)
    persist()
  }

  function clear() {
    lines.value = []
    persist()
  }

  const count = computed(() => cartCount(lines.value))
  const total = computed(() => cartTotal(lines.value))
  const totalLabel = computed(() => formatCartTotal(lines.value))
  const isEmpty = computed(() => lines.value.length === 0)

  if (import.meta.client) {
    hydrate()
  }

  return {
    lines,
    count,
    total,
    totalLabel,
    isEmpty,
    hydrate,
    add,
    addLine,
    setQty,
    remove,
    clear,
  }
}
