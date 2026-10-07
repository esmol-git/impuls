import { Injectable, Logger } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { paginated, resolvePage } from '../common/pagination'
import { PrismaService } from '../prisma/prisma.service'
import { ListAuditQueryDto } from './dto/list-audit-query.dto'

export interface AuditRecordInput {
  actorId?: string | null
  actorEmail?: string | null
  action: string
  entity?: string | null
  entityId?: string | null
  summary: string
  meta?: Record<string, unknown> | null
  ip?: string | null
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name)

  constructor(private readonly prisma: PrismaService) {}

  async record(input: AuditRecordInput) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actorId: input.actorId || null,
          actorEmail: input.actorEmail || null,
          action: input.action,
          entity: input.entity || null,
          entityId: input.entityId || null,
          summary: input.summary.slice(0, 500),
          meta: (input.meta ?? undefined) as Prisma.InputJsonValue | undefined,
          ip: input.ip || null,
        },
      })
    } catch (error) {
      this.logger.warn(`Не удалось записать audit: ${String(error)}`)
    }
  }

  async list(query: ListAuditQueryDto = {}) {
    const { page, limit, skip } = resolvePage(query.page, query.limit, { defaultLimit: 30 })
    const sort = query.sort ?? 'createdAt'
    const order = query.order ?? 'desc'

    const where: Prisma.AuditLogWhereInput = {}
    if (query.action?.trim()) {
      where.action = { contains: query.action.trim(), mode: 'insensitive' }
    }
    if (query.entity?.trim()) {
      where.entity = query.entity.trim()
    }
    if (query.actorEmail?.trim()) {
      where.actorEmail = { contains: query.actorEmail.trim(), mode: 'insensitive' }
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.auditLog.count({ where }),
      this.prisma.auditLog.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
    ])

    return paginated(items, page, limit, total, { sort, order })
  }
}
