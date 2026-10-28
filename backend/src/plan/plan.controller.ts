import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { PlanService } from './plan.service.js';
import { PlanRequest, PlanResponse } from './plan.types.js';

@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Post()
  @HttpCode(200) 
  createPlan(@Body() body: PlanRequest): PlanResponse {
    return this.planService.createPlan(body?.testIds);
  }
}