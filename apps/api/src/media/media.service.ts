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
import { CatalogQueryDto } from './dto/catalog-query.dto'
import { CreateMediaDto } from './dto/create-media.dto'
import type { ListMediaQueryDto, MediaSortField } from './dto/list-media-query.dto'
import { UpdateMediaDto } from './dto/update-media.dto'
import { slugify } from './slugify'

const CATALOG_PAGE_SIZE = 9

/** Поля для публичных/админ-списков без тяжёлого HTML body */
const MEDIA_LIST_SELECT = {
  id: true,
  type: true,
  title: true,
  imageUrl: true,
  imageUrls: true,
  topic: true,
  category: true,
  sku: true,
  quantity: true,
  slug: true,
  description: true,
  price: true,
  discount: true,
  salePrice: true,
  sortOrder: true,
  published: true,
  createdAt: true,
  updatedAt: true,
} as const

type CatalogRow = {
  id: string
  type: MediaType
  title: string
  imageUrl: string
  imageUrls: string[]
  topic: string | null
  category: string | null
  sku: string | null
  quantity: number | null
  slug: string | null
  description: string | null
  price: number | null
  discount: number | null
  salePrice: number | null
  sortOrder: number
  published: boolean
  createdAt: Date
  updatedAt: Date
}

function normalizeSku(value?: string | null) {
  const sku = value?.trim()
  return sku ? sku : null
}

function calcSalePrice(price?: number | null, discount?: number | null, salePrice?: number | null) {
  if (salePrice != null) return salePrice
  if (price == null || discount == null || discount <= 0) return null
  return Math.round((price * (100 - discount)) / 100)
}

function normalizeImageUrls(imageUrl?: string | null, imageUrls?: string[] | null) {
  const list = (imageUrls || [])
    .map((url) => url.trim())
    .filter(Boolean)
  const cover = imageUrl?.trim()
  if (cover && !list.includes(cover)) {
    list.unshift(cover)
  }
  return {
    imageUrl: list[0] || cover || '',
    imageUrls: list,
  }
}

@Injectable()
export class MediaService implements OnModuleInit {
  private readonly logger = new Logger(MediaService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  async onModuleInit() {
    try {
      await this.backfillMissingNewsSlugs()
    } catch (error) {
      this.logger.warn(`Не удалось проставить slug новостям: ${String(error)}`)
    }
  }

  async listPublic(type?: MediaType, limit = 100) {
    const take = Math.min(100, Math.max(1, limit))
    const where: Prisma.MediaItemWhereInput = {
      published: true,
      ...(type ? { type } : {}),
    }
    return this.prisma.mediaItem.findMany({
      where,
      select: MEDIA_LIST_SELECT,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take,
    })
  }

  async listCatalogPublic(query: CatalogQueryDto) {
    const { page, limit, skip } = resolvePage(query.page, query.limit, {
      defaultLimit: CATALOG_PAGE_SIZE,
      maxLimit: 48,
    })
    const categories = (query.categories || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
    const q = query.q?.trim() || ''
    const sort = query.sort || 'default'

    const conditions: Prisma.Sql[] = [
      Prisma.sql`type = CAST('CATALOG' AS "MediaType")`,
      Prisma.sql`published = true`,
      Prisma.sql`COALESCE("salePrice", price) IS NOT NULL`,
    ]

    if (categories.length) {
      conditions.push(Prisma.sql`category IN (${Prisma.join(categories)})`)
    }

    if (q) {
      const like = `%${q}%`
      conditions.push(
        Prisma.sql`(
          title ILIKE ${like}
          OR COALESCE(description, '') ILIKE ${like}
          OR COALESCE(category, '') ILIKE ${like}
        )`,
      )
    }

    if (query.onlySale) {
      conditions.push(
        Prisma.sql`
          discount IS NOT NULL
          AND discount > 0
          AND "salePrice" IS NOT NULL
          AND price IS NOT NULL
          AND "salePrice" < price
        `,
      )
    }

    if (query.priceMin != null || query.priceMax != null) {
      const min = query.priceMin ?? 0
      const max = query.priceMax ?? 2_147_483_647
      conditions.push(
        Prisma.sql`COALESCE("salePrice", price) BETWEEN ${min} AND ${max}`,
      )
    }

    const whereClause = Prisma.join(conditions, ' AND ')

    let orderClause: Prisma.Sql
    switch (sort) {
      case 'price-asc':
        orderClause = Prisma.sql`COALESCE("salePrice", price) ASC NULLS LAST, "sortOrder" ASC`
        break
      case 'price-desc':
        orderClause = Prisma.sql`COALESCE("salePrice", price) DESC NULLS LAST, "sortOrder" ASC`
        break
      case 'title':
        orderClause = Prisma.sql`title ASC`
        break
      default:
        orderClause = Prisma.sql`"sortOrder" ASC, "createdAt" DESC`
    }

    const [countRow] = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*)::bigint AS count
      FROM "MediaItem"
      WHERE ${whereClause}
    `
    const total = Number(countRow?.count ?? 0)

    const items = await this.prisma.$queryRaw<CatalogRow[]>`
      SELECT
        id, type, title, "imageUrl", "imageUrls", topic, category, sku, quantity, slug,
        description, price, discount, "salePrice", "sortOrder", published,
        "createdAt", "updatedAt"
      FROM "MediaItem"
      WHERE ${whereClause}
      ORDER BY ${orderClause}
      LIMIT ${limit}
      OFFSET ${skip}
    `

    const facets = await this.catalogFacets()

    return {
      ...paginated(items, page, limit, total),
      facets,
    }
  }

  private facetsCache:
    | {
        expiresAt: number
        value: {
          totalAll: number
          priceMin: number
          priceMax: number
          categories: { name: string; count: number }[]
          saleCount: number
        }
      }
    | null = null

  private async catalogFacets() {
    const now = Date.now()
    if (this.facetsCache && this.facetsCache.expiresAt > now) {
      return this.facetsCache.value
    }

    const baseWhere: Prisma.MediaItemWhereInput = {
      type: MediaType.CATALOG,
      published: true,
    }

    const [totalAll, priceRow, categoryRows, saleRow] = await Promise.all([
      this.prisma.mediaItem.count({ where: baseWhere }),
      this.prisma.$queryRaw<[{ min: number | null; max: number | null }]>`
        SELECT
          MIN(COALESCE("salePrice", price))::int AS min,
          MAX(COALESCE("salePrice", price))::int AS max
        FROM "MediaItem"
        WHERE type = CAST('CATALOG' AS "MediaType")
          AND published = true
          AND COALESCE("salePrice", price) IS NOT NULL
      `,
      this.prisma.mediaItem.groupBy({
        by: ['category'],
        where: {
          ...baseWhere,
          category: { not: null },
        },
        _count: { _all: true },
        orderBy: { category: 'asc' },
      }),
      this.prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*)::bigint AS count
        FROM "MediaItem"
        WHERE type = CAST('CATALOG' AS "MediaType")
          AND published = true
          AND discount IS NOT NULL
          AND discount > 0
          AND "salePrice" IS NOT NULL
          AND price IS NOT NULL
          AND "salePrice" < price
      `,
    ])

    const value = {
      totalAll,
      priceMin: priceRow[0]?.min ?? 0,
      priceMax: priceRow[0]?.max ?? 0,
      categories: categoryRows
        .filter((row) => row.category)
        .map((row) => ({
          name: row.category as string,
          count: row._count._all,
        })),
      saleCount: Number(saleRow[0]?.count ?? 0),
    }

    this.facetsCache = { expiresAt: now + 30_000, value }
    return value
  }

  private invalidateCatalogFacets() {
    this.facetsCache = null
  }

  /** Полный список одного типа (reorder отзывов) */
  listAdmin(type?: MediaType) {
    return this.prisma.mediaItem.findMany({
      where: type ? { type } : undefined,
      select: MEDIA_LIST_SELECT,
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
  }

  async listAdminPaged(query: ListMediaQueryDto) {
    const { page, limit, skip } = resolvePage(query.page, query.limit)
    const sort: MediaSortField = query.sort ?? 'createdAt'
    const order = query.order ?? 'desc'
    const where = query.type ? { type: query.type } : undefined
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

  findPublicBySlug(slug: string) {
    return this.prisma.mediaItem.findFirst({
      where: {
        type: MediaType.NEWS,
        published: true,
        OR: [{ slug }, { id: slug }],
      },
    })
  }

  async findAdminById(id: string) {
    return this.ensureExists(id)
  }

  /** Одноразовый backfill при старте — list-эндпоинты не пишут в БД */
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

  async create(dto: CreateMediaDto) {
    this.validateByType(dto.type, dto)

    const title =
      dto.type === MediaType.REVIEW
        ? (dto.title?.trim() || 'Отзыв')
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
      this.invalidateCatalogFacets()
    }

    return created
  }

  async reorder(type: MediaType, ids: string[]) {
    const existing = await this.prisma.mediaItem.findMany({
      where: { type, id: { in: ids } },
      select: { id: true },
    })
    if (existing.length !== ids.length) {
      throw new BadRequestException('Некорректный список для сортировки')
    }

    await this.prisma.$transaction(
      ids.map((id, index) =>
        this.prisma.mediaItem.update({
          where: { id },
          data: { sortOrder: index },
        }),
      ),
    )

    return this.listAdmin(type)
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
      this.invalidateCatalogFacets()
    }

    return updated
  }

  async remove(id: string) {
    const existing = await this.ensureExists(id)
    const deleted = await this.prisma.mediaItem.delete({ where: { id } })
    await this.settings.syncAfterMediaChange(existing.type)
    if (existing.type === MediaType.CATALOG) {
      this.invalidateCatalogFacets()
    }
    return deleted
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
