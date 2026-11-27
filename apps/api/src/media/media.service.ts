import { Injectable } from '@nestjs/common'
import { MediaType } from '@prisma/client'
import { CatalogQueryDto } from './dto/catalog-query.dto'
import { CreateMediaDto } from './dto/create-media.dto'
import type { ListMediaQueryDto } from './dto/list-media-query.dto'
import type { NewsQueryDto } from './dto/news-query.dto'
import { UpdateMediaDto } from './dto/update-media.dto'
import { MediaAdminService } from './media-admin.service'
import { MediaCatalogService } from './media-catalog.service'
import { MediaPublicService } from './media-public.service'

/**
 * Facade over public / catalog / admin media services.
 * Controllers may inject this or a specific service.
 */
@Injectable()
export class MediaService {
  constructor(
    private readonly publicMedia: MediaPublicService,
    private readonly catalog: MediaCatalogService,
    private readonly admin: MediaAdminService,
  ) {}

  listPublic(type?: MediaType, limit = 100) {
    return this.publicMedia.listPublic(type, limit)
  }

  listCatalogPublic(query: CatalogQueryDto) {
    return this.catalog.listCatalogPublic(query)
  }

  listNewsPublic(query: NewsQueryDto) {
    return this.publicMedia.listNewsPublic(query)
  }

  findPublicBySlug(slug: string) {
    return this.publicMedia.findPublicBySlug(slug)
  }

  listAdminPaged(query: ListMediaQueryDto) {
    return this.admin.listAdminPaged(query)
  }

  findAdminById(id: string) {
    return this.admin.findAdminById(id)
  }

  create(dto: CreateMediaDto) {
    return this.admin.create(dto)
  }

  reorder(type: MediaType, ids: string[], offset = 0) {
    return this.admin.reorder(type, ids, offset)
  }

  update(id: string, dto: UpdateMediaDto) {
    return this.admin.update(id, dto)
  }

  remove(id: string) {
    return this.admin.remove(id)
  }
}
