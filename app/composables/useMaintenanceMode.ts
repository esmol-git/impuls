export interface MaintenanceStatus {
  enabled: boolean
}

/** Флаг режима обслуживания с публичного API. */
export function useMaintenanceMode() {
  const { data, pending, error, refresh } = useFetch<MaintenanceStatus>('/api/settings/maintenance', {
    key: 'maintenance-mode',
    default: () => ({ enabled: false }),
  })

  const enabled = computed(() => data.value?.enabled === true)

  return { status: data, enabled, pending, error, refresh }
}
