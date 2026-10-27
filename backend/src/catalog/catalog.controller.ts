import { Controller, Get } from '@nestjs/common';
import { CatalogService } from './catalog.service.js';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('tests')
  getTests() {
    return this.catalog.getTests();
  }

  @Get('packages')
  getPackages() {
    return this.catalog.getActivePackages();
  }
}
