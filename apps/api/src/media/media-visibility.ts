import { BadRequestException } from '@nestjs/common'
import { MediaType, Prisma } from '@prisma/client'

export function parseOptionalDate(value?: string | null): Date | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

/** publishAt: не раньше createdAt и не дальше +1 год; unpublishAt позже publishAt/createdAt */
export function assertNewsSchedule(
  createdAt: Date,
  publishAt: Date | null | undefined,
  unpublishAt: Date | null | undefined,
) {
  const max = new Date(createdAt)
  max.setFullYear(max.getFullYear() + 1)

  if (publishAt) {
    if (publishAt.getTime() < createdAt.getTime()) {
      throw new BadRequestException('Дата публикации не может быть раньше даты создания')
    }
    if (publishAt.getTime() > max.getTime()) {
      throw new BadRequestException('Дата публикации не дальше чем через год после создания')
    }
  }

  if (unpublishAt) {
    const minUnpublish = publishAt || createdAt
    if (unpublishAt.getTime() <= minUnpublish.getTime()) {
      throw new BadRequestException('Снятие с публикации должно быть позже даты публикации')
    }
  }
}

/**
 * Видимость на сайте:
 * - published = false → черновик, никогда не показываем
 * - publishAt / unpublishAt не заданы → обычное поведение (сразу при published)
 * - publishAt в будущем → ещё не показывать
 * - unpublishAt в прошлом → уже не показывать
 */
export function isPubliclyVisibleNow(
  item: {
    published: boolean
    publishAt?: Date | string | null
    unpublishAt?: Date | string | null
  },
  now = new Date(),
) {
  if (!item.published) return false
  if (item.publishAt) {
    const start = new Date(item.publishAt)
    if (!Number.isNaN(start.getTime()) && start.getTime() > now.getTime()) return false
  }
  if (item.unpublishAt) {
    const end = new Date(item.unpublishAt)
    if (!Number.isNaN(end.getTime()) && end.getTime() <= now.getTime()) return false
  }
  return true
}

/** WHERE для публичных списков/карточек новостей */
export function newsVisibleWhere(now = new Date()): Prisma.MediaItemWhereInput {
  return {
    type: MediaType.NEWS,
    published: true,
    AND: [
      { OR: [{ publishAt: null }, { publishAt: { lte: now } }] },
      { OR: [{ unpublishAt: null }, { unpublishAt: { gt: now } }] },
    ],
  }
}

/** Для универсального listPublic(type) */
export function publishedVisibleWhere(
  type: MediaType | undefined,
  now = new Date(),
): Prisma.MediaItemWhereInput {
  if (type === MediaType.NEWS) return newsVisibleWhere(now)
  return {
    published: true,
    ...(type ? { type } : {}),
  }
}
