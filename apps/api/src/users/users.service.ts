import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Gender, Role } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import type { AuthUser } from '../auth/types'
import { paginated, resolvePage } from '../common/pagination'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { ListUsersQueryDto } from './dto/list-users-query.dto'
import { UpdateUserDto } from './dto/update-user.dto'

const userSelect = {
  id: true,
  email: true,
  role: true,
  firstName: true,
  lastName: true,
  gender: true,
  birthDate: true,
  createdAt: true,
  updatedAt: true,
} as const

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListUsersQueryDto = {}) {
    const { page, limit, skip } = resolvePage(query.page, query.limit)
    const sort = query.sort ?? 'createdAt'
    const order = query.order ?? 'desc'

    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.findMany({
        select: userSelect,
        orderBy: { [sort]: order },
        skip,
        take: limit,
      }),
    ])

    return paginated(items, page, limit, total, { sort, order })
  }

  async create(dto: CreateUserDto, actor: AuthUser) {
    const role = dto.role ?? Role.MANAGER
    this.assertCanAssignRole(actor, role)
    await this.assertUniqueSuperadmin(role)

    const email = dto.email.trim().toLowerCase()
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже есть')
    }

    const passwordHash = await bcrypt.hash(dto.password, 10)
    return this.prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        firstName: dto.firstName?.trim() || null,
        lastName: dto.lastName?.trim() || null,
        gender: dto.gender ?? null,
        birthDate: dto.birthDate ?? null,
      },
      select: userSelect,
    })
  }

  async update(id: string, dto: UpdateUserDto, actor: AuthUser) {
    const existing = await this.ensureExists(id)
    this.assertCanManageTarget(actor, existing.role)

    if (dto.role != null && dto.role !== existing.role) {
      if (existing.role === Role.SUPERADMIN) {
        throw new ForbiddenException('Роль суперадмина нельзя изменить')
      }
      this.assertCanAssignRole(actor, dto.role)
      await this.assertUniqueSuperadmin(dto.role, id)
    }

    if (dto.email) {
      const email = dto.email.trim().toLowerCase()
      const clash = await this.prisma.user.findFirst({
        where: { email, NOT: { id } },
      })
      if (clash) {
        throw new ConflictException('Пользователь с таким email уже есть')
      }
    }

    const data: {
      email?: string
      role?: Role
      passwordHash?: string
      firstName?: string | null
      lastName?: string | null
      gender?: Gender | null
      birthDate?: Date | null
    } = {}

    if (dto.email) data.email = dto.email.trim().toLowerCase()
    if (dto.role) data.role = dto.role
    if (dto.password) data.passwordHash = await bcrypt.hash(dto.password, 10)
    if (dto.firstName !== undefined) data.firstName = dto.firstName?.trim() || null
    if (dto.lastName !== undefined) data.lastName = dto.lastName?.trim() || null
    if (dto.gender !== undefined) data.gender = dto.gender
    if (dto.birthDate !== undefined) data.birthDate = dto.birthDate

    const updated = await this.prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    })

    const shouldRevoke =
      Boolean(dto.password) ||
      (dto.role != null && dto.role !== existing.role) ||
      (dto.email != null && dto.email.trim().toLowerCase() !== existing.email)

    if (shouldRevoke) {
      await this.revokeSessions(id)
    }

    return updated
  }

  async remove(id: string, actor: AuthUser) {
    if (id === actor.id) {
      throw new BadRequestException('Нельзя удалить свой аккаунт')
    }
    const existing = await this.ensureExists(id)
    this.assertCanManageTarget(actor, existing.role)
    if (existing.role === Role.SUPERADMIN) {
      await this.ensureNotLastSuperadmin(id)
    }
    await this.revokeSessions(id)
    await this.prisma.user.delete({ where: { id } })
    return { ok: true }
  }

  private assertCanAssignRole(actor: AuthUser, role: Role) {
    if (role === Role.SUPERADMIN && actor.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('Назначать суперадмина может только суперадмин')
    }
  }

  /** В системе допускается только один SUPERADMIN */
  private async assertUniqueSuperadmin(role: Role, excludeId?: string) {
    if (role !== Role.SUPERADMIN) return
    const count = await this.prisma.user.count({
      where: {
        role: Role.SUPERADMIN,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    })
    if (count > 0) {
      throw new BadRequestException('В системе может быть только один суперадмин')
    }
  }

  private assertCanManageTarget(actor: AuthUser, targetRole: Role) {
    if (targetRole === Role.SUPERADMIN && actor.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('Нельзя изменять суперадмина')
    }
  }

  private async ensureNotLastSuperadmin(excludeId: string) {
    const count = await this.prisma.user.count({
      where: { role: Role.SUPERADMIN, NOT: { id: excludeId } },
    })
    if (count === 0) {
      throw new BadRequestException('Нельзя убрать последнего суперадмина')
    }
  }

  private async revokeSessions(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } })
  }

  private async ensureExists(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) {
      throw new NotFoundException('Пользователь не найден')
    }
    return user
  }
}
