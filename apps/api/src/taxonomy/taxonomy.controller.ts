import { Controller, Get, Query } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { ListTaxonomyQueryDto } from './dto/list-taxonomy-query.dto'
import { TaxonomyService } from './taxonomy.service'

@Controller('taxonomies')
@SkipThrottle({ default: true, auth: true, leads: true })
export class TaxonomyController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  @Get()
  list(@Query() query: ListTaxonomyQueryDto) {
    return this.taxonomy.list(query.kind)
  }
}
