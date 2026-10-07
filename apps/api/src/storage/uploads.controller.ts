import { Controller, Get, Param, Res } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import type { Response } from 'express'
import { StorageService } from './storage.service'

/** Раздача файлов с MinIO (и локальный fallback для старых uploads) */
@Controller('uploads')
@SkipThrottle({ default: true, auth: true, leads: true })
export class UploadsController {
  constructor(private readonly storage: StorageService) {}

  @Get(':key')
  async get(@Param('key') key: string, @Res() res: Response) {
    const file = await this.storage.open(key)
    res.setHeader('Content-Type', file.contentType)
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    file.stream.pipe(res)
  }
}
