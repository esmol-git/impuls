export default defineNuxtRouteMiddleware(async (to) => {
  const { data } = await useFetch<{ enabled: boolean }>('/api/settings/maintenance', {
    key: 'maintenance-mode',
    default: () => ({ enabled: false }),
  })

  const on = data.value?.enabled === true

  if (on && to.path !== '/maintenance') {
    return navigateTo('/maintenance')
  }

  if (!on && to.path === '/maintenance') {
    return navigateTo('/')
  }
})
