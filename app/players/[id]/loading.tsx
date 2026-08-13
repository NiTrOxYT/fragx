export default function PlayerProfileLoading() {
  return (
    <main className="max-w-md mx-auto px-safe-margin pt-20 pb-24 flex flex-col gap-6 w-full animate-pulse">
      <div className="flex flex-col items-center space-y-3">
        <div className="w-24 h-24 rounded-full bg-surface-container-high" />
        <div className="h-7 w-36 bg-surface-container-high rounded" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-panel h-24 rounded-xl bg-surface-container" />
        <div className="glass-panel h-24 rounded-xl bg-surface-container" />
        <div className="glass-panel h-24 rounded-xl bg-surface-container" />
        <div className="glass-panel h-24 rounded-xl bg-surface-container" />
      </div>

      <div className="glass-panel h-48 rounded-xl bg-surface-container" />
    </main>
  );
}
