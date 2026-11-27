import { Injectable } from '@nestjs/common'
import { MediaType } from '@prisma/client'
import { paginated, resolvePage } from '../common/pagination'
import { PrismaService } from '../prisma/prisma.service'
import type { NewsQueryDto } from './dto/news-query.dto'
import { newsVisibleWhere, publishedVisibleWhere } from './media-visibility'
import { MEDIA_LIST_SELECT, NEWS_PAGE_SIZE } from './media.shared'

@Injectable()
export class MediaPublicService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(type?: MediaType, limit = 100) {
    const max = type === MediaType.GALLERY ? 300 : 100
    const take = Math.min(max, Math.max(1, limit ?? max))
    const where = publishedVisibleWhere(type)
    const orderBy =
      type === MediaType.NEWS
        ? ([{ publishAt: 'desc' }, { createdAt: 'desc' }, { sortOrder: 'asc' }] as const)
        : ([{ sortOrder: 'asc' }, { createdAt: 'desc' }] as const)
    return this.prisma.mediaItem.findMany({
      where,
      select: MEDIA_LIST_SELECT,
      orderBy: [...orderBy],
      take,
    })
  }

  async listNewsPublic(query: NewsQueryDto) {
    const { page, limit, skip } = resolvePage(query.page, query.limit, {
      defaultLimit: NEWS_PAGE_SIZE,
      maxLimit: 48,
    })
    const topic = query.topic?.trim()
    const where = {
      ...newsVisibleWhere(),
      ...(topic ? { topic } : {}),
    }

    const [total, items] = await Promise.all([
      this.prisma.mediaItem.count({ where }),
      this.prisma.mediaItem.findMany({
        where,
        select: MEDIA_LIST_SELECT,
        orderBy: [{ publishAt: 'desc' }, { createdAt: 'desc' }, { sortOrder: 'asc' }],
        skip,
        take: limit,
      }),
    ])

    return paginated(items, page, limit, total)
  }

  findPublicBySlug(slug: string) {
    return this.prisma.mediaItem.findFirst({
      where: {
        ...newsVisibleWhere(),
        OR: [{ slug }, { id: slug }],
      },
    })
  }
}
