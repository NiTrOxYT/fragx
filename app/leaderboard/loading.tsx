export default function LeaderboardLoading() {
  return (
    <main className="flex-1 w-full max-w-md mx-auto px-safe-margin flex flex-col gap-6 mt-4 pt-20 pb-24 animate-pulse">
      <div className="flex flex-col space-y-3">
        <div className="h-7 w-48 bg-surface-container-high rounded" />
        <div className="h-10 w-full bg-surface-container rounded-lg" />
      </div>

      <div className="glass-panel rounded-xl h-[400px] bg-surface-container p-4 space-y-4">
        <div className="h-8 bg-surface-container-high rounded w-full" />
        <div className="h-12 bg-surface-container-high rounded w-full" />
        <div className="h-12 bg-surface-container-high rounded w-full" />
        <div className="h-12 bg-surface-container-high rounded w-full" />
        <div className="h-12 bg-surface-container-high rounded w-full" />
      </div>
    </main>
  );
}
