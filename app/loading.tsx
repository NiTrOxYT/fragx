export default function HomeLoading() {
  return (
    <main className="pt-24 px-safe-margin max-w-7xl mx-auto space-y-stack-lg flex flex-col items-center w-full pb-[100px] md:pb-12 animate-pulse">
      {/* MVP Hero Skeleton */}
      <div className="w-full max-w-3xl glass-panel h-64 rounded-xl border border-surface-container-high p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="w-32 h-32 rounded-full bg-surface-container-high flex-shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <div className="h-4 w-32 bg-surface-container-high rounded" />
          <div className="h-8 w-48 bg-surface-container-high rounded" />
          <div className="h-4 w-full bg-surface-container-high rounded" />
        </div>
        <div className="h-12 w-20 bg-surface-container-high rounded flex-shrink-0" />
      </div>

      {/* Summary Grid Skeleton */}
      <div className="w-full max-w-3xl space-y-3">
        <div className="h-4 w-36 bg-surface-container-high rounded pl-2" />
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <div className="glass-panel h-28 rounded-lg bg-surface-container" />
          <div className="glass-panel h-28 rounded-lg bg-surface-container" />
          <div className="glass-panel h-28 rounded-lg bg-surface-container" />
        </div>
      </div>

      {/* Recent Matches Skeleton */}
      <div className="w-full max-w-3xl space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-4 w-36 bg-surface-container-high rounded" />
          <div className="h-4 w-16 bg-surface-container-high rounded" />
        </div>
        <div className="space-y-3">
          <div className="glass-panel h-16 rounded-lg bg-surface-container" />
          <div className="glass-panel h-16 rounded-lg bg-surface-container" />
          <div className="glass-panel h-16 rounded-lg bg-surface-container" />
        </div>
      </div>
    </main>
  );
}
