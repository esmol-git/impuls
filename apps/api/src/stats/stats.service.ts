import { Injectable } from '@nestjs/common'
import { LeadStatus, MediaType } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import type { StatsRange } from './dto/stats-series-query.dto'

type Bucket = 'hour' | 'day' | 'month'

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard() {
    const [newLeads, mediaCounts] = await Promise.all([
      this.prisma.lead.count({ where: { status: LeadStatus.NEW } }),
      this.prisma.mediaItem.groupBy({
        by: ['type'],
        _count: { _all: true },
      }),
    ])

    const byType = Object.fromEntries(
      mediaCounts.map((row) => [row.type, row._count._all]),
    ) as Partial<Record<MediaType, number>>

    return {
      newLeads,
      media: {
        catalog: byType[MediaType.CATALOG] ?? 0,
        news: byType[MediaType.NEWS] ?? 0,
        reviews: byType[MediaType.REVIEW] ?? 0,
        gallery: byType[MediaType.GALLERY] ?? 0,
      },
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
      else slot.doneCount += 1
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
    const [newLeads, latest] = await Promise.all([
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
    ])

    return { newLeads, latest }
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
