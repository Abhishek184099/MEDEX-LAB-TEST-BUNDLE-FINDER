import type { ApiErrorBody, Plan, Test } from '../contract/types';

export class PlanApiError extends Error {
  constructor(readonly body: ApiErrorBody) {
    super(body.error);
  }
}

export async function fetchTests(): Promise<Test[]> {
  const res = await fetch('/api/tests');
  if (!res.ok) throw new Error(`Failed to load tests (${res.status})`);
  return res.json();
}

export async function fetchPlan(testIds: string[], signal: AbortSignal): Promise<Plan> {
  const res = await fetch('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testIds }),
    signal,
  });
  const body = await res.json();
  if (!res.ok) throw new PlanApiError(body as ApiErrorBody);
  return body as Plan;
}