import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { MediaType, Prisma } from '@prisma/client'
import { paginated, resolvePage } from '../common/pagination'
import { PrismaService } from '../prisma/prisma.service'
import { SettingsService } from '../settings/settings.service'
import { CreateMediaDto } from './dto/create-media.dto'
import type { ListMediaQueryDto, MediaSortField } from './dto/list-media-query.dto'
import { UpdateMediaDto } from './dto/update-media.dto'
import { MediaCatalogService } from './media-catalog.service'
import {
  calcSalePrice,
  MEDIA_LIST_SELECT,
  normalizeImageUrls,
  normalizeSku,
} from './media.shared'
import { slugify } from './slugify'

@Injectable()
export class MediaAdminService implements OnModuleInit {
  private readonly logger = new Logger(MediaAdminService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly catalog: MediaCatalogService,
  ) {}

  async onModuleInit() {
    try {
      await this.backfillMissingNewsSlugs()
    } catch (error) {
      this.logger.warn(`Не удалось проставить slug новостям: ${String(error)}`)
    }
  }

  async listAdminPaged(query: ListMediaQueryDto) {
    const { page, limit, skip } = resolvePage(query.page, query.limit)
    const sort: MediaSortField = query.sort ?? 'createdAt'
    const order = query.order ?? 'desc'
    const q = query.q?.trim()
    const where: Prisma.MediaItemWhereInput = {
      ...(query.type ? { type: query.type } : {}),
      ...(query.published !== undefined ? { published: query.published } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
              { category: { contains: q, mode: 'insensitive' } },
              { sku: { contains: q, mode: 'insensitive' } },
              { topic: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    }
    const orderBy: Prisma.MediaItemOrderByWithRelationInput[] =
      sort === 'sortOrder'
        ? [{ sortOrder: order }, { createdAt: 'desc' }]
        : [{ [sort]: order }, { sortOrder: 'asc' }]

    const [total, items] = await this.prisma.$transaction([
      this.prisma.mediaItem.count({ where }),
      this.prisma.mediaItem.findMany({
        where,
        select: MEDIA_LIST_SELECT,
        orderBy,
        skip,
        take: limit,
      }),
    ])

    return paginated(items, page, limit, total, { sort, order })
  }

  async findAdminById(id: string) {
    return this.ensureExists(id)
  }

  async create(dto: CreateMediaDto) {
    this.validateByType(dto.type, dto)

    const title =
      dto.type === MediaType.REVIEW
        ? (dto.title?.trim() || 'Отзыв')
        : dto.type === MediaType.GALLERY
          ? (dto.title?.trim() || 'Фото')
          : dto.title.trim()

    const slug =
      dto.type === MediaType.NEWS
        ? await this.uniqueSlug(dto.slug?.trim() || slugify(title))
        : null

    const sortOrder =
      dto.sortOrder ??
      ((
        await this.prisma.mediaItem.aggregate({
          where: { type: dto.type },
          _max: { sortOrder: true },
        })
      )._max.sortOrder ?? -1) + 1

    const images =
      dto.type === MediaType.CATALOG
        ? normalizeImageUrls(dto.imageUrl, dto.imageUrls)
        : { imageUrl: dto.imageUrl, imageUrls: dto.imageUrl ? [dto.imageUrl] : [] }

    const sku =
      dto.type === MediaType.CATALOG
        ? await this.resolveCreateSku(normalizeSku(dto.sku))
        : null

    const created = await this.prisma.mediaItem.create({
      data: {
        type: dto.type,
        title,
        imageUrl: images.imageUrl,
        imageUrls: images.imageUrls,
        body: dto.type === MediaType.NEWS ? dto.body ?? null : null,
        topic: dto.type === MediaType.NEWS ? dto.topic?.trim() || null : null,
        category: dto.type === MediaType.CATALOG ? dto.category?.trim() || null : null,
        sku,
        quantity: dto.type === MediaType.CATALOG ? dto.quantity ?? null : null,
        slug,
        description:
          dto.type === MediaType.CATALOG || dto.type === MediaType.NEWS
            ? dto.description ?? null
            : null,
        price: dto.type === MediaType.CATALOG ? dto.price ?? null : null,
        discount: dto.type === MediaType.CATALOG ? dto.discount ?? null : null,
        salePrice:
          dto.type === MediaType.CATALOG
            ? calcSalePrice(dto.price, dto.discount, dto.salePrice)
            : null,
        sortOrder,
        published: dto.published ?? true,
      },
    })

    if (created.type === MediaType.CATALOG) {
      this.catalog.invalidateFacets()
    }

    return created
  }

  async reorder(type: MediaType, ids: string[], offset = 0) {
    const existing = await this.prisma.mediaItem.findMany({
      where: { type, id: { in: ids } },
      select: { id: true },
    })
    if (existing.length !== ids.length) {
      throw new BadRequestException('Некорректный список для сортировки')
    }

    const start = Math.max(0, offset)
    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.mediaItem.update({
          where: { id },
          data: { sortOrder: start + index },
        }),
      ),
    )

    return { ok: true as const }
  }

  async update(id: string, dto: UpdateMediaDto) {
    const existing = await this.ensureExists(id)
    const type = dto.type ?? existing.type
    this.validateByType(type, { ...existing, ...dto }, true)

    const price = dto.price !== undefined ? dto.price : existing.price
    const discount = dto.discount !== undefined ? dto.discount : existing.discount
    const salePriceInput = dto.salePrice !== undefined ? dto.salePrice : existing.salePrice

    const slug =
      type === MediaType.NEWS && dto.slug
        ? await this.uniqueSlug(dto.slug, id)
        : dto.slug

    const images =
      dto.imageUrl !== undefined || dto.imageUrls !== undefined
        ? normalizeImageUrls(
            dto.imageUrl ?? existing.imageUrl,
            dto.imageUrls ?? existing.imageUrls,
          )
        : null

    const nextSku =
      type === MediaType.CATALOG
        ? dto.sku !== undefined
          ? normalizeSku(dto.sku)
          : existing.sku
        : null
    if (type === MediaType.CATALOG && dto.sku !== undefined) {
      await this.ensureSkuUnique(nextSku, id)
    }

    const updated = await this.prisma.mediaItem.update({
      where: { id },
      data: {
        type: dto.type,
        title: dto.title,
        imageUrl: images?.imageUrl,
        imageUrls: images?.imageUrls,
        body: dto.body,
        topic: dto.topic,
        category: dto.category,
        sku: type === MediaType.CATALOG ? nextSku : null,
        quantity:
          type === MediaType.CATALOG
            ? dto.quantity !== undefined
              ? dto.quantity
              : undefined
            : null,
        slug,
        description: dto.description,
        price: dto.price,
        discount: dto.discount,
        salePrice:
          type === MediaType.CATALOG
            ? calcSalePrice(price, discount, salePriceInput)
            : dto.salePrice,
        sortOrder: dto.sortOrder,
        published: dto.published,
      },
    })

    await this.settings.syncAfterMediaChange(updated.type)
    if (existing.type !== updated.type) {
      await this.settings.syncAfterMediaChange(existing.type)
    }

    if (existing.type === MediaType.CATALOG || updated.type === MediaType.CATALOG) {
      this.catalog.invalidateFacets()
    }

    return updated
  }

  async remove(id: string) {
    const existing = await this.ensureExists(id)
    const deleted = await this.prisma.mediaItem.delete({ where: { id } })
    await this.settings.syncAfterMediaChange(existing.type)
    if (existing.type === MediaType.CATALOG) {
      this.catalog.invalidateFacets()
    }
    return deleted
  }

  private async backfillMissingNewsSlugs() {
    const missing = await this.prisma.mediaItem.findMany({
      where: {
        type: MediaType.NEWS,
        OR: [{ slug: null }, { slug: '' }],
      },
      select: { id: true, title: true },
    })
    if (!missing.length) return

    for (const item of missing) {
      const slug = await this.uniqueSlug(slugify(item.title))
      await this.prisma.mediaItem.update({ where: { id: item.id }, data: { slug } })
    }
    this.logger.log(`Проставлены slug для ${missing.length} новостей`)
  }

  private async uniqueSlug(base: string, excludeId?: string) {
    let candidate = base || 'news'
    let attempt = 1
    while (true) {
      const found = await this.prisma.mediaItem.findFirst({
        where: {
          slug: candidate,
          ...(excludeId ? { NOT: { id: excludeId } } : {}),
        },
        select: { id: true },
      })
      if (!found) return candidate
      attempt += 1
      candidate = `${base}-${attempt}`
    }
  }

  private validateByType(
    type: MediaType,
    data: {
      title?: string
      body?: string | null
      topic?: string | null
      category?: string | null
      sku?: string | null
      description?: string | null
      price?: number | null
      imageUrl?: string
    },
    isUpdate = false,
  ) {
    if (type === MediaType.NEWS) {
      if (!isUpdate && !data.title?.trim()) {
        throw new BadRequestException('У новости нужен заголовок')
      }
      if (!isUpdate && !data.topic?.trim()) {
        throw new BadRequestException('У новости нужна тема')
      }
      if (!isUpdate && !data.body?.replace(/<[^>]+>/g, '').trim()) {
        throw new BadRequestException('У новости нужен текст')
      }
    }

    if (type === MediaType.CATALOG) {
      if (!isUpdate && !data.title?.trim()) {
        throw new BadRequestException('У товара нужен заголовок')
      }
      if (!isUpdate && !data.category?.trim()) {
        throw new BadRequestException('У товара нужна категория')
      }
      if (!isUpdate && data.price == null) {
        throw new BadRequestException('У товара нужна цена')
      }
    }

    if (!isUpdate && !data.imageUrl?.trim()) {
      throw new BadRequestException('Нужна картинка')
    }
  }

  private async resolveCreateSku(sku: string | null) {
    if (sku) {
      await this.ensureSkuUnique(sku)
      return sku
    }
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const candidate = this.generateSku()
      const found = await this.prisma.mediaItem.findFirst({
        where: { sku: candidate },
        select: { id: true },
      })
      if (!found) return candidate
    }
    throw new ConflictException('Не удалось сгенерировать уникальный артикул')
  }

  private generateSku() {
    const stamp = Date.now().toString(36).toUpperCase()
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
    return `IMP-${stamp}${rand}`.slice(0, 64)
  }

  private async ensureSkuUnique(sku: string | null, excludeId?: string) {
    if (!sku) {
      throw new BadRequestException('У товара нужен артикул')
    }
    const found = await this.prisma.mediaItem.findFirst({
      where: {
        sku,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    })
    if (found) {
      throw new ConflictException('Товар с таким артикулом уже есть')
    }
  }

  private async ensureExists(id: string) {
    const item = await this.prisma.mediaItem.findUnique({ where: { id } })
    if (!item) {
      throw new NotFoundException('Медиа не найдено')
    }
    return item
  }
}
