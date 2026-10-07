import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { requireConfig } from '../common/config'
import { createReadStream, existsSync } from 'fs'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { Readable } from 'stream'
import sharp from 'sharp'

const MAX_EDGE = 1920
const WEBP_QUALITY = 82

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name)
  private client!: S3Client
  private bucket!: string
  private localDir!: string

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    this.bucket = this.config.get<string>('MINIO_BUCKET') || 'impuls'
    this.localDir = join(process.cwd(), this.config.get<string>('UPLOAD_DIR') || 'uploads')

    const endpoint = requireConfig(this.config, 'MINIO_ENDPOINT', 'http://127.0.0.1:9000')
    const accessKey = requireConfig(this.config, 'MINIO_ACCESS_KEY', 'minioadmin')
    const secretKey = requireConfig(this.config, 'MINIO_SECRET_KEY', 'minioadmin')
    const region = this.config.get<string>('MINIO_REGION') || 'us-east-1'

    this.client = new S3Client({
      region,
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    })

    await this.ensureBucket()
  }

  /** Принимает картинку, конвертирует в WebP и кладёт в MinIO */
  async uploadImage(buffer: Buffer, mimetype?: string) {
    if (!buffer?.length) {
      throw new BadRequestException('Пустой файл')
    }
    if (mimetype && !mimetype.startsWith('image/')) {
      throw new BadRequestException('Только изображения')
    }

    const webp = await this.toWebp(buffer)
    const key = `${randomUUID()}.webp`

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: webp,
        ContentType: 'image/webp',
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    )

    return {
      key,
      url: `/uploads/${key}`,
      contentType: 'image/webp',
      size: webp.length,
    }
  }

  async open(key: string): Promise<{ stream: Readable; contentType: string }> {
    const safeKey = key.replace(/^\/+/, '').replace(/\.\./g, '')
    if (!safeKey) throw new NotFoundException('Файл не найден')

    try {
      const result = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: safeKey,
        }),
      )
      if (!result.Body) throw new NotFoundException('Файл не найден')
      return {
        stream: result.Body as Readable,
        contentType: result.ContentType || 'application/octet-stream',
      }
    } catch (error) {
      const localPath = join(this.localDir, safeKey)
      if (existsSync(localPath)) {
        return {
          stream: createReadStream(localPath),
          contentType: this.guessContentType(safeKey),
        }
      }
      this.logger.debug(`object miss: ${safeKey}`, error instanceof Error ? error.message : error)
      throw new NotFoundException('Файл не найден')
    }
  }

  private async toWebp(buffer: Buffer) {
    try {
      return await sharp(buffer, { animated: false, failOn: 'none' })
        .rotate()
        .resize({
          width: MAX_EDGE,
          height: MAX_EDGE,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY, effort: 4 })
        .toBuffer()
    } catch {
      throw new BadRequestException('Не удалось обработать изображение')
    }
  }

  private async ensureBucket() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }))
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }))
        this.logger.log(`Created MinIO bucket «${this.bucket}»`)
      } catch (error) {
        this.logger.error(`MinIO bucket «${this.bucket}» unavailable`, error)
        throw error
      }
    }

    // Bucket остаётся приватным: раздача только через Nest /uploads/:key
  }

  private guessContentType(key: string) {
    const lower = key.toLowerCase()
    if (lower.endsWith('.webp')) return 'image/webp'
    if (lower.endsWith('.png')) return 'image/png'
    if (lower.endsWith('.gif')) return 'image/gif'
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg'
    return 'application/octet-stream'
  }
}
