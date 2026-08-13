import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon = "sports_esports",
  title,
  description,
  actionText,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="glass-panel rounded-xl p-stack-lg flex flex-col items-center justify-center text-center my-stack-md space-y-stack-sm border border-outline-variant/30">
      <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary/70 mb-2">
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <h3 className="font-headline-md text-headline-md text-on-surface uppercase tracking-tight">
        {title}
      </h3>
      {description && (
        <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-6 py-3 rounded-xl bg-primary-cta text-white font-label-caps text-label-caps uppercase tracking-wider hover:bg-primary-container active:scale-95 transition-all shadow-[0_0_15px_rgba(255,77,0,0.3)]"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
