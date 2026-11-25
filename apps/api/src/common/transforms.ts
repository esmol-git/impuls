/** Shared class-transformer helpers for query/body DTOs. */

export function trimString({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim() : value
}

/**
 * Query/body boolean. Empty string → undefined (omit filter),
 * not false — so `?published=` does not hide everything.
 */
export function toBool(value: unknown): boolean | undefined {
  if (value === true || value === 'true' || value === '1') return true
  if (value === false || value === 'false' || value === '0') return false
  return undefined
}

export function transformToBool({ value }: { value: unknown }) {
  return toBool(value)
}
