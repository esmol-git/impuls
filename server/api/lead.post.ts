import type { CartLine } from '../utils/lead-items'

interface LeadBody {
  name?: string
  phone?: string
  age?: string
  message?: string
  source?: string
  location?: string
  program?: string
  variant?: string
  guestToken?: string
  items?: CartLine[]
  /** Honeypot — боты заполняют «website» */
  website?: string
  consent?: boolean
  /** Client timestamp when form opened (ms) */
  openedAt?: number
}

const RATE_WINDOW_MS = 60_000
const RATE_MAX = 5
const rateBuckets = new Map<string, number[]>()

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function phoneDigits(value: string) {
  return value.replace(/\D/g, '')
}

function isValidRuPhone(value: string) {
  const digits = phoneDigits(value)
  return digits.length === 11 && digits.startsWith('7')
}

function clientIp(event: Parameters<typeof getRequestHeader>[0]) {
  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]?.trim() || 'unknown'
  return getRequestHeader(event, 'x-real-ip') || 'unknown'
}

function assertRateLimit(ip: string) {
  const now = Date.now()
  const prev = rateBuckets.get(ip) || []
  const recent = prev.filter((t) => now - t < RATE_WINDOW_MS)
  if (recent.length >= RATE_MAX) {
    throw createError({ statusCode: 429, statusMessage: 'Слишком много заявок. Подождите минуту.' })
  }
  recent.push(now)
  rateBuckets.set(ip, recent)
}

function sanitizeItems(items: unknown): CartLine[] | undefined {
  if (!Array.isArray(items) || !items.length) return undefined
  const rows: CartLine[] = []
  for (const raw of items.slice(0, 50)) {
    if (!raw || typeof raw !== 'object') continue
    const row = raw as Record<string, unknown>
    if (typeof row.mediaId !== 'string' || typeof row.title !== 'string') continue
    const unitPrice = Number(row.unitPrice)
    const qty = Number(row.qty)
    if (!Number.isFinite(unitPrice) || !Number.isFinite(qty)) continue
    rows.push({
      mediaId: row.mediaId.slice(0, 64),
      title: row.title.trim().slice(0, 200),
      sku: typeof row.sku === 'string' ? row.sku.trim().slice(0, 64) || undefined : undefined,
      category: typeof row.category === 'string' ? row.category.trim().slice(0, 120) || undefined : undefined,
      description: typeof row.description === 'string' ? row.description.trim().slice(0, 500) || undefined : undefined,
      imageUrl: typeof row.imageUrl === 'string' ? publicImageUrl(row.imageUrl.slice(0, 500)) || undefined : undefined,
      unitPrice: Math.max(0, Math.round(unitPrice)),
      qty: Math.min(99, Math.max(1, Math.round(qty))),
    })
  }
  return rows.length ? rows : undefined
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LeadBody>(event)

  // Honeypot: silently accept so bots think it worked
  if (typeof body.website === 'string' && body.website.trim()) {
    return { ok: true, mock: true }
  }

  const openedAt = typeof body.openedAt === 'number' ? body.openedAt : 0
  if (openedAt > 0 && Date.now() - openedAt < 1200) {
    return { ok: true, mock: true }
  }

  const name = body.name?.trim() || ''
  const phone = body.phone?.trim() || ''

  if (!name || name.length < 2 || name.length > 80) {
    throw createError({ statusCode: 400, statusMessage: 'Укажите имя' })
  }
  if (!isValidRuPhone(phone)) {
    throw createError({ statusCode: 400, statusMessage: 'Укажите телефон в формате +7…' })
  }
  if (body.consent !== true) {
    throw createError({ statusCode: 400, statusMessage: 'Нужно согласие на обработку данных' })
  }

  assertRateLimit(clientIp(event))

  const config = useRuntimeConfig()
  const items = sanitizeItems(body.items)
  const payload = {
    name,
    phone,
    age: typeof body.age === 'string' ? body.age.slice(0, 32) : undefined,
    message: typeof body.message === 'string' ? body.message.trim().slice(0, 1000) || undefined : undefined,
    source: typeof body.source === 'string' ? body.source.slice(0, 120) : undefined,
    location: typeof body.location === 'string' ? body.location.slice(0, 200) : undefined,
    program: typeof body.program === 'string' ? body.program.slice(0, 200) : undefined,
    variant: typeof body.variant === 'string' ? body.variant.slice(0, 32) : undefined,
    guestToken: typeof body.guestToken === 'string' ? body.guestToken.slice(0, 64) : undefined,
    items,
  }

  let saved = false
  const apiUrl = (config.apiUrl as string | undefined)?.replace(/\/$/, '')

  if (apiUrl) {
    try {
      await $fetch(`${apiUrl}/api/leads`, {
        method: 'POST',
        body: payload,
      })
      saved = true
    } catch (error) {
      console.error('[api/lead] Не удалось сохранить заявку в Nest API', error)
    }
  } else {
    console.warn('[api/lead] NUXT_API_URL не задан — заявка не сохранена в БД')
  }

  const token = config.telegramBotToken
  const chatId = config.telegramChatId

  const lines = [
    items?.length ? '🛒 <b>Заявка на покупку</b>' : '📋 <b>Новая заявка</b>',
    `Имя: ${escapeHtml(payload.name)}`,
    `Телефон: ${escapeHtml(payload.phone)}`,
  ]

  if (payload.age) {
    const birth = payload.age.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    const ageLabel = birth ? `${birth[3]}.${birth[2]}.${birth[1]}` : payload.age
    lines.push(`Дата рождения: ${escapeHtml(ageLabel)}`)
  }
  if (payload.message) lines.push(`Комментарий: ${escapeHtml(payload.message)}`)
  if (payload.program) lines.push(`Группа / заказ: ${escapeHtml(payload.program)}`)
  if (payload.location) lines.push(`Площадка: ${escapeHtml(payload.location)}`)
  if (payload.source) lines.push(`Источник: ${escapeHtml(payload.source)}`)
  if (payload.variant) lines.push(`Форма: ${escapeHtml(payload.variant)}`)

  if (items?.length) {
    lines.push('')
    lines.push('<b>Состав:</b>')
    let total = 0
    for (const item of items) {
      const lineSum = item.unitPrice * item.qty
      total += lineSum
      const sku = item.sku ? ` [${escapeHtml(item.sku)}]` : ''
      const category = item.category ? ` · ${escapeHtml(item.category)}` : ''
      lines.push(
        `• <b>${escapeHtml(item.title)}</b>${sku}${category}`,
      )
      if (item.description) {
        lines.push(`  ${escapeHtml(item.description)}`)
      }
      lines.push(
        `  × ${item.qty} — ${lineSum.toLocaleString('ru-RU')} ₽`,
      )
    }
    lines.push(`<b>Итого: ${total.toLocaleString('ru-RU')} ₽</b>`)
  }

  let telegramSent = false
  if (token && chatId) {
    try {
      await $fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        body: {
          chat_id: chatId,
          text: lines.join('\n'),
          parse_mode: 'HTML',
        },
      })
      telegramSent = true
    } catch (error) {
      console.error('[api/lead] Не удалось отправить в Telegram', error)
    }
  }

  if (!saved && !telegramSent) {
    // В prod не притворяемся успехом — иначе спам/тихие потери заявок
    if (!import.meta.dev) {
      throw createError({ statusCode: 502, statusMessage: 'Не удалось обработать заявку' })
    }
    if (!token || !chatId) {
      console.warn('[api/lead] Telegram не настроен — заявка принята в mock-режиме')
      return { ok: true, mock: true }
    }
    throw createError({ statusCode: 502, statusMessage: 'Не удалось обработать заявку' })
  }

  return { ok: true, saved, telegramSent, mock: !saved && !telegramSent }
})
