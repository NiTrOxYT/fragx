import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 w-full max-w-md mx-auto px-safe-margin pt-32 pb-24 flex flex-col items-center justify-center text-center">
      <div className="glass-panel rounded-2xl p-8 space-y-6 w-full border border-outline-variant/30">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto">
          <span className="material-symbols-outlined text-4xl">search_off</span>
        </div>
        <h2 className="font-headline text-headline-lg text-on-surface">404 - PAGE NOT FOUND</h2>
        <p className="font-body text-body-md text-on-surface-variant">
          The battlefield coordinate you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block w-full bg-primary-cta text-white font-label-caps text-label-caps py-4 rounded-xl hover:bg-primary-container active:scale-[0.98] transition-all uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(255,77,0,0.3)]"
        >
          RETURN TO HOME
        </Link>
      </div>
    </main>
  );
}
