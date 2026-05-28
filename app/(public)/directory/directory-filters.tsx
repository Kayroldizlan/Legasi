"use client";

import { LayoutGrid, List, Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/utils";

export function DirectoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = React.useState(params.get("q") ?? "");
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const update = React.useCallback(
    (patch: Record<string, string | null>) => {
      const next = new URLSearchParams(params);
      Object.entries(patch).forEach(([k, v]) => {
        if (!v) next.delete(k);
        else next.set(k, v);
      });
      // Reset page when changing filters
      if (!("page" in patch)) next.delete("page");
      router.push(`${pathname}?${next.toString()}`);
    },
    [params, pathname, router],
  );

  // Debounced search
  React.useEffect(() => {
    const id = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) update({ q: q || null });
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const sort = params.get("sort") ?? "newest";
  const view = params.get("view") ?? "grid";
  const occupation = params.get("occupation") ?? "";
  const city = params.get("city") ?? "";
  const country = params.get("country") ?? "";
  const company = params.get("company") ?? "";

  const hasAdvanced = Boolean(occupation || city || country || company);
  const showFields = showAdvanced || hasAdvanced;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, username, occupation or company"
            className="input-base pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="input-base sm:w-44"
          >
            <option value="newest">Newest first</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="most_connected">Most connected</option>
          </select>

          <div className="inline-flex rounded-xl border border-border bg-surface p-1">
            <ViewButton
              active={view === "grid"}
              onClick={() => update({ view: "grid" })}
              label="Grid"
              icon={<LayoutGrid className="h-4 w-4" />}
            />
            <ViewButton
              active={view === "list"}
              onClick={() => update({ view: "list" })}
              label="List"
              icon={<List className="h-4 w-4" />}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced((s) => !s)}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-medium",
              showFields ? "bg-brand-50 text-brand-700 border-brand-200" : "bg-surface text-ink",
            )}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {showFields && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
          <FilterInput
            placeholder="Occupation (e.g. Designer)"
            value={occupation}
            onChange={(v) => update({ occupation: v })}
          />
          <FilterInput
            placeholder="Company"
            value={company}
            onChange={(v) => update({ company: v })}
          />
          <FilterInput
            placeholder="City"
            value={city}
            onChange={(v) => update({ city: v })}
          />
          <FilterInput
            placeholder="Country"
            value={country}
            onChange={(v) => update({ country: v })}
          />
        </div>
      )}

      {(q || hasAdvanced) && (
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <span>Active filters:</span>
          {q && (
            <Chip onClear={() => { setQ(""); update({ q: null }); }}>{`"${q}"`}</Chip>
          )}
          {occupation && <Chip onClear={() => update({ occupation: null })}>Occ: {occupation}</Chip>}
          {company && <Chip onClear={() => update({ company: null })}>Company: {company}</Chip>}
          {city && <Chip onClear={() => update({ city: null })}>City: {city}</Chip>}
          {country && <Chip onClear={() => update({ country: null })}>Country: {country}</Chip>}
        </div>
      )}
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-8 w-9 items-center justify-center rounded-lg text-sm",
        active ? "bg-brand-600 text-white" : "text-ink-muted hover:bg-surface-subtle",
      )}
    >
      {icon}
    </button>
  );
}

function FilterInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string | null) => void;
  placeholder: string;
}) {
  const [val, setVal] = React.useState(value);
  React.useEffect(() => setVal(value), [value]);
  React.useEffect(() => {
    const id = setTimeout(() => {
      if (val !== value) onChange(val || null);
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [val]);

  return (
    <input
      value={val}
      onChange={(e) => setVal(e.target.value)}
      placeholder={placeholder}
      className="input-base"
    />
  );
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface border border-border px-2 py-0.5">
      {children}
      <button onClick={onClear} className="rounded-full p-0.5 hover:bg-surface-subtle">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
