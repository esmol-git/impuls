import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { paginated, resolvePage } from '../common/pagination'
import { PrismaService } from '../prisma/prisma.service'
import { SettingsService } from '../settings/settings.service'
import { CreateCoachDto } from './dto/create-coach.dto'
import { ListCoachesQueryDto } from './dto/list-coaches-query.dto'
import { UpdateCoachDto } from './dto/update-coach.dto'

@Injectable()
export class CoachesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  listPublic(limit = 100) {
    return this.prisma.coach.findMany({
      where: { published: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      take: Math.min(100, Math.max(1, limit)),
    })
  }

  async findPublicById(id: string) {
    const item = await this.prisma.coach.findFirst({
      where: { id, published: true },
    })
    if (!item) {
      throw new NotFoundException('Тренер не найден')
    }
    return item
  }

  async listAdminPaged(query: ListCoachesQueryDto) {
    const { page, limit, skip } = resolvePage(query.page, query.limit)
    const sort = query.sort ?? 'sortOrder'
    const order = query.order ?? (sort === 'sortOrder' ? 'asc' : 'desc')
    const orderBy: Prisma.CoachOrderByWithRelationInput = { [sort]: order }
    const q = query.q?.trim()
    const where: Prisma.CoachWhereInput = {
      ...(query.published !== undefined ? { published: query.published } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { role: { contains: q, mode: 'insensitive' } },
              { experience: { contains: q, mode: 'insensitive' } },
              { bio: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    }

    const [total, items] = await this.prisma.$transaction([
      this.prisma.coach.count({ where }),
      this.prisma.coach.findMany({
        where,
        orderBy: [orderBy, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
    ])

    return paginated(items, page, limit, total, { sort, order })
  }

  async findAdminById(id: string) {
    return this.ensureExists(id)
  }

  async create(dto: CreateCoachDto) {
    const sortOrder =
      dto.sortOrder ??
      ((await this.prisma.coach.aggregate({ _max: { sortOrder: true } }))._max.sortOrder ?? -1) + 1

    const created = await this.prisma.coach.create({
      data: {
        name: dto.name.trim(),
        role: (dto.role ?? '').trim(),
        experience: (dto.experience ?? '').trim(),
        bio: (dto.bio ?? '').trim(),
        specialties: normalizeSpecialties(dto.specialties),
        imageUrl: emptyToNull(dto.imageUrl),
        imageAlt: emptyToNull(dto.imageAlt),
        sortOrder,
        published: dto.published ?? true,
      },
    })
    await this.settings.syncAfterCoachChange()
    return created
  }

  async update(id: string, dto: UpdateCoachDto) {
    await this.ensureExists(id)

    const updated = await this.prisma.coach.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        role: dto.role !== undefined ? dto.role.trim() : undefined,
        experience: dto.experience !== undefined ? dto.experience.trim() : undefined,
        bio: dto.bio !== undefined ? dto.bio.trim() : undefined,
        specialties: dto.specialties !== undefined ? normalizeSpecialties(dto.specialties) : undefined,
        imageUrl: dto.imageUrl !== undefined ? emptyToNull(dto.imageUrl) : undefined,
        imageAlt: dto.imageAlt !== undefined ? emptyToNull(dto.imageAlt) : undefined,
        sortOrder: dto.sortOrder,
        published: dto.published,
      },
    })
    await this.settings.syncAfterCoachChange()
    return updated
  }

  async reorder(ids: string[], offset = 0) {
    const existing = await this.prisma.coach.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    })
    if (existing.length !== ids.length) {
      throw new BadRequestException('Некорректный список для сортировки')
    }

    const start = Math.max(0, offset)
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.coach.update({
          where: { id },
          data: { sortOrder: start + index },
        }),
      ),
    )
    return { ok: true as const }
  }

  async remove(id: string) {
    await this.ensureExists(id)
    const deleted = await this.prisma.coach.delete({ where: { id } })
    await this.settings.syncAfterCoachChange()
    return deleted
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.coach.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException('Тренер не найден')
    }
    return item
  }
}

function normalizeSpecialties(values?: string[]) {
  if (!values?.length) return []
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of values) {
    const value = raw.trim()
    if (!value || seen.has(value)) continue
    seen.add(value)
    out.push(value)
  }
  return out
}

function emptyToNull(value?: string | null) {
  if (value == null) return null
  const trimmed = value.trim()
  return trimmed || null
}
