export default function PlayersLoading() {
  return (
    <main className="max-w-md mx-auto px-safe-margin pt-20 pb-24 flex flex-col gap-6 w-full animate-pulse">
      <div className="flex flex-col space-y-2">
        <div className="h-7 w-44 bg-surface-container-high rounded" />
        <div className="h-4 w-60 bg-surface-container-high rounded" />
      </div>

      <div className="space-y-3">
        <div className="glass-panel h-20 rounded-xl bg-surface-container" />
        <div className="glass-panel h-20 rounded-xl bg-surface-container" />
        <div className="glass-panel h-20 rounded-xl bg-surface-container" />
        <div className="glass-panel h-20 rounded-xl bg-surface-container" />
      </div>
    </main>
  );
}
