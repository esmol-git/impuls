import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { navItems } from '@/navigation'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

export function useNavMenu() {
  const auth = useAuthStore()
  const notifications = useNotificationsStore()
  const route = useRoute()

  const menu = computed(() =>
    navItems
      .filter((item) => !item.adminOnly || auth.isAdmin)
      .map((item) => ({
        ...item,
        badge: item.path === '/leads' ? notifications.badgeLabel : undefined,
      })),
  )

  const activePath = computed(() => {
    const path = route.path
    if (path === '/') return '/'
    const match = menu.value.find(
      (item) => item.path !== '/' && (path === item.path || path.startsWith(`${item.path}/`)),
    )
    return match?.path || path
  })

  return { menu, activePath }
}
