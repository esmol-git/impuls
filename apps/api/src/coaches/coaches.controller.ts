import { Controller, Get, Query } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'
import { CoachesService } from './coaches.service'

class PublicCoachesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number
}

@Controller('coaches')
@SkipThrottle({ default: true, auth: true, leads: true })
export class CoachesController {
  constructor(private readonly coaches: CoachesService) {}

  @Get()
  list(@Query() query: PublicCoachesQueryDto) {
    return this.coaches.listPublic(query.limit ?? 100)
  }
}
