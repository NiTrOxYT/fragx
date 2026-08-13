"use client";

import { useEffect } from "react";
import Image from "next/image";

interface ScreenshotModalProps {
  isOpen: boolean;
  src: string;
  alt?: string;
  onClose: () => void;
}

export default function ScreenshotModal({
  isOpen,
  src,
  alt = "Match end screen proof",
  onClose,
}: ScreenshotModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label="Close screenshot modal"
        className="absolute top-4 right-4 z-[101] w-12 h-12 rounded-full bg-surface-container/80 border border-outline-variant/50 text-on-surface flex items-center justify-center hover:bg-surface-container-high active:scale-95 transition-all"
      >
        <span className="material-symbols-outlined text-2xl">close</span>
      </button>

      <div
        className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center overflow-hidden rounded-xl border border-surface-container-high shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain rounded-xl"
        />
      </div>
    </div>
  );
}
