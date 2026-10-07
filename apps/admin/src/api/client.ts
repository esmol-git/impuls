const ACCESS_KEY = 'impuls_admin_token'
const REFRESH_KEY = 'impuls_admin_refresh'

export function getToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function setTokens(accessToken: string | null, refreshToken?: string | null) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
  else localStorage.removeItem(ACCESS_KEY)

  if (refreshToken === undefined) return
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
  else localStorage.removeItem(REFRESH_KEY)
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

let refreshPromise: Promise<boolean> | null = null
let authFailureHandler: (() => void) | null = null

/** Вызывается после неудачного refresh (редирект на логин). */
export function setAuthFailureHandler(handler: (() => void) | null) {
  authFailureHandler = handler
}

function notifyAuthFailure() {
  authFailureHandler?.()
}

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })
    if (!res.ok) {
      setTokens(null, null)
      return false
    }
    const data = (await res.json()) as {
      accessToken: string
      refreshToken: string
    }
    setTokens(data.accessToken, data.refreshToken)
    return true
  } catch {
    setTokens(null, null)
    return false
  }
}

export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers)
  const token = getToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const res = await fetch(path, { ...init, headers })

  if (res.status === 401 && retry && !path.includes('/api/auth/login') && !path.includes('/api/auth/refresh')) {
    if (!refreshPromise) {
      refreshPromise = tryRefresh().finally(() => {
        refreshPromise = null
      })
    }
    const ok = await refreshPromise
    if (ok) return api<T>(path, init, false)
    notifyAuthFailure()
    throw new ApiError('Сессия истекла. Войдите снова.', 401)
  }

  if (!res.ok) {
    let message = 'Ошибка запроса'
    try {
      const data = (await res.json()) as { message?: string | string[] }
      if (Array.isArray(data.message)) message = data.message.join(', ')
      else if (data.message) message = data.message
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
