import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  LeadActivityType,
  LeadStatus,
  Prisma,
} from '@prisma/client'
import type { AuthUser } from '../auth/types'
import { paginated, resolvePage } from '../common/pagination'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { CreateLeadActivityDto } from './dto/create-lead-activity.dto'
import { ListLeadsQueryDto } from './dto/list-leads-query.dto'
import { UpdateLeadDto } from './dto/update-lead.dto'
import { normalizePhone } from './phone'

const leadAssigneeSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
} satisfies Prisma.UserSelect

const activityUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
} satisfies Prisma.UserSelect

const leadInclude = {
  assignee: { select: leadAssigneeSelect },
} satisfies Prisma.LeadInclude

const CLOSED_STATUSES: LeadStatus[] = [
  LeadStatus.PROCESSED,
  LeadStatus.TRIAL,
  LeadStatus.ENROLLED,
  LeadStatus.LOST,
  LeadStatus.DONE,
]

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'Новая',
  IN_PROGRESS: 'В работе',
  PROCESSED: 'Обработана',
  TRIAL: 'Пробное',
  ENROLLED: 'Записан',
  LOST: 'Отказ',
  DONE: 'Завершена',
}

const CALL_RESULT_LABELS: Record<string, string> = {
  answered: 'Дозвон',
  no_answer: 'Недозвон',
  busy: 'Занято',
  callback: 'Перезвонить',
}

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLeadDto) {
    const phone = dto.phone.trim()
    const phoneNorm = normalizePhone(phone) || null
    const items = dto.items?.length
      ? dto.items.map((item) => ({
          mediaId: item.mediaId,
          title: item.title,
          sku: item.sku ?? null,
          category: item.category ?? null,
          description: item.description ?? null,
          imageUrl: item.imageUrl ?? null,
          unitPrice: item.unitPrice,
          qty: item.qty,
        }))
      : undefined

    return this.prisma.lead.create({
      data: {
        name: dto.name.trim(),
        phone,
        phoneNorm,
        age: dto.age,
        message: dto.message,
        source: dto.source,
        location: dto.location,
        program: dto.program,
        variant: dto.variant,
        guestToken: dto.guestToken,
        ...(items ? { items } : {}),
        activities: {
          create: {
            type: LeadActivityType.SYSTEM,
            body: 'Заявка создана с сайта',
          },
        },
      },
      include: leadInclude,
    })
  }

  async list(query: ListLeadsQueryDto, user: AuthUser) {
    const { page, limit, skip } = resolvePage(query.page, query.limit)
    let sort = query.sort ?? 'createdAt'
    let order = query.order ?? 'desc'
    const where: Prisma.LeadWhereInput = {}

    if (query.status) where.status = query.status

    if (query.assigneeId) {
      where.assigneeId =
        query.assigneeId === 'me' ? user.id : query.assigneeId
    }

    if (query.callback) {
      const now = new Date()
      const start = startOfDay(now)
      const end = endOfDay(now)
      if (query.callback === 'today') {
        where.nextContactAt = { gte: start, lte: end }
        where.status = query.status
          ? query.status
          : { notIn: [LeadStatus.DONE, LeadStatus.LOST, LeadStatus.ENROLLED] }
      } else if (query.callback === 'overdue') {
        where.nextContactAt = { lt: start }
        where.status = query.status
          ? query.status
          : { notIn: [LeadStatus.DONE, LeadStatus.LOST, LeadStatus.ENROLLED] }
      } else {
        where.nextContactAt = { gt: end }
      }
      // Очередь перезвонов: ближайшие сверху
      if (!query.sort || query.sort === 'createdAt') {
        sort = 'nextContactAt'
        order = query.order ?? 'asc'
      }
    }

    const q = query.q?.trim()
    if (q) {
      const phoneNorm = normalizePhone(q)
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        ...(phoneNorm ? [{ phoneNorm: { contains: phoneNorm } }] : []),
        { source: { contains: q, mode: 'insensitive' } },
        { program: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { note: { contains: q, mode: 'insensitive' } },
        { childName: { contains: q, mode: 'insensitive' } },
      ]
    }

    const orderBy: Prisma.LeadOrderByWithRelationInput =
      sort === 'nextContactAt'
        ? { nextContactAt: order }
        : { [sort]: order }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        include: leadInclude,
        orderBy,
        skip,
        take: limit,
      }),
    ])

    return paginated(items, page, limit, total, { sort, order })
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id },
      include: {
        ...leadInclude,
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: { user: { select: activityUserSelect } },
        },
      },
    })
    if (!lead) {
      throw new NotFoundException('Заявка не найдена')
    }

    const relatedLeads = lead.phoneNorm
      ? await this.prisma.lead.findMany({
          where: {
            phoneNorm: lead.phoneNorm,
            id: { not: lead.id },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            name: true,
            status: true,
            source: true,
            createdAt: true,
            assignee: { select: leadAssigneeSelect },
          },
        })
      : []

    return { ...lead, relatedLeads }
  }

  listAssignees() {
    return this.prisma.user.findMany({
      select: leadAssigneeSelect,
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }, { email: 'asc' }],
    })
  }

  async update(id: string, dto: UpdateLeadDto, user: AuthUser) {
    const existing = await this.ensureExists(id)

    if (dto.status === LeadStatus.LOST) {
      const reason = dto.lostReason ?? existing.lostReason
      if (!reason?.trim()) {
        throw new BadRequestException('Укажите причину отказа')
      }
    }

    const data: Prisma.LeadUpdateInput = {}
    const activities: Prisma.LeadActivityCreateWithoutLeadInput[] = []

    if (dto.note !== undefined && dto.note !== existing.note) {
      data.note = dto.note
      activities.push({
        type: LeadActivityType.NOTE,
        body: dto.note?.trim() || 'Заметка очищена',
        user: { connect: { id: user.id } },
      })
    }

    if (dto.childName !== undefined) {
      data.childName = dto.childName
    }

    if (dto.lostReason !== undefined) {
      data.lostReason = dto.lostReason
    }

    if (dto.nextContactAt !== undefined) {
      const prev = existing.nextContactAt?.toISOString() ?? null
      const next = dto.nextContactAt?.toISOString() ?? null
      if (prev !== next) {
        data.nextContactAt = dto.nextContactAt
        activities.push({
          type: LeadActivityType.CALLBACK,
          body: dto.nextContactAt
            ? `Перезвон: ${formatRuDateTime(dto.nextContactAt)}`
            : 'Перезвон снят',
          user: { connect: { id: user.id } },
          meta: { nextContactAt: next },
        })
      }
    }

    if (dto.assigneeId !== undefined) {
      const prevId = existing.assigneeId
      if (dto.assigneeId === null) {
        data.assignee = { disconnect: true }
        if (prevId) {
          activities.push({
            type: LeadActivityType.ASSIGNEE,
            body: 'Менеджер снят',
            user: { connect: { id: user.id } },
            meta: { assigneeId: null },
          })
        }
      } else if (dto.assigneeId !== prevId) {
        await this.ensureUserExists(dto.assigneeId)
        data.assignee = { connect: { id: dto.assigneeId } }
        activities.push({
          type: LeadActivityType.ASSIGNEE,
          body: 'Назначен менеджер',
          user: { connect: { id: user.id } },
          meta: { assigneeId: dto.assigneeId },
        })
      }
    }

    if (dto.status !== undefined && dto.status !== existing.status) {
      data.status = dto.status
      activities.push({
        type: LeadActivityType.STATUS,
        body: `Статус: ${STATUS_LABELS[existing.status]} → ${STATUS_LABELS[dto.status]}`,
        user: { connect: { id: user.id } },
        meta: { from: existing.status, to: dto.status },
      })

      if (dto.status === LeadStatus.NEW) {
        data.handledAt = null
        data.lostReason = null
        if (dto.assigneeId === undefined) {
          data.assignee = { disconnect: true }
        }
      }

      if (dto.status === LeadStatus.IN_PROGRESS) {
        data.handledAt = null
        if (dto.assigneeId === undefined && !existing.assigneeId) {
          data.assignee = { connect: { id: user.id } }
          activities.push({
            type: LeadActivityType.ASSIGNEE,
            body: 'Автоназначение при взятии в работу',
            user: { connect: { id: user.id } },
            meta: { assigneeId: user.id, auto: true },
          })
        }
      }

      if (CLOSED_STATUSES.includes(dto.status)) {
        data.handledAt = new Date()
        if (dto.assigneeId === undefined && !existing.assigneeId) {
          data.assignee = { connect: { id: user.id } }
        }
        if (dto.status !== LeadStatus.LOST && dto.lostReason === undefined) {
          data.lostReason = null
        }
      }
    }

    if (activities.length) {
      data.activities = { create: activities }
    }

    const updated = await this.prisma.lead.update({
      where: { id },
      data,
      include: leadInclude,
    })

    return this.findOne(updated.id)
  }

  async addActivity(id: string, dto: CreateLeadActivityDto, user: AuthUser) {
    await this.ensureExists(id)

    if (dto.type === LeadActivityType.CALL && !dto.callResult) {
      throw new BadRequestException('Укажите результат звонка')
    }

    const leadPatch: Prisma.LeadUpdateInput = {}
    let body = dto.body?.trim()

    if (dto.type === LeadActivityType.CALL && dto.callResult) {
      body = body || CALL_RESULT_LABELS[dto.callResult] || dto.callResult
      if (dto.callResult === 'callback' || dto.nextContactAt) {
        if (dto.nextContactAt) {
          leadPatch.nextContactAt = dto.nextContactAt
        }
      }
      if (dto.callResult === 'answered' && !dto.nextContactAt) {
        // keep nextContactAt as-is unless explicitly set
      }
    }

    if (dto.type === LeadActivityType.CALLBACK && dto.nextContactAt !== undefined) {
      leadPatch.nextContactAt = dto.nextContactAt
      body =
        body ||
        (dto.nextContactAt
          ? `Перезвон: ${formatRuDateTime(dto.nextContactAt)}`
          : 'Перезвон снят')
    }

    if (dto.nextContactAt !== undefined && dto.type === LeadActivityType.CALL) {
      leadPatch.nextContactAt = dto.nextContactAt
    }

    const meta: Record<string, unknown> = {
      ...(dto.meta ?? {}),
      ...(dto.callResult ? { callResult: dto.callResult } : {}),
      ...(dto.nextContactAt !== undefined
        ? { nextContactAt: dto.nextContactAt?.toISOString() ?? null }
        : {}),
    }

    await this.prisma.$transaction(async (tx) => {
      if (Object.keys(leadPatch).length) {
        await tx.lead.update({ where: { id }, data: leadPatch })
      }
      await tx.leadActivity.create({
        data: {
          leadId: id,
          userId: user.id,
          type: dto.type,
          body: body || null,
          meta: Object.keys(meta).length
            ? (meta as Prisma.InputJsonValue)
            : undefined,
        },
      })
    })

    return this.findOne(id)
  }

  async remove(id: string) {
    await this.ensureExists(id)
    await this.prisma.lead.delete({ where: { id } })
    return { ok: true }
  }

  private async ensureExists(id: string) {
    const existing = await this.prisma.lead.findUnique({
      where: { id },
      include: leadInclude,
    })
    if (!existing) {
      throw new NotFoundException('Заявка не найдена')
    }
    return existing
  }

  private async ensureUserExists(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })
    if (!user) {
      throw new BadRequestException('Менеджер не найден')
    }
  }
}

function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function formatRuDateTime(date: Date) {
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
