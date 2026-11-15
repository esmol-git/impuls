import type { Location } from '~/types'
import { locationLabel } from '~/data/locations'

/** Текст предпочитаемого адреса для заявки / модалки */
export function preferredAddressText(loc: Location): string {
  const branch = locationLabel(loc)
  if (loc.name && loc.name !== '—') {
    return `${branch}, ${loc.address}`
  }
  return loc.address
}
