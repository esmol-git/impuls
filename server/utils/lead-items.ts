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
