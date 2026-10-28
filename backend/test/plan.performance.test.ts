import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { CatalogService } from '../src/catalog/catalog.service.js';
import { CatalogData } from '../src/catalog/catalog.types.js';
import { PlanService } from '../src/plan/plan.service.js';

const dataPath = fileURLToPath(new URL('../../backend/data/lab-catalog.json', import.meta.url));
const data = JSON.parse(readFileSync(dataPath, 'utf-8')) as CatalogData;

const catalog = new CatalogService();
catalog.load(data);
const planService = new PlanService(catalog);

function timeIt(testIds: string[]): number {
  const start = performance.now();
  planService.createPlan(testIds);
  return performance.now() - start;
}

describe('POST /api/plan performance', () => {
  const LIMIT_MS = 300;

  const allTests = catalog.getTests().map((t) => t.id);

  it('answers a small selection under 300 ms', () => {
    expect(timeIt(['T02', 'T03', 'T04', 'T06'])).toBeLessThan(LIMIT_MS);
  });

  it('answers a selection of every active test under 300 ms', () => {
    expect(timeIt(allTests)).toBeLessThan(LIMIT_MS);
  });

  it('stays under 300 ms when the same request is repeated', () => {
    for (let i = 0; i < 20; i++) {
      expect(timeIt(allTests)).toBeLessThan(LIMIT_MS);
    }
  });
});

