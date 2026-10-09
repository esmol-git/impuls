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
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
      imageUrl: typeof row.imageUrl === 'string' ? row.imageUrl.slice(0, 500) : undefined,
      unitPrice: Math.max(0, Math.round(unitPrice)),
      qty: Math.min(99, Math.max(1, Math.round(qty))),
    })
  }
  return rows.length ? rows : undefined
}

export default defineEventHandler(async (event) => {
  const body = await readBody<LeadBody>(event)

  if (!body.name?.trim() || !body.phone?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Заполните обязательные поля' })
  }

  const config = useRuntimeConfig()
  const items = sanitizeItems(body.items)
  const payload = {
    name: body.name.trim(),
    phone: body.phone.trim(),
    age: body.age,
    message: body.message,
    source: body.source,
    location: body.location,
    program: body.program,
    variant: body.variant,
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
    if (!token || !chatId) {
      console.warn('[api/lead] Telegram не настроен — заявка принята в mock-режиме')
      return { ok: true, mock: true }
    }
    throw createError({ statusCode: 502, statusMessage: 'Не удалось обработать заявку' })
  }

  return { ok: true, saved, telegramSent, mock: !saved && !telegramSent }
})
