import type { Coach } from '~/types'

export function useCoaches() {
  return useAsyncData('coaches', () => $fetch<Coach[]>('/api/coaches'), {
    default: () => [],
  })
}
