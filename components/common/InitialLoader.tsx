"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function InitialLoader() {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    try {
      const hasSeen = sessionStorage.getItem("fragx_initial_loader_seen");
      if (hasSeen) {
        setIsDone(true);
        return;
      }
    } catch {
      // If sessionStorage disabled in strict mode
      setIsDone(true);
      return;
    }

    // First visit in session: show loader
    setIsVisible(true);

    // Fade out sequence
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      try {
        sessionStorage.setItem("fragx_initial_loader_seen", "true");
      } catch {}
    }, 950);

    // Complete removal from DOM
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      setIsDone(true);
    }, 1500);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (isDone || !isVisible) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#050505] flex flex-col items-center justify-center select-none overflow-hidden transition-opacity duration-600 ease-out ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      }`}
      aria-hidden="true"
    >
      {/* Ambient Esports Atmospheric Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-80 h-80 sm:w-96 sm:h-96 bg-cyan-500/15 blur-[120px] rounded-full" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 sm:w-96 sm:h-96 bg-amber-500/15 blur-[120px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* Center Branded Loader Hub */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 max-w-sm text-center">
        {/* FRAGX Glowing Emblem */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          {/* Pulsing Aura Rings */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-primary/20 to-amber-500/20 blur-xl animate-pulse" />
          <div className="relative w-full h-full rounded-2xl p-0.5 bg-gradient-to-b from-white/20 via-white/5 to-transparent border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-[0.9rem] bg-[#070912] flex items-center justify-center p-3">
              <img
                src="/images/logo.png"
                alt="FRAGX"
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,77,0,0.5)] animate-in zoom-in-75 duration-700"
              />
            </div>
          </div>
        </div>

        {/* Loading Eyebrow */}
        <div className="flex flex-col items-center gap-2.5">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold tracking-[0.25em] text-white/80 uppercase font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LOADING BATTLEFIELD...</span>
          </div>

          {/* Thin Futuristic Progress Bar */}
          <div className="w-48 sm:w-56 h-[3px] rounded-full bg-white/10 overflow-hidden relative">
            <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-400 via-primary-cta to-amber-400 w-full animate-[fragx-progress_1s_ease-in-out_infinite]" />
          </div>

          <span className="text-[9px] font-mono text-white/40 tracking-[0.15em] uppercase">
            BGMI COMPETITIVE NETWORK
          </span>
        </div>
      </div>
    </div>
  );
}
