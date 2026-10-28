import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchTests } from './lib/api';
import { PlanView } from './components/PlanView';
import { TestPicker } from './components/TestPicker';
import { usePlan } from './hooks/usePlan';
import type { Test } from './contract/types';

export default function App() {
  const [tests, setTests] = useState<Test[] | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchTests()
      .then(setTests)
      .catch(() => setCatalogError("Couldn't load the test list. Please refresh the page."));
  }, []);

  const byId = useMemo(() => new Map((tests ?? []).map((t) => [t.id, t])), [tests]);
  const nameOf = (id: string) => byId.get(id)?.name ?? id;
  const selected = selectedIds
    .map((id) => byId.get(id))
    .filter((t): t is Test => t !== undefined);

  const plan = usePlan(selectedIds);

  if (catalogError) {
    return (
      <Shell>
        <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
          {catalogError}
        </div>
      </Shell>
    );
  }

  if (!tests) {
    return (
      <Shell>
        <p className="text-slate-500">Loading tests…</p>
      </Shell>
    );
  }

  return (
    <Shell>
      <TestPicker
        tests={tests}
        selected={selected}
        onAdd={(id) => setSelectedIds((ids) => (ids.includes(id) ? ids : [...ids, id]))}
        onRemove={(id) => setSelectedIds((ids) => ids.filter((x) => x !== id))}
        onClear={() => setSelectedIds([])}
      />
      <PlanView state={plan} nameOf={nameOf} />
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-teal-700 text-white">
        <div className="mx-auto max-w-xl px-4 py-5">
          <h1 className="text-xl font-bold">Lab test bundle finder</h1>
          <p className="text-sm text-teal-100">Find the cheapest way to get all your tests.</p>
        </div>
      </header>
      <main className="mx-auto max-w-xl space-y-4 p-4">{children}</main>
    </div>
  );
}