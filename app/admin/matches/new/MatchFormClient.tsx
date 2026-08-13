"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PlayerOption {
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
}

export default function MatchFormClient({
  activeSessionId,
  nextMatchNumber,
  sessions,
  initialPlayers,
}: MatchFormClientProps) {
  const router = useRouter();

  const [sessionId, setSessionId] = useState(activeSessionId);
  const [matchNumber, setMatchNumber] = useState(nextMatchNumber);
  const [playerId, setPlayerId] = useState(initialPlayers[0]?.id || "");
  const [kills, setKills] = useState<number | "">(0);
  const [placement, setPlacement] = useState<number | "">(1);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  const [players, setPlayers] = useState<PlayerOption[]>(initialPlayers);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Handle file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsUploading(true);
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Image upload failed");
        setPreviewUrl("");
      } else {
        setScreenshotUrl(data.url);
      }
    } catch (err) {
      setErrorMsg("Network error during image upload.");
      setPreviewUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  // Add new player on the fly
  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) return;

    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newPlayerName.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.player) {
        setPlayers((prev) => [...prev, data.player]);
        setPlayerId(data.player.id);
        setNewPlayerName("");
        setIsAddingPlayer(false);
      } else {
        setErrorMsg(data.error || "Failed to create player");
      }
    } catch (err) {
      setErrorMsg("Error creating player");
    }
  };

  // Handle match form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshotUrl) {
      setErrorMsg("Please upload an end screen screenshot proof.");
      return;
    }

    if (!playerId) {
      setErrorMsg("Please select or add a player.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          matchNumber: Number(matchNumber),
          playerId,
          kills: Number(kills),
          placement: Number(placement),
          screenshotUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create match");
      } else {
        // Redirect to review session page
        router.push(`/admin/sessions/${sessionId}/review`);
      }
    } catch (err) {
      setErrorMsg("Something went wrong while saving the match.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 w-full max-w-md mx-auto px-safe-margin pt-20 pb-stack-lg flex flex-col gap-stack-lg">
      <div className="space-y-2 text-center mb-2">
        <h2 className="font-headline text-headline-md text-on-surface">Log Match Data</h2>
        <p className="font-body text-body-md text-on-surface-variant">
          Enter post-match stats to track squad performance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
        {/* Screenshot Upload Area */}
        <div className="w-full">
          <label className="block font-label-caps text-label-caps text-on-surface-variant mb-stack-sm uppercase">
            End Screen Proof
          </label>
          <div className="relative w-full h-48 bg-surface-container rounded-xl border border-dashed border-outline-variant/40 flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors overflow-hidden group">
            {previewUrl || screenshotUrl ? (
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={previewUrl || screenshotUrl}
                  alt="Proof preview"
                  className="w-full h-full object-cover"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-primary font-label-caps text-label-caps">
                    UPLOADING...
                  </div>
                )}
              </div>
            ) : (
              <div className="z-20 flex flex-col items-center text-on-surface-variant group-hover:text-primary transition-colors text-center p-4">
                <span className="material-symbols-outlined mb-2 text-[32px]">
                  add_photo_alternate
                </span>
                <span className="font-body text-body-md">
                  {isUploading ? "Uploading..." : "Tap to upload screenshot"}
                </span>
                <span className="font-label-caps text-label-caps text-on-surface-variant/60 mt-1">
                  JPEG, PNG, WebP up to 5MB
                </span>
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
            />
          </div>
        </div>

        {/* Session & Match Number Row */}
        <div className="grid grid-cols-2 gap-gutter">
          <div className="flex flex-col gap-base">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Session
            </label>
            <select
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="w-full bg-surface-container border border-surface-container-high rounded-lg px-3 py-3 font-label-caps text-label-caps text-on-surface focus:outline-none focus:border-primary"
            >
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.dateStr} ({s.status})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-base">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Match #
            </label>
            <input
              type="number"
              min={1}
              value={matchNumber}
              onChange={(e) => setMatchNumber(Number(e.target.value))}
              className="w-full bg-surface-container border border-surface-container-high rounded-lg px-4 py-3 font-label-caps text-label-caps text-on-surface focus:outline-none focus:border-primary text-center"
              required
            />
          </div>
        </div>

        {/* Player Name Select / Add */}
        <div className="flex flex-col gap-base">
          <div className="flex justify-between items-center">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
              Player Tag
            </label>
            <button
              type="button"
              onClick={() => setIsAddingPlayer(!isAddingPlayer)}
              className="text-xs text-primary font-label-caps hover:underline"
            >
              {isAddingPlayer ? "Cancel" : "+ New Player"}
            </button>
          </div>

          {isAddingPlayer ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter gamertag (e.g. Sourik)"
                className="flex-1 bg-surface-container border border-surface-container-high rounded-lg px-4 py-2 font-label-caps text-label-caps text-on-surface focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleCreatePlayer}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-caps text-label-caps uppercase"
              >
                Add
              </button>
            </div>
          ) : (
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 pointer-events-none">
                person
              </span>
              <select
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                className="w-full bg-surface-container border border-surface-container-high rounded-lg pl-12 pr-4 py-3 font-label-caps text-label-caps text-on-surface focus:outline-none focus:border-primary"
              >
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-gutter">
          <div className="flex flex-col gap-base">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">crosshair</span> Kills
            </label>
            <input
              type="number"
              min={0}
              value={kills}
              onChange={(e) => setKills(e.target.value === "" ? "" : Number(e.target.value))}
              placeholder="0"
              className="w-full bg-surface-container border border-surface-container-high rounded-lg px-4 py-3 font-stat-value text-stat-value text-on-surface text-center focus:outline-none focus:border-primary"
              required
            />
          </div>

          <div className="flex flex-col gap-base">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase flex items-center justify-end gap-1 text-right">
              Placement <span className="material-symbols-outlined text-[14px]">emoji_events</span>
            </label>
            <div className="relative w-full flex items-center">
              <span className="absolute left-4 font-stat-value text-stat-value text-on-surface-variant/50">
                #
              </span>
              <input
                type="number"
                min={1}
                value={placement}
                onChange={(e) => setPlacement(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="1"
                className="w-full bg-surface-container border border-surface-container-high rounded-lg pl-8 pr-4 py-3 font-stat-value text-stat-value text-on-surface text-center focus:outline-none focus:border-primary"
                required
              />
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-error-container/40 border border-error/40 text-error font-body text-sm text-center">
            {errorMsg}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-stack-sm mt-stack-md pt-stack-md border-t border-surface-container-high">
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full bg-primary text-[#3a0b00] font-label-caps text-label-caps py-4 rounded-xl primary-glow hover:bg-primary-fixed-dim active:scale-[0.98] transition-all uppercase tracking-widest font-bold disabled:opacity-50"
          >
            {isSubmitting ? "SAVING MATCH..." : "SAVE MATCH"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full bg-transparent border border-outline-variant/30 text-on-surface-variant font-label-caps text-label-caps py-4 rounded-xl hover:bg-surface-container active:scale-[0.98] transition-all uppercase tracking-widest"
          >
            CANCEL
          </button>
        </div>
      </form>
    </main>
  );
}
