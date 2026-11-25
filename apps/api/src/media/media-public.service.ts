import { Injectable } from '@nestjs/common'
import { MediaType, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { MEDIA_LIST_SELECT } from './media.shared'

@Injectable()
export class MediaPublicService {
  constructor(private readonly prisma: PrismaService) {}

  async listPublic(type?: MediaType, limit = 100) {
    const max = type === MediaType.GALLERY ? 300 : 100
    const take = Math.min(max, Math.max(1, limit ?? max))
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

  findPublicBySlug(slug: string) {
    return this.prisma.mediaItem.findFirst({
      where: {
        type: MediaType.NEWS,
        published: true,
        OR: [{ slug }, { id: slug }],
      },
    })
  }
}
