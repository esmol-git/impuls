import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { auth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'leads',
          name: 'leads',
          component: () => import('@/views/LeadsView.vue'),
        },
        {
          path: 'catalog/new',
          name: 'catalog-create',
          component: () => import('@/views/CatalogEditView.vue'),
        },
        {
          path: 'catalog/:id/edit',
          name: 'catalog-edit',
          component: () => import('@/views/CatalogEditView.vue'),
        },
        {
          path: 'catalog',
          name: 'catalog',
          component: () => import('@/views/CatalogView.vue'),
        },
        {
          path: 'news/new',
          name: 'news-create',
          component: () => import('@/views/NewsEditView.vue'),
        },
        {
          path: 'news/:id/edit',
          name: 'news-edit',
          component: () => import('@/views/NewsEditView.vue'),
        },
        {
          path: 'news',
          name: 'news',
          component: () => import('@/views/MediaView.vue'),
          props: { type: 'NEWS', title: 'Новости' },
        },
        {
          path: 'reviews',
          name: 'reviews',
          component: () => import('@/views/MediaView.vue'),
          props: { type: 'REVIEW', title: 'Отзывы' },
        },
        {
          path: 'coaches/new',
          name: 'coaches-create',
          component: () => import('@/views/CoachEditView.vue'),
        },
        {
          path: 'coaches/:id/edit',
          name: 'coaches-edit',
          component: () => import('@/views/CoachEditView.vue'),
        },
        {
          path: 'coaches',
          name: 'coaches',
          component: () => import('@/views/CoachesView.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/SettingsView.vue'),
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/UsersView.vue'),
          meta: { admin: true },
        },
        {
          path: 'audit',
          name: 'audit',
          component: () => import('@/views/AuditView.vue'),
          meta: { admin: true },
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.ready) {
    await auth.fetchMe()
  }

  if (to.meta.auth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guest && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }
  if (to.meta.admin && !auth.isAdmin) {
    return { name: 'dashboard' }
  }
  return true
})
