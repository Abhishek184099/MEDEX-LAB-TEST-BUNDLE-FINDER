import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CatalogService } from '../catalog/catalog.service.js';
import { buildCandidates, findCheapestPlan } from './plan.engine.js';
import { PlanResponse } from './plan.types.js';

@Injectable()
export class PlanService {
  constructor(private readonly catalog: CatalogService) {}

  createPlan(testIds: string[] | undefined): PlanResponse {
    const selected = this.validateSelection(testIds);

    const candidates = buildCandidates(
      selected,
      this.catalog.getTests(),
      this.catalog.getActivePackages(),
    );
    const plan = findCheapestPlan(selected, candidates);

    if (!plan) {
      const coverable = new Set(candidates.flatMap((c) => c.covers));
      const unavailable = selected.filter((id) => !coverable.has(id));
      throw new UnprocessableEntityException({ error: 'NOT_AVAILABLE', testIds: unavailable });
    }

    const individualTotal = this.individualTotal(selected);

    return {
      ...plan,
      individualTotal,
      savings: individualTotal === null ? null : individualTotal - plan.total,
    };
  }

  private validateSelection(testIds: string[] | undefined): string[] {
    if (!Array.isArray(testIds) || testIds.length === 0) {
      throw new BadRequestException({ error: 'EMPTY_SELECTION', testIds: [] });
    }

    const selected = [...new Set(testIds)]; // duplicates count once
    const invalid = selected.filter((id) => !this.catalog.isSelectable(id));
    if (invalid.length > 0) {
      throw new BadRequestException({ error: 'INVALID_TESTS', testIds: invalid });
    }

    return selected;
  }

  private individualTotal(selected: string[]): number | null {
    let sum = 0;
    for (const id of selected) {
      const price = this.catalog.getTest(id)!.price;
      if (price === null) return null;
      sum += price;
    }
    return sum;
  }
}