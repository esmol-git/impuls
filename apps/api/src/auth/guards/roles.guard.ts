import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role } from '@prisma/client'
import { ROLES_KEY } from '../decorators/roles.decorator'
import type { AuthUser } from '../types'

const ROLE_RANK: Record<Role, number> = {
  [Role.MANAGER]: 1,
  [Role.ADMIN]: 2,
  [Role.SUPERADMIN]: 3,
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!roles?.length) return true

    const request = context.switchToHttp().getRequest<{ user?: AuthUser }>()
    const user = request.user
    if (!user) {
      throw new ForbiddenException('Недостаточно прав')
    }

    const userRank = ROLE_RANK[user.role] ?? 0
    const allowed = roles.some((required) => userRank >= (ROLE_RANK[required] ?? 0))
    if (!allowed) {
      throw new ForbiddenException('Недостаточно прав')
    }
    return true
  }
}
