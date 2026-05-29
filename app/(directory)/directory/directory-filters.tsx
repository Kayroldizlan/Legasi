"use client";

import {
  LayoutGrid,
  List,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { cn } from "@/lib/utils";

const CATEGORY_CHIPS = [
  { id: "all", label: "All" },
  { id: "people", label: "People" },
  { id: "families", label: "Families" },
  { id: "businesses", label: "Businesses" },
  { id: "communities", label: "Communities" },
  { id: "verified", label: "Verified" },
] as const;

const SORT_LABELS: Record<string, string> = {
  newest: "Recently active",
  alphabetical: "Alphabetical",
  most_connected: "Most connected",
};

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
      if (!("page" in patch)) next.delete("page");
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
      router.refresh();
    },
    [params, pathname, router],
  );

  React.useEffect(() => {
    setQ(params.get("q") ?? "");
  }, [params]);

  React.useEffect(() => {
    const id = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) update({ q: q || null });
    }, 350);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const sort = params.get("sort") ?? "newest";
  const view = params.get("view") ?? "grid";
  const category = params.get("category") ?? "all";
  const occupation = params.get("occupation") ?? "";
  const city = params.get("city") ?? "";
  const country = params.get("country") ?? "";
  const company = params.get("company") ?? "";
  const hasAdvanced = Boolean(occupation || city || country || company);
  const showFields = showAdvanced || hasAdvanced;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search members, occupations, companies, locations…"
            className="w-full rounded-2xl border border-zinc-200 bg-white py-3.5 pl-4 pr-14 text-sm shadow-soft focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
          />
          <button
            type="button"
            onClick={() => update({ q: q.trim() || null })}
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-brand-600 text-white"
            aria-label="Search"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced((value) => !value)}
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium transition",
            showFields
              ? "border-brand-200 bg-brand-50 text-brand-700"
              : "border-zinc-200 bg-white text-ink hover:bg-zinc-50",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORY_CHIPS.map((chip) => {
          const active =
            chip.id === "all"
              ? !params.get("category") || category === "all"
              : category === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() =>
                update({
                  category: chip.id === "all" ? null : chip.id,
                })
              }
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition",
                active
                  ? "bg-brand-600 text-white shadow-[0_8px_20px_rgb(239_68_68/0.18)]"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50",
              )}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {showFields && (
        <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-4 animate-fade-in">
          <FilterInput
            placeholder="Occupation"
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">People</h2>
          <p className="text-sm text-zinc-500">
            Explore and connect with amazing people.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
          >
            <option value="newest">{SORT_LABELS.newest}</option>
            <option value="alphabetical">{SORT_LABELS.alphabetical}</option>
            <option value="most_connected">{SORT_LABELS.most_connected}</option>
          </select>

          <div className="inline-flex rounded-xl border border-zinc-200 bg-white p-1">
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
        </div>
      </div>

      {(q || hasAdvanced || (category && category !== "all")) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
          <span>Active filters:</span>
          {q && (
            <Chip onClear={() => { setQ(""); update({ q: null }); }}>{`"${q}"`}</Chip>
          )}
          {occupation && (
            <Chip onClear={() => update({ occupation: null })}>Occ: {occupation}</Chip>
          )}
          {company && (
            <Chip onClear={() => update({ company: null })}>Company: {company}</Chip>
          )}
          {city && <Chip onClear={() => update({ city: null })}>City: {city}</Chip>}
          {country && (
            <Chip onClear={() => update({ country: null })}>Country: {country}</Chip>
          )}
          {category && category !== "all" && (
            <Chip onClear={() => update({ category: null })}>
              Category: {CATEGORY_CHIPS.find((c) => c.id === category)?.label ?? category}
            </Chip>
          )}
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
        active ? "bg-brand-600 text-white" : "text-zinc-500 hover:bg-zinc-50",
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
      className="rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/15"
    />
  );
}

function Chip({
  children,
  onClear,
}: {
  children: React.ReactNode;
  onClear: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2 py-0.5">
      {children}
      <button type="button" onClick={onClear} className="rounded-full p-0.5 hover:bg-zinc-50">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
