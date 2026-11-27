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
import { Role } from '@prisma/client'
import { SkipThrottle } from '@nestjs/throttler'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import type { AuthUser } from '../auth/types'
import { SKIP_ALL_THROTTLES } from '../common/throttle'
import { CreateLeadActivityDto } from './dto/create-lead-activity.dto'
import { ListLeadsQueryDto } from './dto/list-leads-query.dto'
import { UpdateLeadDto } from './dto/update-lead.dto'
import { LeadsService } from './leads.service'

@Controller('admin/leads')
@UseGuards(JwtAuthGuard)
@SkipThrottle(SKIP_ALL_THROTTLES)
export class LeadsAdminController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  list(@Query() query: ListLeadsQueryDto, @CurrentUser() user: AuthUser) {
    return this.leads.list(query, user)
  }

  @Get('assignees')
  listAssignees() {
    return this.leads.listAssignees()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leads.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLeadDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.leads.update(id, dto, user)
  }

  @Post(':id/activities')
  addActivity(
    @Param('id') id: string,
    @Body() dto: CreateLeadActivityDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.leads.addActivity(id, dto, user)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.leads.remove(id)
  }
}
