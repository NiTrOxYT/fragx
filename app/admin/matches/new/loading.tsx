export default function NewMatchLoading() {
  return (
    <main className="max-w-md mx-auto px-safe-margin pt-20 pb-24 flex flex-col gap-6 w-full animate-pulse">
      <div className="flex flex-col items-center space-y-2">
        <div className="h-7 w-44 bg-surface-container-high rounded" />
        <div className="h-4 w-64 bg-surface-container-high rounded" />
      </div>

      <div className="glass-panel h-80 rounded-xl bg-surface-container p-6 space-y-4">
        <div className="h-10 bg-surface-container-high rounded" />
        <div className="h-10 bg-surface-container-high rounded" />
        <div className="h-10 bg-surface-container-high rounded" />
      </div>
    </main>
  );
}
