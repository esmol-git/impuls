import { Module } from '@nestjs/common'
import { TaxonomyAdminController } from './taxonomy-admin.controller'
import { TaxonomyController } from './taxonomy.controller'
import { TaxonomyService } from './taxonomy.service'

@Module({
  controllers: [TaxonomyController, TaxonomyAdminController],
  providers: [TaxonomyService],
  exports: [TaxonomyService],
})
export class TaxonomyModule {}
