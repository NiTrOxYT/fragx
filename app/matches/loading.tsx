export default function MatchesLoading() {
  return (
    <main className="pt-20 px-safe-margin max-w-3xl mx-auto space-y-stack-lg md:pt-16 pb-24 w-full animate-pulse">
      <div className="flex flex-col space-y-4 pt-4">
        <div className="h-8 w-48 bg-surface-container-high rounded" />
        <div className="flex space-x-2">
          <div className="h-9 w-28 bg-surface-container-high rounded-full" />
          <div className="h-9 w-36 bg-surface-container-high rounded-full" />
          <div className="h-9 w-28 bg-surface-container-high rounded-full" />
        </div>
      </div>

      <div className="space-y-4">
        <div className="h-4 w-32 bg-surface-container-high rounded" />
        <div className="glass-panel h-20 rounded-xl bg-surface-container" />
        <div className="glass-panel h-20 rounded-xl bg-surface-container" />
        <div className="glass-panel h-20 rounded-xl bg-surface-container" />
      </div>
    </main>
  );
}
