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
import { CoachesService } from './coaches.service'
import { CreateCoachDto } from './dto/create-coach.dto'
import { ListCoachesQueryDto } from './dto/list-coaches-query.dto'
import { ReorderCoachesDto } from './dto/reorder-coaches.dto'
import { UpdateCoachDto } from './dto/update-coach.dto'

@Controller('admin/coaches')
@UseGuards(JwtAuthGuard)
@SkipThrottle(SKIP_ALL_THROTTLES)
export class CoachesAdminController {
  constructor(private readonly coaches: CoachesService) {}

  @Get()
  list(@Query() query: ListCoachesQueryDto) {
    return this.coaches.listAdminPaged(query)
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.coaches.findAdminById(id)
  }

  @Post()
  create(@Body() dto: CreateCoachDto) {
    return this.coaches.create(dto)
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderCoachesDto) {
    return this.coaches.reorder(dto.ids)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCoachDto) {
    return this.coaches.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coaches.remove(id)
  }
}
