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

  // Screenshot mode: "URL" or "UPLOAD"
  const [imageMode, setImageMode] = useState<"URL" | "UPLOAD">("URL");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [imageLoadError, setImageLoadError] = useState(false);

  const [players, setPlayers] = useState<PlayerOption[]>(initialPlayers);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Helper for URL validation (HTTPS or Data URL)
  const isValidHttpsUrl = (url: string) => {
    if (!url) return false;
    if (url.startsWith("data:image/")) return true;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setScreenshotUrl(val);
    setImageLoadError(false);
    setErrorMsg("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setScreenshotUrl(result);
        setImageLoadError(false);
        setErrorMsg("");
      }
    };
    reader.readAsDataURL(file);
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

    const trimmedUrl = screenshotUrl.trim();

    if (!trimmedUrl) {
      setErrorMsg("Please paste a screenshot URL.");
      return;
    }

    if (!isValidHttpsUrl(trimmedUrl)) {
      setErrorMsg("Please enter a valid HTTPS screenshot URL (e.g. https://example.com/screenshot.jpg).");
      return;
    }

    if (trimmedUrl.length > 2048) {
      setErrorMsg("Screenshot URL is too long (maximum 2048 characters).");
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
          screenshotUrl: trimmedUrl,
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

  const isUrlValid = isValidHttpsUrl(screenshotUrl.trim());

  return (
    <main className="flex-1 w-full max-w-md mx-auto px-safe-margin pt-20 pb-stack-lg flex flex-col gap-stack-lg">
      <div className="space-y-2 text-center mb-2">
        <h2 className="font-headline text-headline-md text-on-surface">Log Match Data</h2>
        <p className="font-body text-body-md text-on-surface-variant">
          Enter post-match stats and screenshot URL to track squad performance.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-stack-md">
        {/* Screenshot Input Area with Tab Switcher */}
        <div className="flex flex-col gap-base">
          <div className="flex justify-between items-center">
            <label className="font-label-caps text-label-caps text-on-surface-variant uppercase" htmlFor="screenshot-url">
              MATCH SCREENSHOT
            </label>
            <div className="flex bg-surface-container p-0.5 rounded-lg border border-surface-container-high text-xs">
              <button
                type="button"
                onClick={() => setImageMode("URL")}
                className={`px-3 py-1 rounded font-label-caps transition-colors ${
                  imageMode === "URL"
                    ? "bg-primary text-on-primary font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Paste URL
              </button>
              <button
                type="button"
                onClick={() => setImageMode("UPLOAD")}
                className={`px-3 py-1 rounded font-label-caps transition-colors ${
                  imageMode === "UPLOAD"
                    ? "bg-primary text-on-primary font-semibold"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Upload File
              </button>
            </div>
          </div>

          {imageMode === "URL" ? (
            <>
              <input
                id="screenshot-url"
                type="url"
                value={screenshotUrl.startsWith("data:") ? "" : screenshotUrl}
                onChange={handleUrlChange}
                placeholder="https://example.com/bgmi-match-screenshot.jpg"
                required={!screenshotUrl}
                maxLength={2048}
                className="w-full bg-surface-container border border-surface-container-high rounded-lg px-4 py-3 font-label-caps text-label-caps text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
              />
              <span className="font-body text-xs text-on-surface-variant/70">
                Paste the public HTTPS URL of the BGMI match screenshot.
              </span>
            </>
          ) : (
            <>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full bg-surface-container border border-surface-container-high rounded-lg px-4 py-2.5 font-label-caps text-label-caps text-on-surface file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-label-caps file:bg-primary file:text-on-primary hover:file:opacity-90 transition-colors"
              />
              <span className="font-body text-xs text-on-surface-variant/70">
                Select an image file from your device.
              </span>
            </>
          )}

          {/* Instant Image Preview Area */}
          {screenshotUrl.trim() !== "" && (
            <div className="mt-2 space-y-1">
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                IMAGE PREVIEW
              </span>
              <div className="relative w-full h-48 bg-surface-container rounded-xl border border-surface-container-high overflow-hidden flex items-center justify-center">
                {!isUrlValid ? (
                  <div className="text-center p-4 text-error font-body text-xs">
                    <span className="material-symbols-outlined text-2xl mb-1 block">link_off</span>
                    URL must start with https://
                  </div>
                ) : imageLoadError ? (
                  <div className="text-center p-4 text-error font-body text-xs">
                    <span className="material-symbols-outlined text-2xl mb-1 block">broken_image</span>
                    Unable to load remote image. Please check the URL.
                  </div>
                ) : (
                  <img
                    src={screenshotUrl.trim()}
                    alt="Match screenshot preview"
                    onError={() => setImageLoadError(true)}
                    className="w-full h-full object-cover rounded-xl"
                  />
                )}
              </div>
            </div>
          )}
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
            disabled={isSubmitting}
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
