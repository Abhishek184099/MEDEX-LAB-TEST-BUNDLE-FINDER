
import { useEffect, useState } from 'react';
import { fetchPlan } from '../lib/api';
import type { Plan } from '../contract/types';

export type PlanState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; plan: Plan }
  | { status: 'error'; error: unknown };

const DEBOUNCE_MS = 250;

type RequestResult =
  | { key: string; status: 'ready'; plan: Plan }
  | { key: string; status: 'error'; error: unknown };

export function usePlan(testIds: string[]): PlanState {
  const key = [...new Set(testIds)].join(',');

  const [result, setResult] = useState<RequestResult | null>(null);

  useEffect(() => {
    if (key === '') return;

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const plan = await fetchPlan(key.split(','), controller.signal);

        if (!controller.signal.aborted) {
          setResult({ key, status: 'ready', plan });
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResult({ key, status: 'error', error });
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key]);

  if (key === '') {
    return { status: 'idle' };
  }

  if (result?.key === key) {
    if (result.status === 'ready') {
      return { status: 'ready', plan: result.plan };
    }

    return { status: 'error', error: result.error };
  }

  return { status: 'loading' };
}
