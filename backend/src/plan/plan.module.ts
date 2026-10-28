import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module.js';
import { PlanController } from './plan.controller.js';
import { PlanService } from './plan.service.js';

@Module({
  imports: [CatalogModule],
  controllers: [PlanController],
  providers: [PlanService],
})
export class PlanModule {}