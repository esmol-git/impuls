import { Module } from '@nestjs/common'
import { UsersAdminController } from './users-admin.controller'
import { UsersService } from './users.service'

@Module({
  controllers: [UsersAdminController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
