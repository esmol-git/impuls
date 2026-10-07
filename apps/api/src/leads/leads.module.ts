import { Module } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module'
import { LeadsAdminController } from './leads-admin.controller'
import { LeadsController } from './leads.controller'
import { LeadsService } from './leads.service'

@Module({
  imports: [AuthModule],
  controllers: [LeadsController, LeadsAdminController],
  providers: [LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
