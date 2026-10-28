import { useState } from 'react';
import type { Test } from '../contract/types';

interface Props {
  tests: Test[];
  selected: Test[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}
const MAX_RESULTS = 6;

export function TestPicker({ tests, selected, onAdd, onRemove, onClear }: Props) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const selectedIds = new Set(selected.map((t) => t.id));

  const matches = q
    ? tests
        .filter(
          (t) =>
            !selectedIds.has(t.id) &&
            (t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q)),
        )
        .slice(0, MAX_RESULTS)
    : [];

  const add = (id: string) => {
    onAdd(id);
    setQuery('');
  };

  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <label htmlFor="search" className="mb-2 block text-sm font-medium text-slate-700">
        Which tests did your doctor ask for?
      </label>
      <input
        id="search"
        type="search"
        placeholder="Type a name or code, e.g. HbA1c"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && matches[0]) add(matches[0].id);
        }}
        className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-base placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-teal-100"
      />

      {q &&
        (matches.length > 0 ? (
          <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
            {matches.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => add(t.id)}
                  className="flex min-h-12 w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-teal-50"
                >
                  <span className="font-medium">{t.name}</span>
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {t.code}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">No tests match “{query}”.</p>
        ))}

      {selected.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">{selected.length} selected</span>
            <button
              type="button"
              onClick={onClear}
              className="text-sm font-medium text-teal-700 hover:underline"
            >
              Clear all
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1 rounded-full bg-teal-50 py-1 pl-3 pr-1 text-sm font-medium text-teal-900 ring-1 ring-teal-200"
              >
                {t.name}
                <button
                  type="button"
                  aria-label={`Remove ${t.name}`}
                  onClick={() => onRemove(t.id)}
                  className="flex size-7 items-center justify-center rounded-full text-lg leading-none text-teal-700 hover:bg-teal-100"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}