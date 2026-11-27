import { Injectable } from '@nestjs/common'
import { LeadActivityType, LeadStatus, MediaType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import type { StatsRange } from './dto/stats-series-query.dto'

type Bucket = 'hour' | 'day' | 'month'

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const now = new Date()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    const openStatuses = {
      notIn: [LeadStatus.DONE, LeadStatus.LOST, LeadStatus.ENROLLED],
    }

    const [newLeads, mediaCounts, coaches, inProgress, callbacksToday, callbacksOverdue] =
      await Promise.all([
        this.prisma.lead.count({ where: { status: LeadStatus.NEW } }),
        this.prisma.mediaItem.groupBy({
          by: ['type'],
          _count: { _all: true },
        }),
        this.prisma.coach.count(),
        this.prisma.lead.count({ where: { status: LeadStatus.IN_PROGRESS } }),
        this.prisma.lead.count({
          where: {
            nextContactAt: {
              gte: start,
              lte: (() => {
                const end = new Date(now)
                end.setHours(23, 59, 59, 999)
                return end
              })(),
            },
            status: openStatuses,
          },
        }),
        this.prisma.lead.count({
          where: {
            nextContactAt: { lt: start },
            status: openStatuses,
          },
        }),
      ])

    const byType = Object.fromEntries(
      mediaCounts.map((row) => [row.type, row._count._all]),
    ) as Partial<Record<MediaType, number>>

    return {
      newLeads,
      inProgress,
      callbacksToday,
      callbacksOverdue,
      coaches,
      media: {
        catalog: byType[MediaType.CATALOG] ?? 0,
        news: byType[MediaType.NEWS] ?? 0,
        reviews: byType[MediaType.REVIEW] ?? 0,
        gallery: byType[MediaType.GALLERY] ?? 0,
      },
    }
  }

  async crmKpi(range: StatsRange = 'week') {
    const { from, to } = this.resolveWindow(range)
    const now = new Date()
    const dayStart = new Date(now)
    dayStart.setHours(0, 0, 0, 0)
    const openStatuses = {
      notIn: [LeadStatus.DONE, LeadStatus.LOST, LeadStatus.ENROLLED],
    }

    const [leads, users, callbacksToday, callbacksOverdue] = await Promise.all([
      this.prisma.lead.findMany({
        where: { createdAt: { gte: from, lte: to } },
        select: {
          id: true,
          status: true,
          createdAt: true,
          assigneeId: true,
          nextContactAt: true,
          activities: {
            where: { type: LeadActivityType.STATUS },
            orderBy: { createdAt: 'asc' },
            take: 20,
            select: { createdAt: true, meta: true },
          },
        },
      }),
      this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      }),
      this.prisma.lead.count({
        where: {
          nextContactAt: {
            gte: dayStart,
            lte: (() => {
              const end = new Date(now)
              end.setHours(23, 59, 59, 999)
              return end
            })(),
          },
          status: openStatuses,
        },
      }),
      this.prisma.lead.count({
        where: {
          nextContactAt: { lt: dayStart },
          status: openStatuses,
        },
      }),
    ])

    const byStatus: Record<string, number> = {
      NEW: 0,
      IN_PROGRESS: 0,
      PROCESSED: 0,
      TRIAL: 0,
      ENROLLED: 0,
      LOST: 0,
      DONE: 0,
    }

    const reactionMinutes: number[] = []
    const managerMap = new Map<
      string,
      {
        assigned: number
        trial: number
        enrolled: number
        lost: number
        reactions: number[]
        overdue: number
      }
    >()

    const ensureManager = (id: string) => {
      let row = managerMap.get(id)
      if (!row) {
        row = {
          assigned: 0,
          trial: 0,
          enrolled: 0,
          lost: 0,
          reactions: [],
          overdue: 0,
        }
        managerMap.set(id, row)
      }
      return row
    }

    for (const lead of leads) {
      byStatus[lead.status] = (byStatus[lead.status] ?? 0) + 1

      const reaction = firstReactionMinutes(lead.createdAt, lead.activities)
      if (reaction != null) reactionMinutes.push(reaction)

      if (lead.assigneeId) {
        const row = ensureManager(lead.assigneeId)
        row.assigned += 1
        if (lead.status === LeadStatus.TRIAL) row.trial += 1
        if (lead.status === LeadStatus.ENROLLED) row.enrolled += 1
        if (lead.status === LeadStatus.LOST) row.lost += 1
        if (reaction != null) row.reactions.push(reaction)
        if (
          lead.nextContactAt &&
          lead.nextContactAt < dayStart &&
          lead.status !== LeadStatus.DONE &&
          lead.status !== LeadStatus.LOST &&
          lead.status !== LeadStatus.ENROLLED
        ) {
          row.overdue += 1
        }
      }
    }

    const total = leads.length
    const trial = byStatus.TRIAL ?? 0
    const enrolled = byStatus.ENROLLED ?? 0
    const lost = byStatus.LOST ?? 0
    const closed = trial + enrolled + lost + (byStatus.PROCESSED ?? 0) + (byStatus.DONE ?? 0)

    const userById = new Map(users.map((u) => [u.id, u]))
    const managers = [...managerMap.entries()]
      .map(([id, row]) => {
        const user = userById.get(id)
        const name = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
        return {
          id,
          email: user?.email ?? '',
          name: name || user?.email || 'Менеджер',
          assigned: row.assigned,
          trial: row.trial,
          enrolled: row.enrolled,
          lost: row.lost,
          conversionEnrolled:
            row.assigned > 0 ? Math.round((row.enrolled / row.assigned) * 1000) / 10 : 0,
          avgReactionMinutes: avg(row.reactions),
          overdue: row.overdue,
        }
      })
      .sort((a, b) => b.assigned - a.assigned)

    return {
      range,
      from: from.toISOString(),
      to: to.toISOString(),
      summary: {
        total,
        byStatus,
        trial,
        enrolled,
        lost,
        closed,
        conversionTrial: total > 0 ? Math.round((trial / total) * 1000) / 10 : 0,
        conversionEnrolled: total > 0 ? Math.round((enrolled / total) * 1000) / 10 : 0,
        avgReactionMinutes: avg(reactionMinutes),
        medianReactionMinutes: median(reactionMinutes),
        callbacksToday,
        callbacksOverdue,
      },
      managers,
    }
  }

  async series(range: StatsRange = 'week') {
    const { from, to, bucket } = this.resolveWindow(range)

    const leads = await this.prisma.lead.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: 'asc' },
    })

    const slots = this.buildSlots(from, to, bucket)
    const map = new Map(slots.map((slot) => [slot.key, slot]))

    for (const lead of leads) {
      const key = this.slotKey(lead.createdAt, bucket)
      const slot = map.get(key)
      if (!slot) continue
      slot.total += 1
      if (lead.status === LeadStatus.NEW) slot.newCount += 1
      else if (
        lead.status === LeadStatus.DONE ||
        lead.status === LeadStatus.PROCESSED ||
        lead.status === LeadStatus.TRIAL ||
        lead.status === LeadStatus.ENROLLED ||
        lead.status === LeadStatus.LOST
      ) {
        slot.doneCount += 1
      }
    }

    const points = slots.map((slot) => ({
      key: slot.key,
      label: slot.label,
      total: slot.total,
      new: slot.newCount,
      done: slot.doneCount,
    }))

    const totals = points.reduce(
      (acc, point) => {
        acc.total += point.total
        acc.new += point.new
        acc.done += point.done
        return acc
      },
      { total: 0, new: 0, done: 0 },
    )

    return {
      range,
      bucket,
      from: from.toISOString(),
      to: to.toISOString(),
      points,
      totals,
    }
  }

  async notifications() {
    const now = new Date()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    const end = new Date(now)
    end.setHours(23, 59, 59, 999)
    const openStatuses = {
      notIn: [LeadStatus.DONE, LeadStatus.LOST, LeadStatus.ENROLLED],
    }

    const [newLeads, latest, callbacksToday, callbacksOverdue, dueNow] =
      await Promise.all([
        this.prisma.lead.count({ where: { status: LeadStatus.NEW } }),
        this.prisma.lead.findMany({
          where: { status: LeadStatus.NEW },
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: {
            id: true,
            name: true,
            phone: true,
            source: true,
            createdAt: true,
            status: true,
          },
        }),
        this.prisma.lead.count({
          where: {
            nextContactAt: { gte: start, lte: end },
            status: openStatuses,
          },
        }),
        this.prisma.lead.count({
          where: {
            nextContactAt: { lt: start },
            status: openStatuses,
          },
        }),
        this.prisma.lead.count({
          where: {
            nextContactAt: { lte: now, gte: start },
            status: openStatuses,
          },
        }),
      ])

    return {
      newLeads,
      latest,
      callbacksToday,
      callbacksOverdue,
      dueNow,
    }
  }

  private resolveWindow(range: StatsRange): { from: Date, to: Date, bucket: Bucket } {
    const to = new Date()
    const from = new Date(to)

    switch (range) {
      case 'day':
        from.setHours(from.getHours() - 23, 0, 0, 0)
        to.setMinutes(59, 59, 999)
        return { from, to, bucket: 'hour' }
      case 'week':
        from.setDate(from.getDate() - 6)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        return { from, to, bucket: 'day' }
      case 'month':
        from.setDate(from.getDate() - 29)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        return { from, to, bucket: 'day' }
      case 'year':
        from.setMonth(from.getMonth() - 11, 1)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        return { from, to, bucket: 'month' }
      case 'all':
      default: {
        from.setFullYear(from.getFullYear() - 2, from.getMonth(), 1)
        from.setHours(0, 0, 0, 0)
        to.setHours(23, 59, 59, 999)
        return { from, to, bucket: 'month' }
      }
    }
  }

  private buildSlots(from: Date, to: Date, bucket: Bucket) {
    const slots: { key: string, label: string, total: number, newCount: number, doneCount: number }[] = []
    const cursor = new Date(from)

    if (bucket === 'hour') {
      while (cursor <= to) {
        const key = this.slotKey(cursor, 'hour')
        slots.push({
          key,
          label: cursor.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          total: 0,
          newCount: 0,
          doneCount: 0,
        })
        cursor.setHours(cursor.getHours() + 1)
      }
      return slots
    }

    if (bucket === 'day') {
      while (cursor <= to) {
        const key = this.slotKey(cursor, 'day')
        slots.push({
          key,
          label: cursor.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
          total: 0,
          newCount: 0,
          doneCount: 0,
        })
        cursor.setDate(cursor.getDate() + 1)
      }
      return slots
    }

    cursor.setDate(1)
    while (cursor <= to) {
      const key = this.slotKey(cursor, 'month')
      slots.push({
        key,
        label: cursor.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' }),
        total: 0,
        newCount: 0,
        doneCount: 0,
      })
      cursor.setMonth(cursor.getMonth() + 1)
    }
    return slots
  }

  private slotKey(date: Date, bucket: Bucket) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    if (bucket === 'hour') return `${y}-${m}-${d}T${h}`
    if (bucket === 'day') return `${y}-${m}-${d}`
    return `${y}-${m}`
  }
}

function firstReactionMinutes(
  createdAt: Date,
  activities: { createdAt: Date; meta: unknown }[],
): number | null {
  for (const activity of activities) {
    const meta = activity.meta as { to?: string } | null
    if (meta?.to === LeadStatus.IN_PROGRESS || meta?.to === LeadStatus.PROCESSED) {
      const ms = activity.createdAt.getTime() - createdAt.getTime()
      if (ms >= 0) return Math.round(ms / 60000)
    }
  }
  return null
}

function avg(values: number[]): number | null {
  if (!values.length) return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function median(values: number[]): number | null {
  if (!values.length) return null
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1]! + sorted[mid]!) / 2)
  }
  return sorted[mid]!
}
