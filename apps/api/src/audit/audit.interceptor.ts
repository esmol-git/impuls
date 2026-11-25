import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import type { Request } from 'express'
import { Observable, tap } from 'rxjs'
import type { AuthUser } from '../auth/types'
import { mapRequestToAudit } from './audit-map'
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
