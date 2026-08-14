"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CalendarDatePicker from "@/components/common/CalendarDatePicker";

interface PlayerOption {
  id: string;
  name: string;
}

interface TeamOption {
  id: string;
  name: string;
}

interface SessionOption {
  id: string;
  dateStr: string;
  status: string;
}

interface ExistingMatchProps {
  id: string;
  matchNumber: number;
  sessionDate: string; // YYYY-MM-DD
  screenshotUrl: string;
  duration?: string;
  matchTeams: {
    teamId: string;
    placement: number;
    players: {
      playerId: string;
      kills: number;
    }[];
  }[];
}

interface EditMatchFormClientProps {
  existingMatch: ExistingMatchProps;
  sessions: SessionOption[];
  initialPlayers: PlayerOption[];
  initialTeams: TeamOption[];
}

interface SelectedTeamState {
  teamId: string;
  placement: number;
  playerKills: { [playerId: string]: number }; // playerId -> kills
}

export default function EditMatchFormClient({
  existingMatch,
  initialPlayers,
  initialTeams,
}: EditMatchFormClientProps) {
  const router = useRouter();

  // Match Date
  const [sessionDate, setSessionDate] = useState<string>(existingMatch.sessionDate);

  // Match Number
  const [matchNumber, setMatchNumber] = useState<number>(existingMatch.matchNumber);

  // Number of teams
  const [teamCount, setTeamCount] = useState<number>(
    Math.max(1, existingMatch.matchTeams.length)
  );

  // Selected teamIds
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(() => {
    return existingMatch.matchTeams.map((t) => t.teamId);
  });

  // Match screenshot mode & URL
  const [screenshotMode, setScreenshotMode] = useState<"URL" | "UPLOAD">("URL");
  const [screenshotUrl, setScreenshotUrl] = useState(existingMatch.screenshotUrl);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(existingMatch.screenshotUrl);

  // Team Data (placement, players & kills)
  const [teamData, setTeamData] = useState<{ [teamIndex: number]: SelectedTeamState }>(() => {
    const initialMap: { [teamIndex: number]: SelectedTeamState } = {};
    existingMatch.matchTeams.forEach((t, idx) => {
      const killsMap: { [pId: string]: number } = {};
      t.players.forEach((p) => {
        killsMap[p.playerId] = p.kills;
      });
      initialMap[idx] = {
        teamId: t.teamId,
        placement: t.placement,
        playerKills: killsMap,
      };
    });
    return initialMap;
  });

  // UI state
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Adjust teamCount
  const handleTeamCountChange = (newCount: number) => {
    const validCount = Math.max(1, Math.min(25, newCount));
    setTeamCount(validCount);

    const updatedIds = [...selectedTeamIds];
    while (updatedIds.length < validCount) {
      const unselected = initialTeams.find((t) => !updatedIds.includes(t.id));
      updatedIds.push(unselected ? unselected.id : "");
    }
    const slicedIds = updatedIds.slice(0, validCount);
    setSelectedTeamIds(slicedIds);

    const updatedData: { [key: number]: SelectedTeamState } = {};
    for (let i = 0; i < validCount; i++) {
      updatedData[i] = teamData[i] || {
        teamId: slicedIds[i] || "",
        placement: i + 1,
        playerKills: {},
      };
    }
    setTeamData(updatedData);
  };

  // Change team selection for slot
  const handleTeamSelect = (index: number, newTeamId: string) => {
    const updatedIds = [...selectedTeamIds];
    updatedIds[index] = newTeamId;
    setSelectedTeamIds(updatedIds);

    setTeamData((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        teamId: newTeamId,
      },
    }));
  };

  // Change placement for slot
  const handlePlacementChange = (index: number, placement: number) => {
    setTeamData((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        placement: Math.max(1, placement),
      },
    }));
  };

  // Toggle player participation for a team slot
  const handleTogglePlayer = (teamIndex: number, playerId: string) => {
    setTeamData((prev) => {
      const currentSlot = prev[teamIndex] || {
        teamId: selectedTeamIds[teamIndex] || "",
        placement: teamIndex + 1,
        playerKills: {},
      };

      const updatedKills = { ...currentSlot.playerKills };
      if (updatedKills[playerId] !== undefined) {
        delete updatedKills[playerId];
      } else {
        // Enforce: Player cannot belong to multiple teams in the same match
        for (const idxStr of Object.keys(prev)) {
          const idx = Number(idxStr);
          if (idx !== teamIndex && prev[idx]?.playerKills[playerId] !== undefined) {
            setErrorMsg(
              `Player ${initialPlayers.find((p) => p.id === playerId)?.name} is already assigned to another team in this match.`
            );
            return prev;
          }
        }
        setErrorMsg("");
        updatedKills[playerId] = 0;
      }

      return {
        ...prev,
        [teamIndex]: {
          ...currentSlot,
          playerKills: updatedKills,
        },
      };
    });
  };

  // Update kills for player in a team slot
  const handleKillsChange = (teamIndex: number, playerId: string, kills: number) => {
    setTeamData((prev) => {
      const currentSlot = prev[teamIndex];
      if (!currentSlot) return prev;

      return {
        ...prev,
        [teamIndex]: {
          ...currentSlot,
          playerKills: {
            ...currentSlot.playerKills,
            [playerId]: Math.max(0, kills),
          },
        },
      };
    });
  };

  // Handle local image file upload preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreviewUrl(base64);
        setScreenshotUrl(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Form Validation
  const validateForm = (): boolean => {
    setErrorMsg("");

    if (!sessionDate) {
      setErrorMsg("Please select a session date.");
      return false;
    }

    if (matchNumber < 1) {
      setErrorMsg("Match number must be 1 or greater.");
      return false;
    }

    if (!screenshotUrl.trim()) {
      setErrorMsg("Match screenshot URL is required.");
      return false;
    }

    if (
      !screenshotUrl.startsWith("https://") &&
      !screenshotUrl.startsWith("data:image/")
    ) {
      setErrorMsg("Screenshot URL must use HTTPS (https://) or an uploaded image.");
      return false;
    }

    // Check duplicate teams
    const teamIdSet = new Set(selectedTeamIds);
    if (teamIdSet.size < selectedTeamIds.length) {
      setErrorMsg("Cannot select the same team twice in a match.");
      return false;
    }

    // Check duplicate placements
    const placements = Object.values(teamData).map((t) => t.placement);
    const placementSet = new Set(placements);
    if (placementSet.size < placements.length) {
      setErrorMsg("Each team must have a unique placement/rank.");
      return false;
    }

    // Check at least 1 player per team
    for (let i = 0; i < teamCount; i++) {
      const t = teamData[i];
      const playerIds = Object.keys(t?.playerKills || {});
      if (playerIds.length === 0) {
        const teamName =
          initialTeams.find((item) => item.id === t?.teamId)?.name || `Team ${i + 1}`;
        setErrorMsg(`Please select at least 1 player for ${teamName}.`);
        return false;
      }
    }

    return true;
  };

  const handleOpenReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsReviewOpen(true);
    }
  };

  const handleSaveMatch = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    const teamsPayload = selectedTeamIds.map((tId, idx) => {
      const data = teamData[idx];
      const playersList = Object.entries(data.playerKills).map(([playerId, kills]) => ({
        playerId,
        kills,
      }));

      return {
        teamId: tId,
        placement: data.placement,
        players: playersList,
      };
    });

    const payload = {
      sessionDate,
      matchNumber,
      screenshotUrl,
      duration: existingMatch.duration || "20:00 MIN",
      teams: teamsPayload,
    };

    try {
      const res = await fetch(`/api/matches/${existingMatch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to update match.");
        setIsReviewOpen(false);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Something went wrong while updating match.");
      setIsReviewOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate totals for review modal
  let totalKills = 0;
  Object.values(teamData).forEach((t) => {
    Object.values(t.playerKills).forEach((k) => {
      totalKills += k;
    });
  });

  return (
    <main className="flex-1 w-full max-w-4xl mx-auto px-safe-margin pt-header-safe md:pt-24 pb-24 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
        <div>
          <h2 className="font-headline text-headline-md text-on-surface uppercase">
            EDIT MATCH #{existingMatch.matchNumber}
          </h2>
          <p className="font-body text-body-md text-on-surface-variant text-xs mt-0.5">
            Update match session, teams, rankings, participating fraggers, and kill counts.
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant hover:text-on-surface font-label-caps text-xs transition-colors"
        >
          CANCEL
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-error/10 border border-error/40 text-error font-label-caps text-xs flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">warning</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleOpenReview} className="space-y-6">
        {/* STEP 1: SESSION DATE */}
        <section className="glass-panel rounded-2xl p-5 border border-surface-container-high space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="font-headline text-headline-sm text-on-surface uppercase">
              SESSION DATE
            </h3>
          </div>

          <CalendarDatePicker value={sessionDate} onChange={setSessionDate} />
        </section>

        {/* STEP 2: MATCH NUMBER */}
        <section className="glass-panel rounded-2xl p-5 border border-surface-container-high space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-headline text-headline-sm text-on-surface uppercase">
              MATCH NUMBER
            </h3>
          </div>

          <div className="max-w-xs">
            <input
              type="number"
              min={1}
              value={matchNumber}
              onChange={(e) => setMatchNumber(parseInt(e.target.value) || 1)}
              required
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-headline text-headline-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </section>

        {/* STEP 3: NUMBER OF TEAMS */}
        <section className="glass-panel rounded-2xl p-5 border border-surface-container-high space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-headline text-headline-sm text-on-surface uppercase">
              HOW MANY TEAMS PLAYED?
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleTeamCountChange(teamCount - 1)}
              disabled={teamCount <= 1}
              className="w-12 h-12 rounded-xl bg-surface-container border border-surface-container-high text-on-surface font-bold text-xl hover:bg-surface-container-high transition-colors disabled:opacity-40"
            >
              -
            </button>
            <span className="font-display-stat text-2xl text-primary w-10 text-center">
              {teamCount}
            </span>
            <button
              type="button"
              onClick={() => handleTeamCountChange(teamCount + 1)}
              disabled={teamCount >= 25}
              className="w-12 h-12 rounded-xl bg-surface-container border border-surface-container-high text-on-surface font-bold text-xl hover:bg-surface-container-high transition-colors disabled:opacity-40"
            >
              +
            </button>
          </div>
        </section>

        {/* STEP 4: SELECT TEAMS */}
        <section className="glass-panel rounded-2xl p-5 border border-surface-container-high space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
              4
            </span>
            <h3 className="font-headline text-headline-sm text-on-surface uppercase">
              SELECT PARTICIPATING TEAMS
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: teamCount }).map((_, idx) => (
              <div key={idx} className="space-y-1">
                <label className="font-label-caps text-xs text-on-surface-variant uppercase block">
                  TEAM {idx + 1}
                </label>
                <select
                  value={selectedTeamIds[idx] || ""}
                  onChange={(e) => handleTeamSelect(idx, e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-headline text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="">-- SELECT TEAM --</option>
                  {initialTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </section>

        {/* STEP 5: MATCH SCREENSHOT */}
        <section className="glass-panel rounded-2xl p-5 border border-surface-container-high space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
                5
              </span>
              <h3 className="font-headline text-headline-sm text-on-surface uppercase">
                MATCH SCREENSHOT
              </h3>
            </div>

            <div className="flex bg-surface-container rounded-lg p-1 border border-surface-container-high">
              <button
                type="button"
                onClick={() => setScreenshotMode("URL")}
                className={`px-3 py-1 rounded text-xs font-label-caps uppercase ${
                  screenshotMode === "URL"
                    ? "bg-primary text-on-primary font-bold"
                    : "text-on-surface-variant"
                }`}
              >
                PASTE URL
              </button>
              <button
                type="button"
                onClick={() => setScreenshotMode("UPLOAD")}
                className={`px-3 py-1 rounded text-xs font-label-caps uppercase ${
                  screenshotMode === "UPLOAD"
                    ? "bg-primary text-on-primary font-bold"
                    : "text-on-surface-variant"
                }`}
              >
                UPLOAD FILE
              </button>
            </div>
          </div>

          {screenshotMode === "URL" ? (
            <input
              type="url"
              value={screenshotUrl}
              onChange={(e) => {
                setScreenshotUrl(e.target.value);
                setPreviewUrl(e.target.value);
              }}
              placeholder="https://i.imgur.com/example.png"
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-on-surface-variant file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-label-caps file:bg-primary file:text-on-primary hover:file:opacity-90"
            />
          )}

          {/* Preview Container */}
          <div className="w-full h-44 rounded-xl border border-surface-container-high overflow-hidden bg-black/60 relative flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Screenshot Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-label-caps text-xs text-on-surface-variant">
                NO SCREENSHOT PREVIEW
              </span>
            )}
          </div>
        </section>

        {/* STEP 6: TEAM PLACEMENT */}
        <section className="glass-panel rounded-2xl p-5 border border-surface-container-high space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
              6
            </span>
            <h3 className="font-headline text-headline-sm text-on-surface uppercase">
              TEAM PLACEMENT & RANKINGS
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: teamCount }).map((_, idx) => {
              const teamId = selectedTeamIds[idx];
              const teamName =
                initialTeams.find((t) => t.id === teamId)?.name || `Team ${idx + 1}`;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-surface-container p-3.5 rounded-xl border border-surface-container-high"
                >
                  <span className="font-headline text-on-surface">{teamName}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-label-caps text-xs text-on-surface-variant">RANK</span>
                    <input
                      type="number"
                      min={1}
                      value={teamData[idx]?.placement || idx + 1}
                      onChange={(e) =>
                        handlePlacementChange(idx, parseInt(e.target.value) || 1)
                      }
                      className="w-16 bg-black/50 border border-surface-container-high rounded-lg px-2 py-1 text-center font-headline text-primary focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STEP 7: PLAYER ASSIGNMENT */}
        <section className="glass-panel rounded-2xl p-5 border border-surface-container-high space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
              7
            </span>
            <h3 className="font-headline text-headline-sm text-on-surface uppercase">
              ASSIGN PARTICIPATING FRAGGERS TO TEAMS
            </h3>
          </div>

          <div className="space-y-4">
            {Array.from({ length: teamCount }).map((_, teamIdx) => {
              const teamId = selectedTeamIds[teamIdx];
              const teamName =
                initialTeams.find((t) => t.id === teamId)?.name || `Team ${teamIdx + 1}`;
              const slot = teamData[teamIdx] || { playerKills: {} };

              return (
                <div
                  key={teamIdx}
                  className="bg-surface-container p-4 rounded-xl border border-surface-container-high space-y-3"
                >
                  <h4 className="font-headline text-primary uppercase text-sm border-b border-surface-container-high pb-2">
                    {teamName} (RANK #{slot.placement})
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {initialPlayers.map((p) => {
                      const isSelected = slot.playerKills[p.id] !== undefined;

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleTogglePlayer(teamIdx, p.id)}
                          className={`p-2.5 rounded-lg border text-left font-label-caps text-xs font-bold transition-all flex items-center justify-between ${
                            isSelected
                              ? "bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(255,77,0,0.2)]"
                              : "bg-surface-container-high border-surface-container-high text-on-surface-variant hover:text-on-surface"
                          }`}
                        >
                          <span>{p.name}</span>
                          {isSelected && (
                            <span className="material-symbols-outlined text-sm">check</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* STEP 8: PLAYER KILLS */}
        <section className="glass-panel rounded-2xl p-5 border border-surface-container-high space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center">
              8
            </span>
            <h3 className="font-headline text-headline-sm text-on-surface uppercase">
              ENTER PLAYER KILL COUNTS
            </h3>
          </div>

          <div className="space-y-3">
            {Array.from({ length: teamCount }).map((_, teamIdx) => {
              const teamId = selectedTeamIds[teamIdx];
              const teamName =
                initialTeams.find((t) => t.id === teamId)?.name || `Team ${teamIdx + 1}`;
              const slot = teamData[teamIdx] || { playerKills: {} };
              const playerIds = Object.keys(slot.playerKills);

              if (playerIds.length === 0) return null;

              return (
                <div key={teamIdx} className="space-y-2">
                  <span className="font-label-caps text-xs text-primary uppercase block font-bold">
                    {teamName}
                  </span>

                  <div className="space-y-2">
                    {playerIds.map((pId) => {
                      const pName =
                        initialPlayers.find((p) => p.id === pId)?.name || "Player";
                      const kills = slot.playerKills[pId] || 0;

                      return (
                        <div
                          key={pId}
                          className="flex items-center justify-between bg-surface-container p-3 rounded-xl border border-surface-container-high"
                        >
                          <div className="flex items-center gap-2 font-headline text-on-surface text-sm">
                            <span className="material-symbols-outlined text-primary text-base">
                              crosshair
                            </span>
                            {pName}
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleKillsChange(teamIdx, pId, kills - 1)}
                              disabled={kills <= 0}
                              className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface font-bold hover:bg-primary/20 transition-colors disabled:opacity-40"
                            >
                              -
                            </button>
                            <span className="font-display-stat text-lg text-primary w-8 text-center">
                              {kills}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleKillsChange(teamIdx, pId, kills + 1)}
                              className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface font-bold hover:bg-primary/20 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Submit Action CTA */}
        <div className="pt-4 flex justify-end gap-4">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#FF4D00] text-white font-label-caps text-label-caps py-4 px-8 rounded-xl font-bold uppercase tracking-widest primary-glow hover:bg-primary-container active:scale-98 transition-all"
          >
            REVIEW MATCH CHANGES
          </button>
        </div>
      </form>

      {/* REVIEW BEFORE SAVING MODAL */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#171717]/95 border border-primary/40 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-surface-container-high pb-3">
              <h3 className="font-headline text-headline-sm text-on-surface uppercase">
                REVIEW MATCH CHANGES
              </h3>
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="glass-panel p-4 rounded-xl space-y-3 font-mono text-xs text-on-surface bg-black/40">
              <div className="flex justify-between font-bold text-primary text-sm uppercase">
                <span>MATCH #{matchNumber}</span>
                <span>{sessionDate}</span>
              </div>

              <div className="space-y-2 border-t border-surface-container-high pt-2">
                {Array.from({ length: teamCount }).map((_, teamIdx) => {
                  const teamId = selectedTeamIds[teamIdx];
                  const teamName =
                    initialTeams.find((t) => t.id === teamId)?.name || `Team ${teamIdx + 1}`;
                  const slot = teamData[teamIdx] || { placement: teamIdx + 1, playerKills: {} };

                  return (
                    <div key={teamIdx} className="space-y-1">
                      <div className="flex justify-between font-bold text-on-surface">
                        <span>{teamName}</span>
                        <span className="text-gold">RANK #{slot.placement}</span>
                      </div>
                      {Object.entries(slot.playerKills).map(([pId, kills]) => {
                        const pName =
                          initialPlayers.find((p) => p.id === pId)?.name || "Player";
                        return (
                          <div
                            key={pId}
                            className="flex justify-between pl-4 text-on-surface-variant"
                          >
                            <span>{pName}</span>
                            <span>{kills} KILLS</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-surface-container-high pt-2 flex justify-between font-bold text-primary text-sm">
                <span>TOTAL KILLS</span>
                <span>{totalKills} KILLS</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-surface-container-high text-on-surface-variant font-label-caps text-xs hover:text-on-surface transition-colors"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleSaveMatch}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-caps text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(255,77,0,0.3)] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting && (
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                )}
                {isSubmitting ? "SAVING CHANGES..." : "SAVE CHANGES"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
