import { errorMessage } from '../lib/messages';
import type { PlanState } from '../hooks/usePlan';
import type { Plan } from '../contract/types';

interface Props {
  state: PlanState;
  nameOf: (id: string) => string;
}

const baht = (n: number) => `฿${n.toLocaleString('en-US')}`;

export function PlanView({ state, nameOf }: Props) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 sm:p-6">
      <h2 className="mb-3 text-lg font-semibold">Your plan</h2>

      {state.status === 'idle' && (
        <div className="py-8 text-center">
          <p className="font-medium text-slate-700">No tests selected yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Search above and add the tests you need. We'll find the cheapest way to book them.
          </p>
        </div>
      )}

      {state.status === 'loading' && (
        <div className="animate-pulse space-y-3" aria-live="polite">
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-16 rounded-xl bg-slate-100" />
          <div className="h-10 w-1/2 rounded-lg bg-slate-100" />
          <span className="sr-only">Finding the cheapest plan</span>
        </div>
      )}

      {state.status === 'error' && (
        <div role="alert" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
          {errorMessage(state.error, nameOf)}
        </div>
      )}

      {state.status === 'ready' && <PlanDetails plan={state.plan} nameOf={nameOf} />}
    </section>
  );
}

function PlanDetails({ plan, nameOf }: { plan: Plan; nameOf: (id: string) => string }) {
  return (
    <div>
      <ul className="divide-y divide-slate-100">
        {plan.items.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-4 py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{item.name}</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    item.type === 'package'
                      ? 'bg-violet-100 text-violet-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.type === 'package' ? 'Package' : 'Single test'}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Covers {item.covers.map(nameOf).join(', ')}
              </p>
            </div>
            <span className="shrink-0 font-semibold tabular-nums">{baht(item.price)}</span>
          </li>
        ))}
      </ul>

      {plan.extraTests.length > 0 && (
        <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <span className="font-medium text-slate-700">Also included: </span>
          {plan.extraTests.map(nameOf).join(', ')}
        </div>
      )}

      <div className="mt-5 rounded-xl bg-teal-600 p-4 text-white">
        <div className="flex items-end justify-between">
          <span className="text-sm text-teal-100">Total</span>
          <span className="text-2xl font-bold tabular-nums">{baht(plan.total)}</span>
        </div>

        {plan.individualTotal !== null && (
          <div className="mt-1 flex justify-between text-sm text-teal-100">
            <span>Buying each test separately</span>
            <span className="line-through">{baht(plan.individualTotal)}</span>
          </div>
        )}

        {plan.savings !== null && plan.savings > 0 && (
          <div className="mt-3 inline-block rounded-full bg-white px-3 py-1 text-sm font-semibold text-teal-700">
            You save {baht(plan.savings)}
          </div>
        )}
      </div>
    </div>
  );
}