"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AccessGateClient() {
  const [accessKey, setAccessKey] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessKey.trim()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessKey: accessKey.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Invalid Access Key");
      } else {
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-safe-margin">
      <div className="w-full max-w-md glass-panel rounded-2xl p-8 border border-primary/30 shadow-[0_0_30px_rgba(255,181,158,0.1)] flex flex-col items-center text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(255,181,158,0.2)]">
          <span className="material-symbols-outlined text-4xl">key</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-headline text-headline-lg tracking-tight text-on-surface">
            FRAGX ACCESS GATE
          </h1>
          <p className="font-body text-body-md text-on-surface-variant">
            Enter your squad's private access key to enter the battlefield.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="space-y-2 text-left">
            <label
              htmlFor="access-key-input"
              className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest block"
            >
              ACCESS KEY
            </label>
            <input
              id="access-key-input"
              type="password"
              value={accessKey}
              onChange={(e) => {
                setAccessKey(e.target.value);
                setErrorMsg("");
              }}
              placeholder="••••••••"
              required
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3.5 font-stat-value text-stat-value text-center tracking-widest text-on-surface focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-error-container/40 border border-error/40 text-error font-body text-sm text-center">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#FF4D00] text-white font-label-caps text-label-caps py-4 rounded-xl primary-glow hover:bg-primary-container active:scale-[0.98] transition-all uppercase tracking-widest font-bold disabled:opacity-50"
          >
            {isSubmitting ? "VERIFYING KEY..." : "ENTER BATTLEFIELD"}
          </button>
        </form>
      </div>
    </div>
  );
}
