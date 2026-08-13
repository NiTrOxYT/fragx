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

interface MatchFormClientProps {
  activeSessionId: string;
  nextMatchNumber: number;
  sessions: SessionOption[];
  initialPlayers: PlayerOption[];
  initialTeams: TeamOption[];
}

interface SelectedTeamState {
  teamId: string;
  placement: number;
  playerKills: { [playerId: string]: number }; // playerId -> kills
}

export default function MatchFormClient({
  nextMatchNumber,
  initialPlayers,
  initialTeams,
}: MatchFormClientProps) {
  const router = useRouter();

  // Step 1: Number of teams
  const [teamCount, setTeamCount] = useState<number>(Math.min(3, Math.max(1, initialTeams.length)));

  // Step 2: Selected teams (Array of teamIds)
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>(() => {
    return initialTeams.slice(0, Math.min(3, initialTeams.length)).map((t) => t.id);
  });

  // Step 3: Match screenshot (URL or Upload)
  const [screenshotMode, setScreenshotMode] = useState<"URL" | "UPLOAD">("URL");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Step 4: Match Date
  const todayIso = new Date().toISOString().split("T")[0];
  const [sessionDate, setSessionDate] = useState<string>(todayIso);

  // Step 5: Match Number
  const [matchNumber, setMatchNumber] = useState<number>(nextMatchNumber);

  // Step 6 & 7 & 8: Team Players, Kills & Placement
  // teamIndex -> { teamId, placement, playerKills: { playerId: kills } }
  const [teamData, setTeamData] = useState<{ [teamIndex: number]: SelectedTeamState }>({
    0: { teamId: initialTeams[0]?.id || "", placement: 1, playerKills: {} },
    1: { teamId: initialTeams[1]?.id || "", placement: 2, playerKills: {} },
    2: { teamId: initialTeams[2]?.id || "", placement: 3, playerKills: {} },
  });

  // UI Flow State
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Adjust teamCount
  const handleTeamCountChange = (newCount: number) => {
    const validCount = Math.max(1, Math.min(25, newCount));
    setTeamCount(validCount);

    // Update selectedTeamIds length
    const updatedIds = [...selectedTeamIds];
    while (updatedIds.length < validCount) {
      // Pick first unselected team
      const unselected = initialTeams.find((t) => !updatedIds.includes(t.id));
      updatedIds.push(unselected ? unselected.id : "");
    }
    const slicedIds = updatedIds.slice(0, validCount);
    setSelectedTeamIds(slicedIds);

    // Update teamData map
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

  // Select team for specific team index
  const handleSelectTeamForIndex = (index: number, teamId: string) => {
    const updatedIds = [...selectedTeamIds];
    updatedIds[index] = teamId;
    setSelectedTeamIds(updatedIds);

    setTeamData((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        teamId,
      },
    }));
  };

  // Toggle player participation for team index
  const handleTogglePlayer = (teamIndex: number, playerId: string) => {
    setTeamData((prev) => {
      const currentTeam = prev[teamIndex] || { teamId: "", placement: teamIndex + 1, playerKills: {} };
      const currentKills = { ...currentTeam.playerKills };

      if (currentKills[playerId] !== undefined) {
        delete currentKills[playerId];
      } else {
        currentKills[playerId] = 0; // Default 0 kills
      }

      return {
        ...prev,
        [teamIndex]: {
          ...currentTeam,
          playerKills: currentKills,
        },
      };
    });
  };

  // Update kill count for player in team index
  const handleKillChange = (teamIndex: number, playerId: string, kills: number) => {
    const safeKills = Math.max(0, isNaN(kills) ? 0 : kills);
    setTeamData((prev) => {
      const currentTeam = prev[teamIndex];
      return {
        ...prev,
        [teamIndex]: {
          ...currentTeam,
          playerKills: {
            ...currentTeam.playerKills,
            [playerId]: safeKills,
          },
        },
      };
    });
  };

  // Update placement for team index
  const handlePlacementChange = (teamIndex: number, placement: number) => {
    const safePlacement = Math.max(1, isNaN(placement) ? 1 : placement);
    setTeamData((prev) => ({
      ...prev,
      [teamIndex]: {
        ...prev[teamIndex],
        placement: safePlacement,
      },
    }));
  };

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file.");
      return;
    }

    setUploadedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreviewUrl(result);
      setScreenshotUrl(result);
    };
    reader.readAsDataURL(file);
  };

  // Get list of all players assigned across all teams (to prevent double assignment)
  const getAssignedPlayerIds = (excludingTeamIndex?: number) => {
    const assigned = new Set<string>();
    Object.entries(teamData).forEach(([idxStr, data]) => {
      const idx = Number(idxStr);
      if (excludingTeamIndex !== undefined && idx === excludingTeamIndex) return;
      Object.keys(data.playerKills || {}).forEach((pId) => assigned.add(pId));
    });
    return assigned;
  };

  // Validate form before review/submit
  const validateForm = (): boolean => {
    setErrorMsg("");

    if (initialTeams.length === 0) {
      setErrorMsg("No active teams available. Please add teams in Admin → Teams.");
      return false;
    }

    if (selectedTeamIds.some((id) => !id)) {
      setErrorMsg("Please select a team for all team positions.");
      return false;
    }

    // Check duplicate team selection
    const uniqueTeams = new Set(selectedTeamIds);
    if (uniqueTeams.size !== selectedTeamIds.length) {
      setErrorMsg("A team cannot be selected more than once in the same match.");
      return false;
    }

    // Check duplicate placement
    const placements = Object.values(teamData).map((d) => d.placement);
    const uniquePlacements = new Set(placements);
    if (uniquePlacements.size !== placements.length) {
      setErrorMsg("Each team must have a unique placement rank (e.g., #1, #2, #3).");
      return false;
    }

    // Check screenshot
    if (!screenshotUrl.trim()) {
      setErrorMsg("Please provide a valid match screenshot URL or upload an image.");
      return false;
    }

    // Check at least 1 player per team
    for (let i = 0; i < teamCount; i++) {
      const t = teamData[i];
      const playerIds = Object.keys(t?.playerKills || {});
      if (playerIds.length === 0) {
        const teamName = initialTeams.find((item) => item.id === t?.teamId)?.name || `Team ${i + 1}`;
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

  const handleSubmitMatch = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrorMsg("");

    // Build API payload
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
      duration: "20:00 MIN",
      teams: teamsPayload,
    };

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create match.");
        setIsReviewOpen(false);
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setErrorMsg("Network error creating match.");
      setIsReviewOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-xl mx-auto px-safe-margin pt-header-safe md:pt-24 pb-36 flex flex-col gap-stack-lg">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-surface-container-high pb-4">
        <div>
          <h2 className="font-headline text-headline-md text-on-surface uppercase">
            LOG NEW MATCH
          </h2>
          <p className="font-body text-body-md text-on-surface-variant text-xs mt-0.5">
            Multi-Team BGMI Squad Night Match Entry
          </p>
        </div>

        <button
          onClick={() => router.back()}
          className="text-on-surface-variant hover:text-on-surface font-label-caps text-xs uppercase underline"
        >
          Cancel
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-error-container/40 border border-error/40 text-error font-body text-xs text-center">
          {errorMsg}
        </div>
      )}

      {/* Main Match Entry Form */}
      <form onSubmit={handleOpenReview} className="space-y-6">
        {/* STEP 1: NUMBER OF TEAMS */}
        <section className="glass-panel rounded-xl p-5 border border-primary/30 space-y-3">
          <div className="flex justify-between items-center">
            <label className="font-label-caps text-label-caps text-primary uppercase font-bold block">
              STEP 1 — HOW MANY TEAMS PLAYED?
            </label>
            <span className="font-stat-value text-xl text-primary font-mono">{teamCount} TEAMS</span>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleTeamCountChange(teamCount - 1)}
              disabled={teamCount <= 1}
              className="w-12 h-12 rounded-xl bg-surface-container border border-surface-container-high text-on-surface flex items-center justify-center text-2xl font-bold hover:border-primary disabled:opacity-30 active:scale-95 transition-all"
            >
              -
            </button>

            <span className="font-display-stat text-display-stat text-on-background w-16 text-center">
              {teamCount}
            </span>

            <button
              type="button"
              onClick={() => handleTeamCountChange(teamCount + 1)}
              disabled={teamCount >= Math.min(25, initialTeams.length || 25)}
              className="w-12 h-12 rounded-xl bg-surface-container border border-surface-container-high text-on-surface flex items-center justify-center text-2xl font-bold hover:border-primary disabled:opacity-30 active:scale-95 transition-all"
            >
              +
            </button>
          </div>
        </section>

        {/* STEP 2: SELECT TEAMS */}
        <section className="glass-panel rounded-xl p-5 border border-surface-container-high space-y-4">
          <label className="font-label-caps text-label-caps text-primary uppercase font-bold block">
            STEP 2 — SELECT PARTICIPATING TEAMS
          </label>

          {initialTeams.length < teamCount ? (
            <div className="p-3 rounded-lg bg-surface-container border border-error/40 text-error font-body text-xs">
              Not enough active teams available ({initialTeams.length} configured). Please create more teams from Admin → Teams.
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: teamCount }).map((_, idx) => {
                const currentSelected = selectedTeamIds[idx] || "";
                const availableForIndex = initialTeams.filter(
                  (t) => t.id === currentSelected || !selectedTeamIds.includes(t.id)
                );

                return (
                  <div key={idx} className="space-y-1">
                    <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                      TEAM {idx + 1}
                    </label>
                    <select
                      value={currentSelected}
                      onChange={(e) => handleSelectTeamForIndex(idx, e.target.value)}
                      required
                      className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-label-caps text-label-caps text-on-surface focus:outline-none focus:border-primary"
                    >
                      <option value="">-- SELECT TEAM {idx + 1} --</option>
                      {availableForIndex.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* STEP 3: MATCH SCREENSHOT */}
        <section className="glass-panel rounded-xl p-5 border border-surface-container-high space-y-4">
          <label className="font-label-caps text-label-caps text-primary uppercase font-bold block">
            STEP 3 — MATCH SCREENSHOT
          </label>

          {/* Toggle URL / Upload */}
          <div className="flex bg-surface-container p-1 rounded-lg border border-surface-container-high">
            <button
              type="button"
              onClick={() => setScreenshotMode("URL")}
              className={`flex-1 py-2 font-label-caps text-xs uppercase rounded-md transition-colors ${
                screenshotMode === "URL"
                  ? "bg-primary text-on-primary font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              PASTE IMAGE URL
            </button>
            <button
              type="button"
              onClick={() => setScreenshotMode("UPLOAD")}
              className={`flex-1 py-2 font-label-caps text-xs uppercase rounded-md transition-colors ${
                screenshotMode === "UPLOAD"
                  ? "bg-primary text-on-primary font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              UPLOAD IMAGE
            </button>
          </div>

          {screenshotMode === "URL" ? (
            <input
              type="url"
              value={screenshotUrl}
              onChange={(e) => {
                setScreenshotUrl(e.target.value);
                setPreviewUrl(e.target.value);
              }}
              placeholder="https://..."
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-body text-body-md text-on-surface focus:outline-none focus:border-primary"
            />
          ) : (
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-body text-xs text-on-surface file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-label-caps file:bg-primary file:text-on-primary"
            />
          )}

          {previewUrl && (
            <div className="w-full h-40 rounded-xl border border-surface-container-high overflow-hidden bg-black relative">
              <img
                src={previewUrl}
                alt="Match Screenshot Preview"
                className="w-full h-full object-cover"
                onError={() => setErrorMsg("Invalid image URL preview.")}
              />
            </div>
          )}
        </section>

        {/* STEP 4 & 5: DATE & MATCH NUMBER */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* STEP 4: DATE */}
          <div className="glass-panel rounded-xl p-5 border border-surface-container-high space-y-2">
            <label className="font-label-caps text-xs text-primary uppercase font-bold block">
              STEP 4 — SESSION DATE
            </label>
            <CalendarDatePicker
              value={sessionDate}
              onChange={(dateStr: string) => setSessionDate(dateStr)}
            />

          </div>

          {/* STEP 5: MATCH NUMBER */}
          <div className="glass-panel rounded-xl p-5 border border-surface-container-high space-y-2">
            <label className="font-label-caps text-xs text-primary uppercase font-bold block">
              STEP 5 — MATCH NUMBER
            </label>
            <input
              type="number"
              min={1}
              value={matchNumber}
              onChange={(e) => setMatchNumber(parseInt(e.target.value) || 1)}
              required
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-stat-value text-stat-value text-center text-on-surface focus:outline-none focus:border-primary"
            />
          </div>
        </section>

        {/* STEP 6, 7 & 8: TEAM PLAYERS, PLACEMENT & KILLS */}
        <section className="space-y-4">
          <label className="font-label-caps text-label-caps text-primary uppercase font-bold block">
            STEP 6, 7 & 8 — TEAM PLACEMENT, PLAYERS & KILLS
          </label>

          {Array.from({ length: teamCount }).map((_, idx) => {
            const teamId = selectedTeamIds[idx];
            const teamObj = initialTeams.find((t) => t.id === teamId);
            const teamName = teamObj?.name || `TEAM ${idx + 1}`;
            const currentData = teamData[idx] || { teamId: "", placement: idx + 1, playerKills: {} };

            const assignedToOtherTeams = getAssignedPlayerIds(idx);

            return (
              <div
                key={idx}
                className="glass-panel rounded-xl p-5 border border-surface-container-high space-y-4"
              >
                {/* Team Header & Placement */}
                <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
                  <div>
                    <span className="font-label-caps text-xs text-primary uppercase font-bold block">
                      TEAM {idx + 1}
                    </span>
                    <h3 className="font-headline text-headline-sm text-on-surface">
                      {teamName}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                      RANK #
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={currentData.placement}
                      onChange={(e) => handlePlacementChange(idx, parseInt(e.target.value) || 1)}
                      className="w-16 bg-surface-container border border-surface-container-high rounded-lg px-2 py-1.5 font-stat-value text-center text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Player Checkboxes */}
                <div className="space-y-3">
                  <label className="font-label-caps text-xs text-on-surface-variant uppercase block">
                    SELECT PARTICIPATING PLAYERS FOR {teamName.toUpperCase()}
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {initialPlayers.map((p) => {
                      const isAssignedElsewhere = assignedToOtherTeams.has(p.id);
                      const isChecked = currentData.playerKills[p.id] !== undefined;

                      return (
                        <div
                          key={p.id}
                          className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                            isChecked
                              ? "bg-primary/10 border-primary/40"
                              : isAssignedElsewhere
                              ? "opacity-30 bg-surface-container/20 border-surface-container-high"
                              : "bg-surface-container/50 border-surface-container-high hover:border-surface-variant"
                          }`}
                        >
                          <label className="flex items-center gap-3 cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isAssignedElsewhere}
                              onChange={() => handleTogglePlayer(idx, p.id)}
                              className="w-4 h-4 rounded text-primary focus:ring-primary accent-[#FF4D00]"
                            />
                            <span className="font-headline text-sm text-on-surface">
                              {p.name}
                            </span>
                          </label>

                          {isChecked && (
                            <div className="flex items-center gap-2">
                              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                                KILLS
                              </span>
                              <input
                                type="number"
                                min={0}
                                value={currentData.playerKills[p.id]}
                                onChange={(e) =>
                                  handleKillChange(idx, p.id, parseInt(e.target.value) || 0)
                                }
                                className="w-14 bg-surface-container border border-primary/50 rounded-lg px-2 py-1 font-stat-value text-center text-on-surface focus:outline-none"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* STEP 9: SUBMIT REVIEW CTA */}
        <button
          type="submit"
          className="w-full bg-[#FF4D00] text-white font-label-caps text-label-caps py-4 rounded-xl primary-glow hover:bg-primary-container active:scale-[0.98] transition-all uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(255,77,0,0.3)]"
        >
          REVIEW MATCH BEFORE SAVE
        </button>
      </form>

      {/* STEP 9: MATCH REVIEW MODAL OVERLAY */}
      {isReviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel rounded-2xl p-6 w-full max-w-md border border-primary/40 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-surface-container-high pb-3">
              <h3 className="font-headline text-headline-md text-on-surface uppercase">
                MATCH SUMMARY REVIEW
              </h3>
              <button
                onClick={() => setIsReviewOpen(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-2 text-xs font-label-caps text-on-surface-variant">
              <div className="flex justify-between">
                <span>SESSION DATE:</span>
                <span className="text-on-surface font-bold">{sessionDate}</span>
              </div>
              <div className="flex justify-between">
                <span>MATCH NUMBER:</span>
                <span className="text-primary font-bold">#{matchNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>PARTICIPATING TEAMS:</span>
                <span className="text-on-surface font-bold">{teamCount} TEAMS</span>
              </div>
            </div>

            {/* Team Summaries */}
            <div className="space-y-3">
              {selectedTeamIds.map((tId, idx) => {
                const teamName = initialTeams.find((t) => t.id === tId)?.name || `Team ${idx + 1}`;
                const data = teamData[idx];
                const playerEntries = Object.entries(data?.playerKills || {});

                return (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface-container border border-surface-container-high space-y-2"
                  >
                    <div className="flex justify-between items-center border-b border-surface-container-high pb-1.5">
                      <span className="font-headline text-sm text-on-surface">
                        #{data?.placement} {teamName}
                      </span>
                      <span className="font-label-caps text-xs text-primary font-bold">
                        {playerEntries.reduce((acc, [, k]) => acc + k, 0)} TEAM KILLS
                      </span>
                    </div>

                    <div className="space-y-1">
                      {playerEntries.map(([pId, kills]) => {
                        const pName = initialPlayers.find((p) => p.id === pId)?.name || "Player";
                        return (
                          <div key={pId} className="flex justify-between font-body text-xs text-on-surface-variant">
                            <span>{pName}</span>
                            <span className="font-mono text-on-surface font-bold">{kills} kills</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsReviewOpen(false)}
                className="flex-1 py-3 rounded-xl font-label-caps text-xs text-on-surface-variant border border-surface-container-high uppercase hover:bg-surface-container"
              >
                EDIT DETAILS
              </button>

              <button
                type="button"
                onClick={handleSubmitMatch}
                disabled={isSubmitting}
                className="flex-1 bg-[#FF4D00] text-white font-label-caps text-xs py-3 rounded-xl uppercase font-bold primary-glow hover:bg-primary-container disabled:opacity-50"
              >
                {isSubmitting ? "SAVING MATCH..." : "SAVE MATCH"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
