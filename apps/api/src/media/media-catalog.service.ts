import { Injectable } from '@nestjs/common'
import { MediaType, Prisma } from '@prisma/client'
import { paginated, resolvePage } from '../common/pagination'
import { PrismaService } from '../prisma/prisma.service'
import { CatalogQueryDto } from './dto/catalog-query.dto'
import { CATALOG_PAGE_SIZE, type CatalogRow } from './media.shared'

@Injectable()
export class MediaCatalogService {
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

  constructor(private readonly prisma: PrismaService) {}

  invalidateFacets() {
    this.facetsCache = null
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
}
