export default function PublicLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-brand-600 border-t-transparent"
          aria-hidden
        />
        <p className="text-sm text-ink-muted">Loading…</p>
      </div>
    </div>
  );
}
