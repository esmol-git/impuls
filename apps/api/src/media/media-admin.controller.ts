import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { StorageService } from '../storage/storage.service'
import { CreateMediaDto } from './dto/create-media.dto'
import { ListMediaQueryDto } from './dto/list-media-query.dto'
import { ReorderMediaDto } from './dto/reorder-media.dto'
import { UpdateMediaDto } from './dto/update-media.dto'
import { MediaService } from './media.service'

@Controller('admin/media')
@UseGuards(JwtAuthGuard)
export class MediaAdminController {
  constructor(
    private readonly media: MediaService,
    private readonly storage: StorageService,
  ) {}

  @Get()
  list(@Query() query: ListMediaQueryDto) {
    return this.media.listAdminPaged(query)
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.media.findAdminById(id)
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 20 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new BadRequestException('Только изображения'), false)
          return
        }
        cb(null, true)
      },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Нужен файл')
    }
    const uploaded = await this.storage.uploadImage(file.buffer, file.mimetype)
    return { url: uploaded.url }
  }

  @Post()
  create(@Body() dto: CreateMediaDto) {
    return this.media.create(dto)
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderMediaDto) {
    return this.media.reorder(dto.type, dto.ids)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMediaDto) {
    return this.media.update(id, dto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.media.remove(id)
  }
}
