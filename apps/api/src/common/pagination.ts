export const DEFAULT_PAGE = 1
export const DEFAULT_LIMIT = 20
export const MAX_LIMIT = 100

export type SortOrder = 'asc' | 'desc'

export interface PageParams {
  page: number
  limit: number
  skip: number
}

export interface PageMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Paginated<T, M extends PageMeta = PageMeta> {
  items: T[]
  meta: M
}

export function resolvePage(
  page?: number,
  limit?: number,
  options?: { defaultLimit?: number; maxLimit?: number },
): PageParams {
  const maxLimit = options?.maxLimit ?? MAX_LIMIT
  const defaultLimit = options?.defaultLimit ?? DEFAULT_LIMIT
  const take = Math.min(maxLimit, Math.max(1, limit ?? defaultLimit))
  const current = Math.max(1, page ?? DEFAULT_PAGE)
  return {
    page: current,
    limit: take,
    skip: (current - 1) * take,
  }
}

export function buildPageMeta(page: number, limit: number, total: number): PageMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / Math.max(1, limit))),
  }
}

export function paginated<T, E extends Record<string, unknown> = Record<string, never>>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  extra?: E,
): Paginated<T, PageMeta & E> {
  return {
    items,
    meta: {
      ...buildPageMeta(page, limit, total),
      ...(extra as E),
    },
  }
}
