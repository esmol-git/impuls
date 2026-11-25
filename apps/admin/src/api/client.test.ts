import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  api,
  apiFetch,
  ApiError,
  setAuthFailureHandler,
  setTokens,
} from './client'

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    ...init,
  })
}

describe('api client auth', () => {
  beforeEach(() => {
    localStorage.clear()
    setTokens(null, null)
    setAuthFailureHandler(null)
    vi.restoreAllMocks()
  })

  afterEach(() => {
    setAuthFailureHandler(null)
  })

  it('retries once after refresh on 401', async () => {
    setTokens('expired', 'refresh-token')

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValueOnce(
        jsonResponse({ accessToken: 'new-access', refreshToken: 'new-refresh' }),
      )
      .mockResolvedValueOnce(jsonResponse({ ok: true }))

    vi.stubGlobal('fetch', fetchMock)

    const data = await api<{ ok: boolean }>('/api/admin/ping')
    expect(data.ok).toBe(true)
    expect(localStorage.getItem('impuls_admin_token')).toBe('new-access')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('notifies auth failure when refresh fails', async () => {
    setTokens('expired', 'refresh-token')
    const onFail = vi.fn()
    setAuthFailureHandler(onFail)

    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('unauthorized', { status: 401 }))
      .mockResolvedValueOnce(new Response('nope', { status: 401 }))

    vi.stubGlobal('fetch', fetchMock)

    await expect(api('/api/admin/ping')).rejects.toBeInstanceOf(ApiError)
    expect(onFail).toHaveBeenCalledTimes(1)
    expect(localStorage.getItem('impuls_admin_token')).toBeNull()
  })

  it('keeps 304 responses for etag polling', async () => {
    setTokens('access', null)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(new Response(null, { status: 304 })),
    )

    const res = await apiFetch('/api/admin/notifications', {
      headers: { 'If-None-Match': '"abc"' },
    })
    expect(res.status).toBe(304)
  })
})
