import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SKIP_ALL_THROTTLES } from '../common/throttle'
import { CreateTaxonomyDto } from './dto/create-taxonomy.dto'
import { ListTaxonomyQueryDto } from './dto/list-taxonomy-query.dto'
import { UpdateTaxonomyDto } from './dto/update-taxonomy.dto'
import { TaxonomyService } from './taxonomy.service'

@Controller('admin/taxonomies')
@UseGuards(JwtAuthGuard)
@SkipThrottle(SKIP_ALL_THROTTLES)
export class TaxonomyAdminController {
  constructor(private readonly taxonomy: TaxonomyService) {}

  @Get()
  list(@Query() query: ListTaxonomyQueryDto) {
    return this.taxonomy.list(query.kind)
  }

  @Post()
  create(@Body() dto: CreateTaxonomyDto) {
    return this.taxonomy.create(dto)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaxonomyDto) {
    return this.taxonomy.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taxonomy.remove(id)
  }
}
