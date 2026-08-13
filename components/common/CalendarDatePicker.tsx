"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface CalendarDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (dateStr: string) => void;
  label?: string;
}

export default function CalendarDatePicker({
  value,
  onChange,
  label = "SESSION DATE",
}: CalendarDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [popoverStyle, setPopoverStyle] = useState<{
    top: number;
    left: number;
    width: number;
  }>({ top: 0, left: 0, width: 320 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Parse YYYY-MM-DD safely into year, month (0-11), day
  const parseYMD = (ymd: string) => {
    const parts = ymd.split("-").map(Number);
    if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
      return { year: parts[0], month: parts[1] - 1, day: parts[2] };
    }
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
  };

  const selectedYMD = parseYMD(value);

  // Calendar view state (current displayed month & year)
  const [viewYear, setViewYear] = useState(selectedYMD.year);
  const [viewMonth, setViewMonth] = useState(selectedYMD.month);

  useEffect(() => {
    const parsed = parseYMD(value);
    setViewYear(parsed.year);
    setViewMonth(parsed.month);
  }, [value]);

  // Position calculation function
  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(320, window.innerWidth - 32);

    let left = rect.left;
    if (left + popoverWidth > window.innerWidth - 16) {
      left = window.innerWidth - popoverWidth - 16;
    }
    if (left < 16) left = 16;

    const estimatedHeight = 360;
    let top = rect.bottom + window.scrollY + 8;
    // Position above if close to bottom of viewport
    if (rect.bottom + estimatedHeight > window.innerHeight && rect.top > estimatedHeight) {
      top = rect.top + window.scrollY - estimatedHeight - 8;
    }

    setPopoverStyle({ top, left, width: popoverWidth });
  };

  useEffect(() => {
    if (!isOpen) return;

    updatePosition();

    const handleScrollOrResize = () => {
      updatePosition();
    };

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplay = (ymd: { year: number; month: number; day: number }) => {
    const dateObj = new Date(Date.UTC(ymd.year, ymd.month, ymd.day));
    return dateObj
      .toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      })
      .toUpperCase();
  };

  const formatToYMD = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const ymd = formatToYMD(viewYear, viewMonth, day);
    onChange(ymd);
    setIsOpen(false);
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const ymd = formatToYMD(today.getFullYear(), today.getMonth(), today.getDate());
    onChange(ymd);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  // Calendar calculations for viewMonth/viewYear
  const firstDayOfWeek = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();

  const monthNames = [
    "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
    "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
  ];

  const today = new Date();
  const isTodayDisplayed =
    today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayDay = today.getDate();

  const popoverContent = (
    <div
      ref={popoverRef}
      style={{
        position: "absolute",
        top: `${popoverStyle.top}px`,
        left: `${popoverStyle.left}px`,
        width: `${popoverStyle.width}px`,
        zIndex: 9999,
      }}
      className="bg-[#171717]/95 backdrop-blur-xl border border-primary/40 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] space-y-4 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>

        <span className="font-headline text-headline-sm text-on-surface tracking-wide">
          {monthNames[viewMonth]} {viewYear}
        </span>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 text-center font-label-caps text-[10px] text-on-surface-variant font-bold tracking-wider">
        <span>SUN</span>
        <span>MON</span>
        <span>TUE</span>
        <span>WED</span>
        <span>THU</span>
        <span>FRI</span>
        <span>SAT</span>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1 text-center font-label-caps text-xs">
        {/* Empty cells for padding */}
        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
          <div key={`pad-${idx}`} className="h-8" />
        ))}

        {/* Days of current month */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;
          const isSelected =
            selectedYMD.year === viewYear &&
            selectedYMD.month === viewMonth &&
            selectedYMD.day === dayNum;

          const isCurrentToday = isTodayDisplayed && todayDay === dayNum;

          return (
            <button
              key={`day-${dayNum}`}
              type="button"
              onClick={() => handleSelectDay(dayNum)}
              className={`h-8 w-8 mx-auto rounded-lg flex items-center justify-center transition-all ${
                isSelected
                  ? "bg-[#FF4D00] text-white font-bold shadow-[0_0_12px_rgba(255,77,0,0.5)]"
                  : isCurrentToday
                  ? "border border-primary text-primary font-bold bg-primary/10"
                  : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              {dayNum}
            </button>
          );
        })}
      </div>

      {/* Footer Shortcuts */}
      <div className="pt-2 border-t border-surface-container-high flex justify-between items-center">
        <button
          type="button"
          onClick={handleSelectToday}
          className="text-xs text-primary font-label-caps uppercase hover:underline font-bold"
        >
          Select Today
        </button>

        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="text-xs text-on-surface-variant font-label-caps uppercase hover:text-on-surface"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="w-full flex flex-col gap-1.5">
      <label className="font-label-caps text-xs text-on-surface-variant uppercase">
        {label}
      </label>

      {/* Input Field Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-surface-container border border-surface-container-high hover:border-primary rounded-xl px-4 py-3 font-label-caps text-label-caps text-on-surface flex items-center justify-between transition-colors text-left focus:outline-none focus:border-primary"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
          <span>📅 {formatDisplay(selectedYMD)}</span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant text-sm">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {/* Calendar Portal */}
      {isOpen && isMounted && createPortal(popoverContent, document.body)}
    </div>
  );
}
