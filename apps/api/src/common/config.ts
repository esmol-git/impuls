import { ConfigService } from '@nestjs/config'

/** В production обязателен; в dev можно fallback (только для локалки). */
export function requireConfig(
  config: ConfigService,
  key: string,
  fallback?: string,
): string {
  const value = config.get<string>(key)?.trim()
  if (value) return value

  const isProd = (config.get<string>('NODE_ENV') || '').toLowerCase() === 'production'
  if (isProd || fallback == null) {
    throw new Error(`Переменная окружения ${key} обязательна`)
  }
  return fallback
}

export function isProduction(config: ConfigService) {
  return (config.get<string>('NODE_ENV') || '').toLowerCase() === 'production'
}
