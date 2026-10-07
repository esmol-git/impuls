import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { MediaType, TaxonomyKind } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaxonomyDto } from './dto/create-taxonomy.dto'
import { UpdateTaxonomyDto } from './dto/update-taxonomy.dto'

@Injectable()
export class TaxonomyService {
  constructor(private readonly prisma: PrismaService) {}

  list(kind?: TaxonomyKind) {
    return this.prisma.taxonomy.findMany({
      where: kind ? { kind } : undefined,
      orderBy: [{ kind: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    })
  }

  async create(dto: CreateTaxonomyDto) {
    const name = dto.name.trim()
    if (!name) {
      throw new BadRequestException('Укажите название')
    }

    const sortOrder =
      dto.sortOrder ??
      ((
        await this.prisma.taxonomy.aggregate({
          where: { kind: dto.kind },
          _max: { sortOrder: true },
        })
      )._max.sortOrder ?? -1) + 1

    try {
      return await this.prisma.taxonomy.create({
        data: { kind: dto.kind, name, sortOrder },
      })
    } catch {
      throw new ConflictException('Такое значение уже есть')
    }
  }

  async update(id: string, dto: UpdateTaxonomyDto) {
    const existing = await this.ensureExists(id)
    const name = dto.name?.trim()

    if (name && name !== existing.name) {
      await this.renameUsage(existing.kind, existing.name, name)
    }

    try {
      return await this.prisma.taxonomy.update({
        where: { id },
        data: {
          name: name || undefined,
          sortOrder: dto.sortOrder,
        },
      })
    } catch {
      throw new ConflictException('Такое значение уже есть')
    }
  }

  async remove(id: string) {
    const existing = await this.ensureExists(id)
    const inUse = await this.countUsage(existing.kind, existing.name)
    if (inUse > 0) {
      throw new BadRequestException(
        `Нельзя удалить: используется в ${inUse} элемент(ах). Сначала смените значение у записей.`,
      )
    }
    return this.prisma.taxonomy.delete({ where: { id } })
  }

  private async renameUsage(kind: TaxonomyKind, from: string, to: string) {
    if (kind === TaxonomyKind.NEWS_TOPIC) {
      await this.prisma.mediaItem.updateMany({
        where: { type: MediaType.NEWS, topic: from },
        data: { topic: to },
      })
      return
    }
    if (kind === TaxonomyKind.CATALOG_CATEGORY) {
      await this.prisma.mediaItem.updateMany({
        where: { type: MediaType.CATALOG, category: from },
        data: { category: to },
      })
      return
    }

    const coaches = await this.prisma.coach.findMany({
      where: { specialties: { has: from } },
      select: { id: true, specialties: true },
    })
    await this.prisma.$transaction(
      coaches.map((coach) =>
        this.prisma.coach.update({
          where: { id: coach.id },
          data: {
            specialties: coach.specialties.map((item) => (item === from ? to : item)),
          },
        }),
      ),
    )
  }

  private countUsage(kind: TaxonomyKind, name: string) {
    if (kind === TaxonomyKind.NEWS_TOPIC) {
      return this.prisma.mediaItem.count({
        where: { type: MediaType.NEWS, topic: name },
      })
    }
    if (kind === TaxonomyKind.CATALOG_CATEGORY) {
      return this.prisma.mediaItem.count({
        where: { type: MediaType.CATALOG, category: name },
      })
    }
    return this.prisma.coach.count({
      where: { specialties: { has: name } },
    })
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.taxonomy.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException('Значение не найдено')
    }
    return item
  }
}
