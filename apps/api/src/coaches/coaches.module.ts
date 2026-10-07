import { Module } from '@nestjs/common'
import { CoachesAdminController } from './coaches-admin.controller'
import { CoachesController } from './coaches.controller'
import { CoachesService } from './coaches.service'

@Module({
  controllers: [CoachesController, CoachesAdminController],
  providers: [CoachesService],
  exports: [CoachesService],
})
export class CoachesModule {}
