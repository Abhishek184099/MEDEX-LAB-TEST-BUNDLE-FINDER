import { Package, Test } from '../catalog/catalog.types.js';
import { PlanItem, SolvedPlan } from './plan.types.js';

export interface Candidate {
  type: 'package' | 'test';
  id: string;
  name: string;
  price: number;
  covers: string[];
  includes: string[];
}

export function buildCandidates(
  selected: string[],
  tests: Test[],
  packages: Package[],
): Candidate[] {
  const testById = new Map(tests.map((t) => [t.id, t]));
  const candidates: Candidate[] = [];

  for (const id of selected) {
    const test = testById.get(id)!;
    if (test?.price !== null) {
      candidates.push({
        type: 'test',
        id,
        name: test.name,
        price: test.price,
        covers: [id],
        includes: [id],
      });
    }
  }
  for (const pkg of packages) {
    const covers = selected.filter((id) => pkg.testIds.includes(id));
    if (covers.length > 0) {
      candidates.push({
        type: 'package',
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        covers,
        includes: pkg.testIds,
      });
    }
  }

  return candidates;
}

export function findCheapestPlan(
  selected: string[],
  candidates: Candidate[],
): SolvedPlan | null {
  let best: SolvedPlan | null = null;

  function search(uncovered: Set<string>, chosen: Candidate[], cost: number) {
    if (best && cost > best.total) return;

    if (uncovered.size === 0) {
      const plan = toPlan(chosen, selected);
      if (!best || isBetter(plan, best)) best = plan;
      return;
    }

    const next = selected.find((id) => uncovered.has(id))!;
    for (const candidate of candidates) {
      if (!candidate.covers.includes(next)) continue;
      const remaining = new Set(
        [...uncovered].filter((id) => !candidate.covers.includes(id)),
      );
      search(remaining, [...chosen, candidate], cost + candidate.price);
    }
  }

  search(new Set(selected), [], 0);
  return best;
}

function toPlan(chosen: Candidate[], selected: string[]): SolvedPlan {
  const selectedSet = new Set(selected);

  const items: PlanItem[] = chosen.map((c) => ({
    type: c.type,
    id: c.id,
    name: c.name,
    price: c.price,
    covers: c.covers,
  })).sort((a , b) => (a.id<b.id ? -1 : 1))

  const extra = new Set<string>;
  for(const c of chosen){
    for (const id of c.includes){
        if(!selectedSet.has(id)) extra.add(id)
    }
  }

  return {
    items ,
    total: chosen.reduce((sum, c) => sum + c.price, 0),
    extraTests: [...extra].sort(),
  }
}


function isBetter(a: SolvedPlan, b: SolvedPlan): boolean {
  if (a.total < b.total) {
    return true;
  }

  if (a.total > b.total) {
    return false;
  }

  if (a.items.length < b.items.length) {
    return true;
  }

  if (a.items.length > b.items.length) {
    return false;
  }

  if (a.extraTests.length < b.extraTests.length) {
    return true;
  }

  if (a.extraTests.length > b.extraTests.length) {
    return false;
  }

  const idsA = a.items.map((item) => item.id).sort();
  const idsB = b.items.map((item) => item.id).sort();

  for (let i = 0; i < idsA.length; i++) {
    if (idsA[i] < idsB[i]) {
      return true;
    }

    if (idsA[i] > idsB[i]) {
      return false;
    }
  }

  return false;
}
