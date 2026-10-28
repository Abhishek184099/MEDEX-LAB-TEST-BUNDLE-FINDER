import { Module } from '@nestjs/common';
import { CatalogModule } from './catalog/catalog.module.js';
import { PlanModule } from './plan/plan.module.js';

@Module({
  imports: [CatalogModule, PlanModule],
})
export class AppModule {}
