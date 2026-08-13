export default function SessionReviewLoading() {
  return (
    <main className="max-w-md mx-auto px-safe-margin pt-20 pb-24 flex flex-col gap-6 w-full animate-pulse">
      <div className="flex flex-col items-center space-y-2">
        <div className="h-4 w-28 bg-surface-container-high rounded" />
        <div className="h-8 w-52 bg-surface-container-high rounded" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel h-28 rounded-xl bg-surface-container" />
        <div className="glass-panel h-28 rounded-xl bg-surface-container" />
      </div>

      <div className="space-y-3">
        <div className="glass-panel h-16 rounded-lg bg-surface-container" />
        <div className="glass-panel h-16 rounded-lg bg-surface-container" />
      </div>
    </main>
  );
}
