import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import { Role } from '@prisma/client'
import { SkipThrottle } from '@nestjs/throttler'
import { Roles } from '../auth/decorators/roles.decorator'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { SKIP_ALL_THROTTLES } from '../common/throttle'
import { AuditService } from './audit.service'
import { ListAuditQueryDto } from './dto/list-audit-query.dto'

@Controller('admin/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@SkipThrottle(SKIP_ALL_THROTTLES)
export class AuditAdminController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  list(@Query() query: ListAuditQueryDto) {
    return this.audit.list(query)
  }
}
