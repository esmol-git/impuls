import { Body, Controller, Post } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'
import { CreateLeadDto } from './dto/create-lead.dto'
import { LeadsService } from './leads.service'

@Controller('leads')
export class LeadsController {
  constructor(private readonly leads: LeadsService) {}

  @Post()
  @Throttle({ leads: { limit: 8, ttl: 60_000 }, default: { limit: 8, ttl: 60_000 } })
  async create(@Body() dto: CreateLeadDto) {
    const lead = await this.leads.create(dto)
    return { ok: true, id: lead.id }
  }
}
