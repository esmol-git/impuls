import { Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { paginated, resolvePage } from '../common/pagination'
import { PrismaService } from '../prisma/prisma.service'
import { CreateLeadDto } from './dto/create-lead.dto'
import { ListLeadsQueryDto } from './dto/list-leads-query.dto'
import { UpdateLeadDto } from './dto/update-lead.dto'

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateLeadDto) {
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
        phone: dto.phone.trim(),
        age: dto.age,
        message: dto.message,
        source: dto.source,
        location: dto.location,
        program: dto.program,
        variant: dto.variant,
        guestToken: dto.guestToken,
        ...(items ? { items } : {}),
      },
    })
  }

  async list(query: ListLeadsQueryDto) {
    const { page, limit, skip } = resolvePage(query.page, query.limit)
    const sort = query.sort ?? 'createdAt'
    const order = query.order ?? 'desc'
    const where: Prisma.LeadWhereInput = {}

    if (query.status) where.status = query.status

    const q = query.q?.trim()
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
        { source: { contains: q, mode: 'insensitive' } },
        { program: { contains: q, mode: 'insensitive' } },
        { message: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.lead.count({ where }),
      this.prisma.lead.findMany({
        where,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
    ])

    return paginated(items, page, limit, total, { sort, order })
  }

  findOne(id: string) {
    return this.ensureExists(id)
  }

  async update(id: string, dto: UpdateLeadDto) {
    await this.ensureExists(id)
    return this.prisma.lead.update({
      where: { id },
      data: dto,
    })
  }

  async remove(id: string) {
    await this.ensureExists(id)
    await this.prisma.lead.delete({ where: { id } })
    return { ok: true }
  }

  private async ensureExists(id: string) {
    const existing = await this.prisma.lead.findUnique({ where: { id } })
    if (!existing) {
      throw new NotFoundException('Заявка не найдена')
    }
    return existing
  }
}
