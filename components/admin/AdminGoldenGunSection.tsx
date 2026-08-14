"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import type {
  SessionGoldenGunDetails,
  GoldenGunCandidate,
} from "@/lib/services/goldengun";

export interface GoldenGunSessionItem {
  id: string;
  dateStr: string;
  status: string;
  hasAward: boolean;
  winnerName: string | null;
}

interface AdminGoldenGunSectionProps {
  initialDetails: SessionGoldenGunDetails | null;
  initialSessions: GoldenGunSessionItem[];
}

export default function AdminGoldenGunSection({
  initialDetails,
  initialSessions,
}: AdminGoldenGunSectionProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<GoldenGunSessionItem[]>(initialSessions);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    initialDetails?.sessionId || initialSessions[0]?.id || ""
  );
  const [details, setDetails] = useState<SessionGoldenGunDetails | null>(initialDetails);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Assign Modal
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState<GoldenGunCandidate | null>(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{
    type: "ASSIGN" | "REPLACE" | "REMOVE";
    candidate?: GoldenGunCandidate;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch session details when selected session changes
  const fetchSessionDetails = async (sessionId: string) => {
    if (!sessionId) return;
    setIsLoading(true);
    setErrorMsg("");
    setActionMsg("");
    try {
      const res = await fetch(`/api/golden-gun?sessionId=${sessionId}`);
      const data = await res.json();
      if (res.ok) {
        setDetails(data.details);
        if (data.sessions) {
          setSessions(data.sessions);
        }
      } else {
        setErrorMsg(data.error || "Failed to load session details");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Network error loading session");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionChange = (newSessionId: string) => {
    setSelectedSessionId(newSessionId);
    fetchSessionDetails(newSessionId);
  };

  const handleOpenAssignModal = () => {
    setSearchQuery("");
    setSelectedCandidate(details?.winner || details?.candidates[0] || null);
    setIsAssignModalOpen(true);
  };

  const handleInitiateAward = (candidate: GoldenGunCandidate) => {
    if (details?.winner && details.winner.id !== candidate.id) {
      // Show replace confirmation
      setConfirmModal({
        type: "REPLACE",
        candidate,
      });
    } else {
      // Show assign confirmation
      setConfirmModal({
        type: "ASSIGN",
        candidate,
      });
    }
  };

  const handleExecuteAward = async () => {
    if (!confirmModal?.candidate || !details?.sessionId) return;
    setIsSubmitting(true);
    setErrorMsg("");
    setActionMsg("");

    try {
      const res = await fetch("/api/golden-gun", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: details.sessionId,
          playerId: confirmModal.candidate.id,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setActionMsg(
          `🏆 Golden Gun successfully awarded to ${confirmModal.candidate.name}!`
        );
        setConfirmModal(null);
        setIsAssignModalOpen(false);
        await fetchSessionDetails(details.sessionId);
        router.refresh();
      } else {
        setErrorMsg(data.error || "Failed to assign Golden Gun award");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to assign award");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteRemove = async () => {
    if (!details?.sessionId) return;
    setIsSubmitting(true);
    setErrorMsg("");
    setActionMsg("");

    try {
      const res = await fetch(`/api/golden-gun/${details.sessionId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setActionMsg("Golden Gun award removed from this session.");
        setConfirmModal(null);
        await fetchSessionDetails(details.sessionId);
        router.refresh();
      } else {
        setErrorMsg(data.error || "Failed to remove Golden Gun award");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to remove award");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCandidates = (details?.candidates || []).filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="flex flex-col gap-stack-lg animate-in fade-in duration-300">
      {/* Notifications */}
      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-label-caps text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          {actionMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-error-container/20 border border-error/30 text-error font-label-caps text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {errorMsg}
        </div>
      )}

      {/* Top Header & Session Selector */}
      <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-surface-container-high flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <h2 className="font-headline text-lg sm:text-xl text-white font-bold tracking-tight">
              GOLDEN GUN AWARD MANAGEMENT
            </h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-1">
            Awarded to the player with the highest cumulative kills across an entire gaming night.
          </p>
        </div>

        {/* Session Dropdown Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <label
            htmlFor="session-select"
            className="font-label-caps text-xs text-on-surface-variant uppercase font-bold shrink-0"
          >
            SESSION:
          </label>
          <select
            id="session-select"
            value={selectedSessionId}
            onChange={(e) => handleSessionChange(e.target.value)}
            disabled={isLoading}
            className="flex-1 md:w-56 bg-[#161616] border border-surface-container-high rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-gold/60 transition-colors"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.dateStr} ({s.status}){s.hasAward ? " • 🏆" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Award Display Box */}
      {isLoading ? (
        <div className="glass-panel p-12 rounded-2xl border border-surface-container-high flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-3xl animate-spin text-gold">
            progress_activity
          </span>
          <span className="font-label-caps text-xs uppercase tracking-widest">
            Loading session battlefield stats...
          </span>
        </div>
      ) : details ? (
        <div className="flex flex-col gap-6">
          {/* Status Box: Winner / Tie / Unassigned */}
          {details.winner ? (
            <div className="relative rounded-2xl border border-[#D4AF37]/50 bg-[#0D0D0D] p-6 sm:p-8 overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.1)]">
              {/* Gold Esports Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#FF4D00]/5 blur-[80px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
                {/* Winner Card Info */}
                <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
                  {/* Player Avatar */}
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-[#D4AF37] overflow-hidden p-0.5 bg-gradient-to-b from-[#2A2312] to-[#120F08] shadow-[0_0_25px_rgba(212,175,55,0.3)]">
                      <img
                        src={details.winner.avatarUrl || "/images/avatar-1.png"}
                        alt={details.winner.name}
                        className="w-full h-full object-cover rounded-[0.9rem]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/images/avatar-1.png";
                        }}
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[#161616] border border-[#D4AF37] flex items-center justify-center text-sm shadow-md">
                      🏆
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 justify-center lg:justify-start">
                      <span className="font-label-caps text-xs font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                        🏆 GOLDEN GUN HOLDER
                      </span>
                      {details.isManual && (
                        <span className="px-2 py-0.5 rounded-md bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D76E] text-[10px] font-mono font-bold uppercase">
                          MANUAL OVERRIDE
                        </span>
                      )}
                    </div>

                    <h3 className="font-headline text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                      {details.winner.name}
                    </h3>

                    <div className="flex items-center gap-2 justify-center lg:justify-start text-xs font-mono text-on-surface-variant">
                      <span>SESSION: {details.sessionDate}</span>
                      <span>•</span>
                      <span className="text-emerald-400">{details.sessionStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Kill Counter & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end gap-4 shrink-0">
                  <div className="flex flex-col items-center lg:items-end bg-surface-container/60 border border-surface-container-high px-5 py-3 rounded-xl">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-stat-value text-3xl sm:text-4xl text-[#F5D76E] font-extrabold font-mono drop-shadow-[0_0_12px_rgba(245,215,110,0.3)]">
                        {details.winner.totalKills}
                      </span>
                      <span className="font-label-caps text-sm text-[#F5D76E] font-bold">
                        KILLS
                      </span>
                    </div>
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">
                      CUMULATIVE SESSION TOTAL
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleOpenAssignModal}
                      className="px-4 py-2 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 hover:bg-[#D4AF37]/25 text-[#F5D76E] font-label-caps text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                      CHANGE WINNER
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmModal({ type: "REMOVE" })}
                      className="px-4 py-2 rounded-xl bg-error-container/20 border border-error/30 hover:bg-error-container/40 text-error font-label-caps text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                      REMOVE AWARD
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : details.isTie ? (
            /* Tie Detected Banner */
            <div className="rounded-2xl border border-amber-500/50 bg-[#161208] p-6 sm:p-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-amber-400 text-3xl">warning</span>
                <div>
                  <h3 className="font-headline text-lg sm:text-xl font-bold text-amber-400 uppercase tracking-tight">
                    GOLDEN GUN — TIE DETECTED
                  </h3>
                  <p className="font-body text-xs sm:text-sm text-on-surface-variant mt-0.5">
                    Multiple players achieved the exact same highest kill total ({details.totalKills} kills) in this session.
                    Admin selection is required to determine the winner.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {details.tiedPlayers.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container border border-amber-500/30"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatarUrl || "/images/avatar-1.png"}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-amber-500/40"
                      />
                      <div>
                        <span className="font-headline font-bold text-sm text-white block">
                          {p.name}
                        </span>
                        <span className="font-mono text-xs text-amber-400 font-bold">
                          {p.totalKills} KILLS
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInitiateAward(p)}
                      className="px-3 py-1.5 rounded-lg bg-amber-500 text-black font-label-caps text-xs font-bold uppercase hover:bg-amber-400 transition-colors"
                    >
                      AWARD
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleOpenAssignModal}
                  className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-black font-label-caps text-xs font-bold uppercase tracking-wider hover:bg-[#e0bb3e] transition-colors"
                >
                  SELECT WINNER (ALL PLAYERS)
                </button>
              </div>
            </div>
          ) : (
            /* Unassigned / Empty Session */
            <div className="glass-panel p-8 sm:p-12 rounded-2xl border border-surface-container-high text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-container border border-surface-container-high flex items-center justify-center text-3xl">
                🏆
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className="font-headline text-lg font-bold text-white uppercase">
                  NO GOLDEN GUN AWARD ASSIGNED
                </h3>
                <p className="font-body text-xs text-on-surface-variant">
                  No Golden Gun award has been assigned for session{" "}
                  <span className="text-white font-mono">{details.sessionDate}</span>.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenAssignModal}
                disabled={details.candidates.length === 0}
                className="px-6 py-2.5 rounded-xl bg-primary-cta hover:bg-primary-container text-white font-label-caps text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(255,77,0,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">military_tech</span>
                ASSIGN GOLDEN GUN
              </button>
            </div>
          )}

          {/* Session Player Frags Roster */}
          <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-surface-container-high space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-headline text-base font-bold text-white uppercase">
                  SESSION BATTLEFIELD PARTICIPANTS ({details.candidates.length})
                </h4>
                <p className="font-body text-xs text-on-surface-variant">
                  Calculated cumulative kills for {details.sessionDate}
                </p>
              </div>
            </div>

            {details.candidates.length === 0 ? (
              <div className="p-8 text-center text-xs text-on-surface-variant font-mono">
                No player match records found for this session date.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {details.candidates.map((player, idx) => {
                  const isCurrentWinner = details.winner?.id === player.id;
                  return (
                    <div
                      key={player.id}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isCurrentWinner
                          ? "bg-[#D4AF37]/10 border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.1)]"
                          : "bg-surface-container/50 border-surface-container-high hover:border-surface-variant"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs text-on-surface-variant shrink-0 w-4">
                          #{idx + 1}
                        </span>
                        <img
                          src={player.avatarUrl || "/images/avatar-1.png"}
                          alt={player.name}
                          className="w-9 h-9 rounded-lg object-cover shrink-0 border border-surface-container-high"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/avatar-1.png";
                          }}
                        />
                        <div className="min-w-0">
                          <span className="font-headline font-bold text-xs text-white truncate block">
                            {player.name}
                          </span>
                          {isCurrentWinner && (
                            <span className="font-label-caps text-[9px] text-[#F5D76E] font-bold uppercase">
                              🏆 WINNER
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className="font-mono font-bold text-sm text-white block">
                          {player.totalKills}
                        </span>
                        <span className="font-label-caps text-[9px] text-on-surface-variant">
                          KILLS
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* ASSIGN / CHANGE WINNER MODAL */}
      {isAssignModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg rounded-2xl bg-[#111111] border border-surface-container-high shadow-2xl p-6 space-y-5 max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-surface-container-high pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    <h3 className="font-headline text-lg font-bold text-white uppercase tracking-tight">
                      ASSIGN GOLDEN GUN
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-on-surface-variant">
                      SESSION:
                    </span>
                    <span className="font-mono text-xs text-[#D4AF37] font-bold">
                      {details?.sessionDate}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="p-1 rounded-lg text-on-surface-variant hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search player..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#161616] border border-surface-container-high rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-on-surface-variant focus:outline-none focus:border-[#D4AF37]/60 font-mono transition-colors"
                />
              </div>

              {/* Candidate Roster Selection List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
                {filteredCandidates.length === 0 ? (
                  <div className="p-8 text-center text-xs text-on-surface-variant font-mono">
                    No matching participating players found.
                  </div>
                ) : (
                  filteredCandidates.map((candidate) => {
                    const isSelected = selectedCandidate?.id === candidate.id;
                    const isCurrentWinner = details?.winner?.id === candidate.id;

                    return (
                      <button
                        key={candidate.id}
                        type="button"
                        onClick={() => setSelectedCandidate(candidate)}
                        className={`w-full p-3 rounded-xl border flex items-center justify-between gap-3 text-left transition-all ${
                          isSelected
                            ? "bg-[#D4AF37]/15 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]"
                            : "bg-surface-container/60 border-surface-container-high hover:border-surface-variant"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Radio Marker */}
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "border-[#D4AF37] bg-[#D4AF37]"
                                : "border-surface-container-high"
                            }`}
                          >
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-black" />
                            )}
                          </div>

                          <img
                            src={candidate.avatarUrl || "/images/avatar-1.png"}
                            alt={candidate.name}
                            className="w-8 h-8 rounded-lg object-cover border border-surface-container-high shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/avatar-1.png";
                            }}
                          />

                          <div className="min-w-0">
                            <span className="font-headline font-bold text-xs text-white truncate block">
                              {candidate.name}
                            </span>
                            {isCurrentWinner && (
                              <span className="font-label-caps text-[9px] text-[#F5D76E] font-bold uppercase">
                                CURRENT WINNER
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span className="font-mono font-bold text-xs text-[#F5D76E]">
                            {candidate.totalKills} KILLS
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container-high">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant hover:text-white font-label-caps text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  CANCEL
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (selectedCandidate) {
                      handleInitiateAward(selectedCandidate);
                    }
                  }}
                  disabled={!selectedCandidate}
                  className="px-6 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e0bb3e] text-black font-label-caps text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">military_tech</span>
                  AWARD GOLDEN GUN
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* CONFIRMATION MODAL (Assign / Replace / Remove) */}
      {confirmModal &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="relative w-full max-w-md rounded-2xl bg-[#111111] border border-surface-container-high shadow-2xl p-6 space-y-5">
              {confirmModal.type === "REPLACE" && confirmModal.candidate ? (
                <>
                  <div className="flex items-center gap-3 text-amber-400">
                    <span className="material-symbols-outlined text-2xl">swap_horiz</span>
                    <h3 className="font-headline text-base font-bold uppercase tracking-tight">
                      GOLDEN GUN ALREADY ASSIGNED
                    </h3>
                  </div>

                  <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    <span className="font-bold text-white">{details?.winner?.name}</span> currently
                    holds the Golden Gun award for{" "}
                    <span className="font-mono text-white">{details?.sessionDate}</span>.
                    <br />
                    <br />
                    Replace the winner with{" "}
                    <span className="font-bold text-[#F5D76E]">{confirmModal.candidate.name}</span> (
                    {confirmModal.candidate.totalKills} session kills)?
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
                    <button
                      type="button"
                      onClick={() => setConfirmModal(null)}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant font-label-caps text-xs font-bold uppercase"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteAward}
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-label-caps text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                      {isSubmitting && (
                        <span className="material-symbols-outlined text-sm animate-spin">
                          progress_activity
                        </span>
                      )}
                      REPLACE WINNER
                    </button>
                  </div>
                </>
              ) : confirmModal.type === "REMOVE" ? (
                <>
                  <div className="flex items-center gap-3 text-error">
                    <span className="material-symbols-outlined text-2xl">delete</span>
                    <h3 className="font-headline text-base font-bold uppercase tracking-tight">
                      REMOVE GOLDEN GUN?
                    </h3>
                  </div>

                  <p className="font-body text-xs sm:text-sm text-on-surface-variant leading-relaxed">
                    This will remove the Golden Gun award from session{" "}
                    <span className="font-mono text-white">{details?.sessionDate}</span>.
                    The cumulative count on the player's profile and leaderboard will be updated.
                  </p>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
                    <button
                      type="button"
                      onClick={() => setConfirmModal(null)}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant font-label-caps text-xs font-bold uppercase"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteRemove}
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-error hover:bg-error/90 text-white font-label-caps text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                      {isSubmitting && (
                        <span className="material-symbols-outlined text-sm animate-spin">
                          progress_activity
                        </span>
                      )}
                      REMOVE AWARD
                    </button>
                  </div>
                </>
              ) : confirmModal.candidate ? (
                <>
                  <div className="flex items-center gap-3 text-[#D4AF37]">
                    <span className="material-symbols-outlined text-2xl">military_tech</span>
                    <h3 className="font-headline text-base font-bold uppercase tracking-tight">
                      AWARD GOLDEN GUN TO {confirmModal.candidate.name}?
                    </h3>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">SESSION:</span>
                      <span className="text-white font-bold">{details?.sessionDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">SESSION KILLS:</span>
                      <span className="text-[#F5D76E] font-bold">
                        {confirmModal.candidate.totalKills}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
                    <button
                      type="button"
                      onClick={() => setConfirmModal(null)}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant font-label-caps text-xs font-bold uppercase"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteAward}
                      disabled={isSubmitting}
                      className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e0bb3e] text-black font-label-caps text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                    >
                      {isSubmitting && (
                        <span className="material-symbols-outlined text-sm animate-spin">
                          progress_activity
                        </span>
                      )}
                      CONFIRM AWARD
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
