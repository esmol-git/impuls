import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { createHash, randomBytes } from 'crypto'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { LoginDto } from './dto/login.dto'
import type { AuthTokens } from './types'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<AuthTokens> {
    await this.purgeExpiredRefreshTokens()

    const user = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } })
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль')
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash)
    if (!ok) {
      throw new UnauthorizedException('Неверный email или пароль')
    }

    return this.issueTokens(user.id, user.email, user.role)
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(refreshToken)
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    })

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await this.prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => undefined)
      }
      throw new UnauthorizedException('Сессия истекла')
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } })

    return this.issueTokens(stored.user.id, stored.user.email, stored.user.role)
  }

  async logout(refreshToken?: string) {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken)
      await this.prisma.refreshToken.deleteMany({ where: { tokenHash } })
    }
    return { ok: true }
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        gender: true,
        birthDate: true,
      },
    })
    if (!user) {
      throw new UnauthorizedException()
    }
    return user
  }

  private async issueTokens(
    userId: string,
    email: string,
    role: AuthTokens['user']['role'],
  ): Promise<AuthTokens> {
    const accessExpiresIn = this.config.get<string>('JWT_ACCESS_EXPIRES_IN') || '15m'
    const refreshExpiresIn = this.config.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d'

    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role },
      { expiresIn: accessExpiresIn as `${number}m` },
    )

    const refreshToken = randomBytes(48).toString('hex')
    const tokenHash = this.hashToken(refreshToken)
    const expiresAt = new Date(Date.now() + this.parseDurationMs(refreshExpiresIn))

    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    })

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, role },
    }
  }

  private async purgeExpiredRefreshTokens() {
    await this.prisma.refreshToken.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex')
  }

  private parseDurationMs(value: string) {
    const match = /^(\d+)([smhd])$/.exec(value.trim())
    if (!match) return 7 * 24 * 60 * 60 * 1000
    const amount = Number(match[1])
    const unit = match[2]
    const mult =
      unit === 's' ? 1000 : unit === 'm' ? 60_000 : unit === 'h' ? 3_600_000 : 86_400_000
    return amount * mult
  }
}
