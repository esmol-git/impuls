import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { AuditService } from './audit.service'
import { ListAuditQueryDto } from './dto/list-audit-query.dto'

@Controller('admin/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AuditAdminController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  list(@Query() query: ListAuditQueryDto) {
    return this.audit.list(query)
  }
}
