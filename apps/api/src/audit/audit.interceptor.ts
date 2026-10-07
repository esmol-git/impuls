import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import type { Request } from 'express'
import { Observable, tap } from 'rxjs'
import type { AuthUser } from '../auth/types'
import { AuditService } from './audit.service'

type AuthedRequest = Request & { user?: AuthUser }

const SKIP_PREFIXES = [
  '/api/admin/audit',
  '/api/admin/stats',
  '/api/admin/notifications',
  '/api/auth/refresh',
  '/api/auth/me',
  '/api/health',
]

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle()

    const req = context.switchToHttp().getRequest<AuthedRequest>()
    const method = (req.method || '').toUpperCase()
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle()
    }

    const path = (req.originalUrl || req.url || '').split('?')[0]
    if (SKIP_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return next.handle()
    }

    // Публичные заявки / uploads не пишем в этот журнал
    if (!path.startsWith('/api/admin/') && !path.startsWith('/api/auth/')) {
      return next.handle()
    }

    return next.handle().pipe(
      tap((result) => {
        const mapped = mapRequestToAudit(method, path, req, result)
        if (!mapped) return
        void this.audit.record({
          ...mapped,
          actorId: req.user?.id,
          actorEmail: req.user?.email || mapped.actorEmail,
          ip: clientIp(req),
        })
      }),
    )
  }
}

function clientIp(req: AuthedRequest) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0]?.trim() || null
  }
  return req.ip || req.socket?.remoteAddress || null
}

function mapRequestToAudit(
  method: string,
  path: string,
  req: AuthedRequest,
  result: unknown,
) {
  const idFromPath = path.match(/\/([a-zA-Z0-9_-]{8,})(?:\/|$)/)?.[1]
  const body = (req.body || {}) as Record<string, unknown>
  const resultObj =
    result && typeof result === 'object' ? (result as Record<string, unknown>) : null
  const entityId =
    (typeof resultObj?.id === 'string' && resultObj.id) ||
    (typeof req.params?.id === 'string' && req.params.id) ||
    idFromPath ||
    null

  if (path.startsWith('/api/auth/login')) {
    const email = typeof body.email === 'string' ? body.email : null
    return {
      action: 'auth.login',
      entity: 'auth',
      entityId: typeof resultObj?.user === 'object'
        ? ((resultObj.user as { id?: string }).id ?? null)
        : null,
      actorEmail: email,
      summary: email ? `Вход: ${email}` : 'Вход в админку',
    }
  }

  if (path.startsWith('/api/auth/logout')) {
    return {
      action: 'auth.logout',
      entity: 'auth',
      summary: 'Выход из админки',
    }
  }

  if (path.startsWith('/api/admin/users')) {
    const email =
      (typeof body.email === 'string' && body.email) ||
      (typeof resultObj?.email === 'string' && resultObj.email) ||
      entityId
    if (method === 'POST') {
      return {
        action: 'user.create',
        entity: 'user',
        entityId,
        summary: `Создан пользователь ${email}`,
        meta: pick(body, ['role', 'email']),
      }
    }
    if (method === 'PATCH') {
      return {
        action: 'user.update',
        entity: 'user',
        entityId,
        summary: `Изменён пользователь ${email}`,
        meta: pick(body, ['role', 'email', 'firstName', 'lastName', 'gender', 'birthDate']),
      }
    }
    if (method === 'DELETE') {
      return {
        action: 'user.delete',
        entity: 'user',
        entityId,
        summary: `Удалён пользователь ${entityId}`,
      }
    }
  }

  if (path.startsWith('/api/admin/media/upload')) {
    return {
      action: 'media.upload',
      entity: 'media',
      summary: 'Загружен файл',
      meta: typeof resultObj?.url === 'string' ? { url: resultObj.url } : null,
    }
  }

  if (path.startsWith('/api/admin/media')) {
    const title =
      (typeof body.title === 'string' && body.title) ||
      (typeof resultObj?.title === 'string' && resultObj.title) ||
      entityId
    const type =
      (typeof body.type === 'string' && body.type) ||
      (typeof resultObj?.type === 'string' && resultObj.type) ||
      null
    if (method === 'POST') {
      return {
        action: 'media.create',
        entity: 'media',
        entityId,
        summary: `Создан материал: ${title}`,
        meta: { type },
      }
    }
    if (method === 'PATCH') {
      return {
        action: 'media.update',
        entity: 'media',
        entityId,
        summary: `Изменён материал: ${title}`,
        meta: pick(body, ['type', 'published', 'title', 'category', 'sku']),
      }
    }
    if (method === 'DELETE') {
      return {
        action: 'media.delete',
        entity: 'media',
        entityId,
        summary: `Удалён материал ${entityId}`,
      }
    }
  }

  if (path.startsWith('/api/admin/coaches')) {
    const name =
      (typeof body.name === 'string' && body.name) ||
      (typeof resultObj?.name === 'string' && resultObj.name) ||
      entityId
    if (method === 'POST') {
      return {
        action: 'coach.create',
        entity: 'coach',
        entityId,
        summary: `Добавлен тренер: ${name}`,
        meta: pick(body, ['name', 'role', 'published']),
      }
    }
    if (method === 'PATCH') {
      if (path.endsWith('/reorder')) {
        return {
          action: 'coach.reorder',
          entity: 'coach',
          summary: 'Изменён порядок тренеров',
        }
      }
      return {
        action: 'coach.update',
        entity: 'coach',
        entityId,
        summary: `Изменён тренер: ${name}`,
        meta: pick(body, ['name', 'role', 'published', 'experience']),
      }
    }
    if (method === 'DELETE') {
      return {
        action: 'coach.delete',
        entity: 'coach',
        entityId,
        summary: `Удалён тренер ${entityId}`,
      }
    }
  }

  if (path.startsWith('/api/admin/leads')) {
    if (method === 'PATCH') {
      return {
        action: 'lead.update',
        entity: 'lead',
        entityId,
        summary: `Обновлена заявка ${entityId}`,
        meta: pick(body, ['status']),
      }
    }
    if (method === 'DELETE') {
      return {
        action: 'lead.delete',
        entity: 'lead',
        entityId,
        summary: `Удалена заявка ${entityId}`,
      }
    }
  }

  if (path.startsWith('/api/admin/settings') || path.startsWith('/api/admin/home')) {
    return {
      action: 'settings.update',
      entity: 'settings',
      summary: 'Изменены настройки сайта',
      meta: { path, method },
    }
  }

  if (path.startsWith('/api/admin/taxonomies')) {
    const name =
      (typeof body.name === 'string' && body.name) ||
      (typeof resultObj?.name === 'string' && resultObj.name) ||
      entityId
    if (method === 'POST') {
      return {
        action: 'taxonomy.create',
        entity: 'taxonomy',
        entityId,
        summary: `Добавлен справочник: ${name}`,
        meta: pick(body, ['kind', 'name']),
      }
    }
    if (method === 'PATCH') {
      return {
        action: 'taxonomy.update',
        entity: 'taxonomy',
        entityId,
        summary: `Изменён справочник: ${name}`,
        meta: pick(body, ['kind', 'name', 'sortOrder']),
      }
    }
    if (method === 'DELETE') {
      return {
        action: 'taxonomy.delete',
        entity: 'taxonomy',
        entityId,
        summary: `Удалён справочник ${entityId}`,
      }
    }
  }

  if (path.startsWith('/api/admin/')) {
    return {
      action: `admin.${method.toLowerCase()}`,
      entity: 'admin',
      entityId,
      summary: `${method} ${path}`,
      meta: { path },
    }
  }

  return null
}

function pick(source: Record<string, unknown>, keys: string[]) {
  const out: Record<string, unknown> = {}
  for (const key of keys) {
    if (source[key] !== undefined) out[key] = source[key]
  }
  return Object.keys(out).length ? out : null
}
