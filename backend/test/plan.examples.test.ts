import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { HttpException } from '@nestjs/common';
import { CatalogService } from "../src/catalog/catalog.service.js";
import { CatalogData } from '../src/catalog/catalog.types.js';
import { PlanService } from '../src/plan/plan.service.js';

interface Example {
  request: { testIds: string[] };
  expected: unknown;
}

const dataPath = fileURLToPath(
  new URL('../../backend/data/lab-catalog.json', import.meta.url),
);
const data = JSON.parse(readFileSync(dataPath, 'utf-8')) as CatalogData & {
  examples: Example[];
};

const catalog = new CatalogService();
catalog.load(data);

const planService = new PlanService(catalog);

function errorBody(fn: () => unknown): unknown {
  try {
    fn();
  } catch (err) {
    if (err instanceof HttpException) return err.getResponse();
    throw err;
  }
  throw new Error('Expected an error but none was thrown');
}

describe('POST /api/plan', () => {
  // Every example in the data file must match exactly
  const cases = data.examples.map((ex, i) => [`example ${i + 1}`, ex] as const);
  it.each(cases)('%s returns the expected plan', (_name, example) => {
    expect(planService.createPlan(example.request.testIds)).toEqual(example.expected);
  });

  it('returns EMPTY_SELECTION when nothing is selected', () => {
    expect(errorBody(() => planService.createPlan([]))).toEqual({
      error: 'EMPTY_SELECTION',
      testIds: [],
    });
  });

  it('returns INVALID_TESTS for unknown or inactive tests', () => {
    expect(errorBody(() => planService.createPlan(['T19', 'T99']))).toEqual({
      error: 'INVALID_TESTS',
      testIds: ['T19', 'T99'],
    });
  });

  it('returns NOT_AVAILABLE when a test has no price and no package', () => {
    const small = new CatalogService();
    small.load({
      tests: [{ id: 'T15', code: 'HIV', name: 'HIV', price: null, status: true }],
      packages: [],
    });
    const service = new PlanService(small);
    expect(errorBody(() => service.createPlan(['T15']))).toEqual({
      error: 'NOT_AVAILABLE',
      testIds: ['T15'],
    });
  });
});


