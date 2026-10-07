import type { CatalogItem } from '~/utils/catalog'
import { catalogImages, effectivePrice, formatRub } from '~/utils/catalog'

/** Позиция гостевой корзины / состава заявки */
export interface CartLine {
  mediaId: string
  title: string
  sku?: string
  category?: string
  description?: string
  imageUrl?: string
  unitPrice: number
  qty: number
}

function shortDescription(value?: string | null) {
  if (!value) return undefined
  const text = value.replace(/\s+/g, ' ').trim()
  if (!text) return undefined
  return text.length > 500 ? `${text.slice(0, 497)}…` : text
}

export function cartLineFromCatalog(item: CatalogItem, qty = 1): CartLine {
  const image = catalogImages(item)[0]
  return {
    mediaId: item.id,
    title: item.title,
    sku: item.sku || undefined,
    category: item.category || undefined,
    description: shortDescription(item.description),
    imageUrl: image || undefined,
    unitPrice: effectivePrice(item) ?? 0,
    qty,
  }
}

export function cartLineTotal(line: CartLine) {
  return line.unitPrice * line.qty
}

export function cartTotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + cartLineTotal(line), 0)
}

export function cartCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.qty, 0)
}

export function formatCartTotal(lines: CartLine[]) {
  return formatRub(cartTotal(lines))
}

export function orderProgramLabel(lines: CartLine[]) {
  if (!lines.length) return undefined
  if (lines.length === 1) {
    const title = lines[0].title
    const sku = lines[0].sku ? ` [${lines[0].sku}]` : ''
    const label = `${title}${sku}`
    return label.length > 100 ? `${label.slice(0, 97)}…` : label
  }
  return `Заказ из каталога (${lines.length})`
}
