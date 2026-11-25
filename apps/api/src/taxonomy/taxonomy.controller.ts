import { Controller, Get, Query } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { SKIP_ALL_THROTTLES } from '../common/throttle'
import { ListTaxonomyQueryDto } from './dto/list-taxonomy-query.dto'
import { TaxonomyService } from './taxonomy.service'

@Controller('taxonomies')
@SkipThrottle(SKIP_ALL_THROTTLES)
export class TaxonomyController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  @Get()
  list(@Query() query: ListTaxonomyQueryDto) {
    return this.taxonomy.list(query.kind)
  }
}
