import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api, getRefreshToken, getToken, setTokens } from '@/api/client'
import type { AuthTokens, Role, User } from '@/api/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(getToken())
  const ready = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(
    () => user.value?.role === 'ADMIN' || user.value?.role === 'SUPERADMIN',
  )
  const isSuperAdmin = computed(() => user.value?.role === 'SUPERADMIN')
  const roleLabel = computed(() => {
    const role = user.value?.role as Role | undefined
    if (role === 'SUPERADMIN') return 'Суперадмин'
    if (role === 'ADMIN') return 'Админ'
    if (role === 'MANAGER') return 'Менеджер'
    return ''
  })

  async function login(email: string, password: string) {
    const data = await api<AuthTokens>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    token.value = data.accessToken
    setTokens(data.accessToken, data.refreshToken)
    user.value = data.user
  }

  async function fetchMe() {
    if (!token.value && !getRefreshToken()) {
      ready.value = true
      return
    }

    if (!token.value && getRefreshToken()) {
      try {
        const data = await api<AuthTokens>('/api/auth/refresh', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: getRefreshToken() }),
        }, false)
        token.value = data.accessToken
        setTokens(data.accessToken, data.refreshToken)
        user.value = data.user
        ready.value = true
        return
      } catch {
        setTokens(null, null)
        user.value = null
        ready.value = true
        return
      }
    }

    try {
      user.value = await api<User>('/api/auth/me')
      token.value = getToken()
    } catch {
      token.value = null
      setTokens(null, null)
      user.value = null
    } finally {
      ready.value = true
    }
  }

  function clearSession() {
    token.value = null
    setTokens(null, null)
    user.value = null
  }

  async function logout() {
    const refreshToken = getRefreshToken()
    try {
      await api('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      }, false)
    } catch {
      /* ignore */
    }
    clearSession()
  }

  return {
    user,
    token,
    ready,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    roleLabel,
    login,
    fetchMe,
    logout,
    clearSession,
  }
})
