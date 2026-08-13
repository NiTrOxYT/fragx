"use client";

import { useState, useRef, useEffect } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
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

  const handleSelectToday = () => {
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

  return (
    <div ref={containerRef} className="relative w-full flex flex-col gap-base">
      <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
        {label}
      </label>

      {/* Input Field Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-surface-container border border-surface-container-high hover:border-primary rounded-lg px-4 py-3 font-label-caps text-label-caps text-on-surface flex items-center justify-between transition-colors text-left focus:outline-none focus:border-primary"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
          <span>{formatDisplay(selectedYMD)}</span>
        </div>
        <span className="material-symbols-outlined text-on-surface-variant text-sm">
          {isOpen ? "expand_less" : "expand_more"}
        </span>
      </button>

      {/* Calendar Popover */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full sm:w-80 glass-panel rounded-xl p-4 border border-surface-container-high shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Calendar Header */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>

            <span className="font-headline text-headline-sm text-on-surface">
              {monthNames[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 text-on-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 text-center font-label-caps text-[10px] text-on-surface-variant/70 font-bold">
            <span>SU</span>
            <span>MO</span>
            <span>TU</span>
            <span>WE</span>
            <span>TH</span>
            <span>FR</span>
            <span>SA</span>
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
                      ? "bg-primary text-on-primary font-bold shadow-[0_0_10px_rgba(255,77,0,0.4)]"
                      : isCurrentToday
                      ? "border border-primary text-primary font-bold"
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
              className="text-xs text-primary font-label-caps hover:underline"
            >
              Select Today
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs text-on-surface-variant font-label-caps hover:text-on-surface"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
