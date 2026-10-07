import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { existsSync, mkdirSync } from 'fs'
import helmet from 'helmet'
import { join } from 'path'
import { AppModule } from './app.module'
import { isProduction, requireConfig } from './common/config'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const logger = new Logger('Bootstrap')
  const prod = isProduction(config)

  // Падаем сразу, если в production нет секретов
  requireConfig(config, 'JWT_SECRET', prod ? undefined : 'dev-secret')
  requireConfig(config, 'DATABASE_URL')
  const corsOrigin = requireConfig(
    config,
    'CORS_ORIGIN',
    prod ? undefined : 'http://localhost:5173,http://localhost:3000',
  )

  // Нужен за reverse-proxy, чтобы throttler видел реальный IP
  const http = app.getHttpAdapter().getInstance() as { set?: (key: string, value: unknown) => void }
  http.set?.('trust proxy', 1)

  const uploadDir = config.get<string>('UPLOAD_DIR') || 'uploads'
  const uploadPath = join(process.cwd(), uploadDir)
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true })
  }

  app.use(
    helmet({
      // Картинки отдаём с того же origin / через Nuxt proxy
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  )

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'uploads/*path', method: RequestMethod.GET }],
  })
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  )

  const origins = corsOrigin
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean)

  app.enableCors({
    origin: origins,
    credentials: true,
  })

  const port = Number(config.get('PORT') || 3001)
  await app.listen(port)
  logger.log(`API listening on http://localhost:${port}`)
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
