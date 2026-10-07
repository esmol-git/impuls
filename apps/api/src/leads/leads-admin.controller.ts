import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common'
import { Role } from '@prisma/client'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { ListLeadsQueryDto } from './dto/list-leads-query.dto'
import { UpdateLeadDto } from './dto/update-lead.dto'
import { LeadsService } from './leads.service'

@Controller('admin/leads')
@UseGuards(JwtAuthGuard)
export class LeadsAdminController {
  constructor(private readonly leads: LeadsService) {}

  @Get()
  list(@Query() query: ListLeadsQueryDto) {
    return this.leads.list(query)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leads.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLeadDto) {
    return this.leads.update(id, dto)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.leads.remove(id)
  }
}
