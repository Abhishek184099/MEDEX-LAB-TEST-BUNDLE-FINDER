import { describe, expect, it } from 'vitest';
import { buildCandidates , findCheapestPlan } from '../src/plan/plan.engine.js';
import { Package ,Test } from '../src/catalog/catalog.types.js';

const test = (id: string, price: number | null): Test => ({
  id,
  code: id,
  name: id,
  price,
  status: true,
});


const pkg = (id: string, price: number, testIds: string[]): Package => ({
  id,
  name: id,
  price,
  testIds,
  status: true,
});

function solve(selected: string[], tests: Test[], packages: Package[]) {
  const candidates = buildCandidates(selected, tests, packages);
  return findCheapestPlan(selected, candidates);
}

describe('findCheapestPlan', () => {
  it('buys single tests when no package is cheaper', () => {
    const tests = [test('T1', 100), test('T2', 200)];
    const plan = solve(['T1', 'T2'], tests, [pkg('P1', 500, ['T1', 'T2'])]);
    expect(plan?.total).toBe(300);
    expect(plan?.items.map((i) => i.id)).toEqual(['T1', 'T2']);
  });

  it('uses a package when it is cheaper than the single tests', () => {
    const tests = [test('T1', 100), test('T2', 200)];
    const plan = solve(['T1', 'T2'], tests, [pkg('P1', 250, ['T1', 'T2'])]);
    expect(plan?.total).toBe(250);
    expect(plan?.items.map((i) => i.id)).toEqual(['P1']);
  });

  it('returns null when a test cannot be bought', () => {
    const tests = [test('T1', null)];
    expect(solve(['T1'], tests, [])).toBeNull();
  });

  it('combines a package with a single test for the rest', () => {
    const tests = [test('T1', 100), test('T2', 100), test('T3', 100)];
    const plan = solve(['T1', 'T2', 'T3'], tests, [pkg('P1', 150, ['T1', 'T2'])]);
    expect(plan?.total).toBe(250);
    expect(plan?.items.map((i) => i.id)).toEqual(['P1', 'T3']);
  });

  it('prefers fewer items when totals are equal', () => {
    const tests = [test('T1', 100), test('T2', 100)];
    const packages = [pkg('P1', 200, ['T1', 'T2']), pkg('P2', 200, ['T1'])];
    const plan = solve(['T1', 'T2'], tests, packages);
    expect(plan?.items.map((i) => i.id)).toEqual(['P1']);
  });

  it('prefers fewer extra tests when totals and item counts are equal', () => {
    const tests = [test('T1', null), test('T2', null), test('T3', null)];
    const packages = [
      pkg('P1', 500, ['T1', 'T2', 'T3']),
      pkg('P2', 500, ['T1', 'T2', 'T9']), 
    ];
    const plan = solve(['T1', 'T2'], tests, packages);
    expect(plan?.items.map((i) => i.id)).toEqual(['P1']);
    expect(plan?.extraTests).toEqual(['T3']);
  });

  it('prefers the plan whose sorted item IDs come first', () => {
    const tests = [test('T1', 100)];
    const packages = [pkg('P2', 100, ['T1']), pkg('P1', 100, ['T1'])];
    const plan = solve(['T1'], tests, packages);
    expect(plan?.items.map((i) => i.id)).toEqual(['P1']);
  });

  it('reports extra tests from packages without counting selected ones', () => {
    const tests = [test('T1', null), test('T2', 100)];
    const plan = solve(['T1'], tests, [pkg('P1', 300, ['T1', 'T2'])]);
    expect(plan?.extraTests).toEqual(['T2']);
  });

  it('counts a repeated selection only once', () => {
    const tests = [test('T1', 100)];
    const plan = solve(['T1'], tests, []);
    expect(plan?.items).toHaveLength(1);
  });
});