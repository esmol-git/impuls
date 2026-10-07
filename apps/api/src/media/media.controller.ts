import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { CatalogQueryDto } from './dto/catalog-query.dto'
import { PublicMediaQueryDto } from './dto/public-media-query.dto'
import { MediaService } from './media.service'

/** Публичные GET для SSR Nuxt — без rate limit (один IP сервера на всех) */
@Controller('media')
@SkipThrottle({ default: true, auth: true, leads: true })
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Get()
  list(@Query() query: PublicMediaQueryDto) {
    return this.media.listPublic(query.type, query.limit ?? 100)
  }

  @Get('catalog')
  listCatalog(@Query() query: CatalogQueryDto) {
    return this.media.listCatalogPublic(query)
  }

  @Get('news/:slug')
  async newsBySlug(@Param('slug') slug: string) {
    const item = await this.media.findPublicBySlug(slug)
    if (!item) {
      throw new NotFoundException('Новость не найдена')
    }
    return item
  }
}
