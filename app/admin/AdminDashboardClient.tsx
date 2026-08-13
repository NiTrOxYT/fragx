"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface AdminPlayer {
  id: string;
  name: string;
  avatarUrl: string;
  role: "PLAYER" | "MODERATOR" | "ADMIN";
  isActive: boolean;
}

interface AdminDashboardClientProps {
  isAuthenticated: boolean;
  activeDraftId: string;
  draftMatchCount: number;
  initialPlayers: AdminPlayer[];
  stats: {
    totalMatches: number;
    totalKills: number;
    mvpName: string;
    mvpAvatar: string;
    mvpKills: number;
  };
}

export default function AdminDashboardClient({
  isAuthenticated,
  activeDraftId,
  draftMatchCount,
  initialPlayers,
  stats,
}: AdminDashboardClientProps) {
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Management section active tab: "MATCHES" | "PLAYERS"
  const [activeTab, setActiveTab] = useState<"MATCHES" | "PLAYERS">("MATCHES");

  // Player management state
  const [players, setPlayers] = useState<AdminPlayer[]>(initialPlayers);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState<"PLAYER" | "MODERATOR" | "ADMIN">("PLAYER");
  const [newPlayerSecretKey, setNewPlayerSecretKey] = useState("");
  const [playerActionMsg, setPlayerActionMsg] = useState("");
  const [loadingPlayerId, setLoadingPlayerId] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Authentication failed");
      } else {
        router.refresh();
      }
    } catch (err) {
      setLoginError("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    router.refresh();
  };

  // Add new player
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    setPlayerActionMsg("");
    try {
      const res = await fetch("/api/players", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newPlayerName.trim(),
          role: newPlayerRole,
          secretKey: newPlayerSecretKey.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.player) {
        setPlayers((prev) => [...prev, data.player]);
        setNewPlayerName("");
        setNewPlayerSecretKey("");
        setShowAddPlayer(false);
        setPlayerActionMsg("Player created successfully.");
      } else {
        setPlayerActionMsg(data.error || "Failed to add player.");
      }
    } catch (err) {
      setPlayerActionMsg("Error creating player.");
    }
  };


  // Update player role or status
  const handleUpdatePlayer = async (
    id: string,
    updates: { role?: "PLAYER" | "MODERATOR" | "ADMIN"; isActive?: boolean }
  ) => {
    setLoadingPlayerId(id);
    setPlayerActionMsg("");

    try {
      const res = await fetch(`/api/players/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (res.ok && data.player) {
        setPlayers((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...data.player } : p))
        );
      } else {
        setPlayerActionMsg(data.error || "Failed to update player.");
      }
    } catch (err) {
      setPlayerActionMsg("Error updating player.");
    } finally {
      setLoadingPlayerId(null);
    }
  };

  // Delete player
  const handleDeletePlayer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    setLoadingPlayerId(id);
    setPlayerActionMsg("");

    try {
      const res = await fetch(`/api/players/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPlayers((prev) => prev.filter((p) => p.id !== id));
        setPlayerActionMsg(`Player ${name} deleted.`);
      } else {
        const data = await res.json();
        setPlayerActionMsg(data.error || "Failed to delete player.");
      }
    } catch (err) {
      setPlayerActionMsg("Error deleting player.");
    } finally {
      setLoadingPlayerId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="flex-1 w-full max-w-md mx-auto px-safe-margin pt-24 pb-24 flex flex-col items-center justify-center">
        <div className="glass-panel rounded-2xl p-6 w-full border border-primary/30 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mb-2">
              <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
            </div>
            <h2 className="font-headline text-headline-md text-on-surface">Admin Access</h2>
            <p className="font-body text-body-md text-on-surface-variant">
              Enter your squad Admin PIN to manage matches, sessions, and players.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Admin PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                required
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-stat-value text-stat-value text-center tracking-widest text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-lg bg-error-container/40 border border-error/40 text-error font-body text-sm text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-cta text-white font-label-caps text-label-caps py-4 rounded-xl hover:bg-primary-container active:scale-[0.98] transition-all uppercase tracking-widest font-bold shadow-[0_0_15px_rgba(255,77,0,0.3)] disabled:opacity-50"
            >
              {isSubmitting ? "UNLOCKING..." : "UNLOCK ADMIN"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 w-full max-w-7xl mx-auto px-safe-margin pt-header-safe md:pt-24 pb-stack-lg flex flex-col gap-stack-lg">

      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-headline text-headline-md text-on-background">Admin Panel</h2>
            <button
              onClick={handleLogout}
              className="text-xs text-on-surface-variant hover:text-error transition-colors font-label-caps underline"
            >
              Log Out
            </button>
          </div>
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            BGMI Squad Management: Matches, Sessions & Player Roles
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex bg-surface-container p-1 rounded-xl border border-surface-container-high w-full md:w-auto">
          <button
            onClick={() => setActiveTab("MATCHES")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-label-caps text-label-caps uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === "MATCHES"
                ? "bg-primary text-on-primary font-bold shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">swords</span>
            MATCHES & SESSIONS
          </button>

          <button
            onClick={() => setActiveTab("PLAYERS")}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg font-label-caps text-label-caps uppercase transition-all flex items-center justify-center gap-2 ${
              activeTab === "PLAYERS"
                ? "bg-primary text-on-primary font-bold shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            PLAYERS ({players.length})
          </button>
        </div>
      </section>

      {/* SECTION 1: MATCHES & SESSIONS MANAGEMENT */}
      {activeTab === "MATCHES" && (
        <div className="flex flex-col gap-stack-lg">
          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/admin/matches/new"
              className="bg-[#FF4D00] text-white font-label-caps text-label-caps py-3.5 px-6 rounded-xl hover:bg-primary-container active:scale-95 transition-all duration-200 primary-glow shadow-[0_0_15px_rgba(255,77,0,0.3)] flex items-center gap-2 justify-center flex-1"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              LOG NEW MATCH
            </Link>

            {draftMatchCount > 0 && (
              <Link
                href={`/admin/sessions/${activeDraftId}/review`}
                className="bg-surface-container border border-primary/40 text-primary font-label-caps text-label-caps py-3.5 px-6 rounded-xl hover:bg-surface-container-high active:scale-95 transition-all flex items-center gap-2 justify-center flex-1"
              >
                <span className="material-symbols-outlined text-[20px]">rate_review</span>
                REVIEW ACTIVE SESSION ({draftMatchCount} DRAFT MATCHES)
              </Link>
            )}
          </div>

          {/* Bento Grid: Key Stats */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Matches Stat */}
            <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">swords</span>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">
                Total Matches
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display-stat text-display-stat text-on-background">
                  {stats.totalMatches}
                </span>
                <span className="font-stat-value text-stat-value text-primary">
                  +{draftMatchCount} Draft
                </span>
              </div>
              <div className="mt-4 h-1 w-full bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary w-3/4 shadow-[0_0_8px_rgba(255,181,158,0.8)]" />
              </div>
            </div>

            {/* Kills Stat */}
            <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary">target</span>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2">
                Total Kills
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-display-stat text-display-stat text-on-background">
                  {stats.totalKills}
                </span>
                <span className="font-stat-value text-stat-value text-secondary">Peak</span>
              </div>
              <div className="mt-4 flex items-end h-8 gap-1 opacity-70">
                <div className="w-full bg-surface-container rounded-sm h-1/4" />
                <div className="w-full bg-surface-container rounded-sm h-2/4" />
                <div className="w-full bg-surface-container rounded-sm h-1/3" />
                <div className="w-full bg-primary rounded-sm h-full shadow-[0_0_8px_rgba(255,181,158,0.5)]" />
                <div className="w-full bg-surface-container rounded-sm h-3/4" />
              </div>
            </div>

            {/* MVP Stat */}
            <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden border-secondary-container/30 bg-gradient-to-br from-[#171717] to-[#201c10]">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <span className="material-symbols-outlined text-6xl text-gold">star</span>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gold shadow-[0_0_5px_rgba(212,175,55,0.8)] animate-pulse" />
                Current MVP
              </span>
              <div className="flex items-center gap-4 mt-auto pt-4">
                <div className="w-12 h-12 rounded-full bg-surface-container border-2 border-gold overflow-hidden shadow-[0_0_10px_rgba(212,175,55,0.3)] flex-shrink-0 flex items-center justify-center">
                  {stats.mvpAvatar ? (
                    <img
                      src={stats.mvpAvatar}
                      alt={stats.mvpName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-gold text-2xl">
                      workspace_premium
                    </span>
                  )}
                </div>

                <div>
                  <span className="font-headline text-headline-md text-on-background block">
                    {stats.mvpName}
                  </span>
                  <span className="font-body text-body-md text-gold/90">
                    {stats.mvpKills} Total Session Kills
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* SECTION 2: PLAYERS & ROLES MANAGEMENT */}
      {activeTab === "PLAYERS" && (
        <div className="flex flex-col gap-stack-md">
          {/* Header & Add Button */}
          <div className="flex justify-between items-center bg-surface-container rounded-xl p-4 border border-surface-container-high">
            <div>
              <h3 className="font-headline text-headline-sm text-on-surface uppercase">
                Squad Roster ({players.length})
              </h3>
              <p className="font-body text-body-md text-on-surface-variant text-xs mt-0.5">
                Manage squad member roles, permissions, and active status.
              </p>
            </div>

            <button
              onClick={() => setShowAddPlayer(!showAddPlayer)}
              className="bg-primary text-on-primary font-label-caps text-label-caps px-4 py-2.5 rounded-lg flex items-center gap-1.5 uppercase hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">
                {showAddPlayer ? "close" : "person_add"}
              </span>
              {showAddPlayer ? "Cancel" : "Add Player"}
            </button>
          </div>

          {playerActionMsg && (
            <div className="p-3 rounded-lg bg-surface-container border border-primary/30 text-primary font-body text-xs text-center">
              {playerActionMsg}
            </div>
          )}

          {/* Add New Player Form Drawer */}
          {showAddPlayer && (
            <form
              onSubmit={handleAddPlayer}
              className="glass-panel rounded-xl p-5 border border-primary/40 space-y-4"
            >
              <h4 className="font-label-caps text-label-caps text-primary uppercase">
                Register New Squad Player
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                    Gamertag
                  </label>
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="e.g. Kunal"
                    required
                    className="w-full bg-surface-container border border-surface-container-high rounded-lg px-3 py-2.5 font-label-caps text-label-caps text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                    Role
                  </label>
                  <select
                    value={newPlayerRole}
                    onChange={(e) =>
                      setNewPlayerRole(e.target.value as "PLAYER" | "MODERATOR" | "ADMIN")
                    }
                    className="w-full bg-surface-container border border-surface-container-high rounded-lg px-3 py-2.5 font-label-caps text-label-caps text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="PLAYER">PLAYER</option>
                    <option value="MODERATOR">MODERATOR</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                    Secret Key
                  </label>
                  <input
                    type="text"
                    value={newPlayerSecretKey}
                    onChange={(e) => setNewPlayerSecretKey(e.target.value)}
                    placeholder="e.g. FRAGX-KUNAL-4821"
                    className="w-full bg-surface-container border border-surface-container-high rounded-lg px-3 py-2.5 font-label-caps text-label-caps text-on-surface focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-primary text-on-primary font-label-caps text-label-caps px-6 py-2.5 rounded-lg uppercase font-bold"
                >
                  Create Player
                </button>
              </div>

            </form>
          )}

          {/* Player Roster Cards */}
          <div className="space-y-3">
            {players.length > 0 ? (
              players.map((p) => {
                const isAdmin = p.role === "ADMIN";
                const isMod = p.role === "MODERATOR";

                return (
                  <div
                    key={p.id}
                    className={`glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border transition-colors ${
                      !p.isActive ? "opacity-50 bg-surface-container/30" : "hover:border-primary/40"
                    }`}
                  >
                    {/* Player Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-full border border-primary/30 overflow-hidden relative flex-shrink-0 bg-surface-container flex items-center justify-center">
                        <img
                          src={p.avatarUrl}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline text-headline-sm text-on-surface">
                            {p.name}
                          </h4>

                          <span
                            className={`font-label-caps text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              isAdmin
                                ? "bg-[#D4AF37]/20 text-gold border border-[#D4AF37]/40"
                                : isMod
                                ? "bg-primary/20 text-primary border border-primary/40"
                                : "bg-surface-container-high text-on-surface-variant border border-surface-variant"
                            }`}
                          >
                            {p.role}
                          </span>
                        </div>

                        <span className="font-body text-xs text-on-surface-variant/70 block mt-0.5">
                          Status: {p.isActive ? "Active Fragger" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Role & Action Controls */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-surface-container-high">
                      {/* Role Selector */}
                      <select
                        value={p.role}
                        disabled={loadingPlayerId === p.id}
                        onChange={(e) =>
                          handleUpdatePlayer(p.id, {
                            role: e.target.value as "PLAYER" | "MODERATOR" | "ADMIN",
                          })
                        }
                        className="bg-surface-container border border-surface-container-high text-on-surface font-label-caps text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-primary"
                      >
                        <option value="PLAYER">PLAYER</option>
                        <option value="MODERATOR">MODERATOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>

                      {/* Active Status Toggle */}
                      <button
                        onClick={() => handleUpdatePlayer(p.id, { isActive: !p.isActive })}
                        disabled={loadingPlayerId === p.id}
                        className={`font-label-caps text-xs px-3 py-1.5 rounded border transition-colors ${
                          p.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-surface-container text-on-surface-variant border-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </button>

                      {/* Delete Action */}
                      <button
                        onClick={() => handleDeletePlayer(p.id, p.name)}
                        disabled={loadingPlayerId === p.id}
                        title="Delete Player"
                        className="p-1.5 text-on-surface-variant hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-10 text-on-surface-variant font-label-caps text-label-caps glass-panel rounded-xl">
                NO PLAYERS REGISTERED YET. CLICK "+ ADD PLAYER" TO REGISTER SQUAD FRAGGERS.
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
