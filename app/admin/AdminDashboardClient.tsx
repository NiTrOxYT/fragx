"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import AdminGoldenGunSection, {
  GoldenGunSessionItem,
} from "@/components/admin/AdminGoldenGunSection";
import type { SessionGoldenGunDetails } from "@/lib/services/goldengun";

export interface AdminPlayer {
  id: string;
  name: string;
  avatarUrl: string;
  role: "PLAYER" | "MODERATOR" | "ADMIN";
  isActive: boolean;
  goldenGunCount?: number;
  totalKills?: number;
  matchesCount?: number;
}

export interface AdminTeamPlayer {
  id: string;
  name: string;
  avatarUrl: string;
  role: "PLAYER" | "MODERATOR" | "ADMIN";
  isActive: boolean;
  teamId?: string | null;
  teamName?: string | null;
}

export interface AdminTeam {
  id: string;
  name: string;
  avatarUrl?: string | null;
  isActive: boolean;
  players?: AdminTeamPlayer[];
  playerCount?: number;
}

export interface AdminMatchItem {
  id: string;
  matchNumber: number;
  dateStr: string;
  sessionStatus: "DRAFT" | "PUBLISHED";
  sessionId: string;
  totalKills: number;
  topTeamName: string;
  topPlacement: number;
}

interface AdminDashboardClientProps {
  isAuthenticated: boolean;
  activeDraftId: string;
  draftMatchCount: number;
  initialMatches?: AdminMatchItem[];
  initialPlayers: AdminPlayer[];
  initialTeams: AdminTeam[];
  initialGoldenGun?: SessionGoldenGunDetails | null;
  initialGoldenGunSessions?: GoldenGunSessionItem[];
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
  initialMatches = [],
  initialPlayers,
  initialTeams,
  initialGoldenGun = null,
  initialGoldenGunSessions = [],
  stats,
}: AdminDashboardClientProps) {
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Management section active tab: "MATCHES" | "PLAYERS" | "TEAMS" | "GOLDEN_GUN"
  const [activeTab, setActiveTab] = useState<"MATCHES" | "PLAYERS" | "TEAMS" | "GOLDEN_GUN">("MATCHES");

  // Matches management state
  const [matches, setMatches] = useState<AdminMatchItem[]>(initialMatches);
  const [matchToDelete, setMatchToDelete] = useState<AdminMatchItem | null>(null);
  const [isDeletingMatch, setIsDeletingMatch] = useState(false);
  const [matchActionMsg, setMatchActionMsg] = useState("");

  // Player management state
  const [players, setPlayers] = useState<AdminPlayer[]>(initialPlayers);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState<"PLAYER" | "MODERATOR" | "ADMIN">("PLAYER");
  const [newPlayerSecretKey, setNewPlayerSecretKey] = useState("");
  const [playerActionMsg, setPlayerActionMsg] = useState("");
  const [loadingPlayerId, setLoadingPlayerId] = useState<string | null>(null);

  // Edit Golden Gun Count Modal state
  const [editingGoldenGunPlayer, setEditingGoldenGunPlayer] = useState<AdminPlayer | null>(null);
  const [newGoldenGunCount, setNewGoldenGunCount] = useState<number>(0);
  const [isSavingGoldenGun, setIsSavingGoldenGun] = useState(false);
  const [goldenGunEditError, setGoldenGunEditError] = useState("");

  // Edit Player Modal state
  const [editingPlayer, setEditingPlayer] = useState<AdminPlayer | null>(null);
  const [editName, setEditName] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editRole, setEditRole] = useState<"PLAYER" | "MODERATOR" | "ADMIN">("PLAYER");
  const [editIsActive, setEditIsActive] = useState(true);
  const [editSecretKey, setEditSecretKey] = useState("");
  const [editImageError, setEditImageError] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editErrorMsg, setEditErrorMsg] = useState("");


  // Team management state
  const [teams, setTeams] = useState<AdminTeam[]>(initialTeams);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamAvatarUrl, setNewTeamAvatarUrl] = useState("");
  const [newTeamImageError, setNewTeamImageError] = useState(false);
  const [teamActionMsg, setTeamActionMsg] = useState("");
  const [loadingTeamId, setLoadingTeamId] = useState<string | null>(null);

  // Edit Team Modal state
  const [editingTeam, setEditingTeam] = useState<AdminTeam | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamAvatarUrl, setEditTeamAvatarUrl] = useState("");
  const [editTeamIsActive, setEditTeamIsActive] = useState(true);
  const [editTeamImageError, setEditTeamImageError] = useState(false);
  const [editTeamSaving, setEditTeamSaving] = useState(false);
  const [editTeamErrorMsg, setEditTeamErrorMsg] = useState("");

  // Team Players Management Modal state
  const [teamToManage, setTeamToManage] = useState<AdminTeam | null>(null);
  const [teamPlayersLoading, setTeamPlayersLoading] = useState(false);
  const [teamCurrentPlayers, setTeamCurrentPlayers] = useState<AdminTeamPlayer[]>([]);
  const [teamAvailablePlayers, setTeamAvailablePlayers] = useState<AdminTeamPlayer[]>([]);
  const [selectedPlayerIdsToAdd, setSelectedPlayerIdsToAdd] = useState<string[]>([]);
  const [isSavingTeamPlayers, setIsSavingTeamPlayers] = useState(false);
  const [managePlayersActionMsg, setManagePlayersActionMsg] = useState("");
  const [playerToMoveConfirm, setPlayerToMoveConfirm] = useState<{
    player: AdminTeamPlayer;
    targetTeam: AdminTeam;
  } | null>(null);



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

  // Delete Match handler
  const handleConfirmDeleteMatch = async () => {
    if (!matchToDelete) return;

    setIsDeletingMatch(true);
    setMatchActionMsg("");

    try {
      const res = await fetch(`/api/matches/${matchToDelete.id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setMatches((prev) => prev.filter((m) => m.id !== matchToDelete.id));
        setMatchActionMsg(`Match #${matchToDelete.matchNumber} permanently deleted.`);
        setMatchToDelete(null);
        router.refresh();
      } else {
        setMatchActionMsg(data.error || "Failed to delete match.");
      }
    } catch (err: any) {
      setMatchActionMsg("Error deleting match.");
    } finally {
      setIsDeletingMatch(false);
    }
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

  // Open Edit Golden Gun Count Modal
  const handleOpenEditGoldenGun = (player: AdminPlayer) => {
    setEditingGoldenGunPlayer(player);
    setNewGoldenGunCount(player.goldenGunCount || 0);
    setGoldenGunEditError("");
  };

  // Save Edit Golden Gun Count
  const handleSaveGoldenGunCount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGoldenGunPlayer) return;

    if (!Number.isInteger(newGoldenGunCount) || newGoldenGunCount < 0) {
      setGoldenGunEditError("Golden Gun count must be a non-negative integer");
      return;
    }

    setIsSavingGoldenGun(true);
    setGoldenGunEditError("");

    try {
      const res = await fetch(`/api/players/${editingGoldenGunPlayer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goldenGunCount: newGoldenGunCount }),
      });

      const data = await res.json();
      if (res.ok) {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === editingGoldenGunPlayer.id
              ? { ...p, goldenGunCount: newGoldenGunCount }
              : p
          )
        );
        setPlayerActionMsg(
          `🏆 Golden Gun count for ${editingGoldenGunPlayer.name} updated to ${newGoldenGunCount}.`
        );
        setEditingGoldenGunPlayer(null);
        router.refresh();
      } else {
        setGoldenGunEditError(data.error || "Failed to update Golden Gun count");
      }
    } catch (err: any) {
      setGoldenGunEditError(err?.message || "Error updating Golden Gun count");
    } finally {
      setIsSavingGoldenGun(false);
    }
  };

  // Open Edit Player Modal
  const handleOpenEditModal = (player: AdminPlayer) => {
    setEditingPlayer(player);
    setEditName(player.name);
    setEditAvatarUrl(player.avatarUrl);
    setEditRole(player.role);
    setEditIsActive(player.isActive);
    setEditSecretKey("");
    setEditImageError(false);
    setEditErrorMsg("");
  };


  // Save Edit Player
  const handleSaveEditPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayer) return;

    setEditErrorMsg("");
    setEditSaving(true);

    try {
      const payload: any = {
        name: editName.trim(),
        avatarUrl: editAvatarUrl.trim() || undefined,
        role: editRole,
        isActive: editIsActive,
      };

      if (editSecretKey.trim()) {
        payload.secretKey = editSecretKey.trim();
      }

      const res = await fetch(`/api/players/${editingPlayer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.player) {
        setPlayers((prev) =>
          prev.map((p) => (p.id === editingPlayer.id ? { ...p, ...data.player } : p))
        );
        setEditingPlayer(null);
        setPlayerActionMsg(`Player ${data.player.name} updated successfully.`);
      } else {
        setEditErrorMsg(data.error || "Failed to update player.");
      }
    } catch (err: any) {
      setEditErrorMsg(err?.message || "Error updating player.");
    } finally {
      setEditSaving(false);
    }
  };

  // Quick inline update player role or status
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

  // Add new team
  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTeamName.trim();
    if (!trimmed) return;

    if (newTeamAvatarUrl.trim() && !newTeamAvatarUrl.trim().startsWith("https://") && !newTeamAvatarUrl.trim().startsWith("data:image/")) {
      setTeamActionMsg("Avatar URL must start with https://");
      return;
    }

    setTeamActionMsg("");
    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          avatarUrl: newTeamAvatarUrl.trim() || null,
        }),
      });

      const data = await res.json();
      if (res.ok && data.team) {
        setTeams((prev) => [...prev, data.team]);
        setNewTeamName("");
        setNewTeamAvatarUrl("");
        setNewTeamImageError(false);
        setShowAddTeam(false);
        setTeamActionMsg("Team created successfully.");
      } else {
        setTeamActionMsg(data.error || "Failed to create team.");
      }
    } catch (err) {
      setTeamActionMsg("Error creating team.");
    }
  };

  // Open Edit Team Modal
  const handleOpenEditTeamModal = (team: AdminTeam) => {
    setEditingTeam(team);
    setEditTeamName(team.name);
    setEditTeamAvatarUrl(team.avatarUrl || "");
    setEditTeamIsActive(team.isActive);
    setEditTeamImageError(false);
    setEditTeamErrorMsg("");
  };

  // Save Edited Team
  const handleSaveEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    const trimmed = editTeamName.trim();
    if (!trimmed) return;

    if (editTeamAvatarUrl.trim() && !editTeamAvatarUrl.trim().startsWith("https://") && !editTeamAvatarUrl.trim().startsWith("data:image/")) {
      setEditTeamErrorMsg("Avatar URL must start with https://");
      return;
    }

    setEditTeamSaving(true);
    setEditTeamErrorMsg("");

    try {
      const res = await fetch(`/api/teams/${editingTeam.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmed,
          avatarUrl: editTeamAvatarUrl.trim() || null,
          isActive: editTeamIsActive,
        }),
      });

      const data = await res.json();
      if (res.ok && data.team) {
        setTeams((prev) =>
          prev.map((t) =>
            t.id === editingTeam.id
              ? {
                  ...t,
                  name: data.team.name,
                  avatarUrl: data.team.avatarUrl || null,
                  isActive: data.team.isActive,
                }
              : t
          )
        );
        setEditingTeam(null);
        setTeamActionMsg("Team updated successfully.");
      } else {
        setEditTeamErrorMsg(data.error || "Failed to update team.");
      }
    } catch (err) {
      setEditTeamErrorMsg("Error updating team.");
    } finally {
      setEditTeamSaving(false);
    }
  };


  // Update team active status
  const handleUpdateTeam = async (id: string, updates: { name?: string; isActive?: boolean }) => {
    setLoadingTeamId(id);
    setTeamActionMsg("");

    try {
      const res = await fetch(`/api/teams/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (res.ok && data.team) {
        setTeams((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...data.team } : t))
        );
      } else {
        setTeamActionMsg(data.error || "Failed to update team.");
      }
    } catch (err) {
      setTeamActionMsg("Error updating team.");
    } finally {
      setLoadingTeamId(null);
    }
  };

  // Delete team
  const handleDeleteTeam = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    setLoadingTeamId(id);
    setTeamActionMsg("");

    try {
      const res = await fetch(`/api/teams/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setTeams((prev) => prev.filter((t) => t.id !== id));
        setTeamActionMsg(`Team "${name}" deleted.`);
      } else {
        const data = await res.json();
        setTeamActionMsg(data.error || "Failed to delete team.");
      }
    } catch (err) {
      setTeamActionMsg("Error deleting team.");
    } finally {
      setLoadingTeamId(null);
    }
  };

  // Open Manage Players Modal
  const handleOpenManagePlayers = async (team: AdminTeam) => {
    setTeamToManage(team);
    setTeamPlayersLoading(true);
    setManagePlayersActionMsg("");
    setSelectedPlayerIdsToAdd([]);
    setPlayerToMoveConfirm(null);

    try {
      const res = await fetch(`/api/teams/${team.id}/players`);
      const data = await res.json();
      if (res.ok) {
        setTeamCurrentPlayers(data.currentPlayers || []);
        setTeamAvailablePlayers(data.availablePlayers || []);
      } else {
        setManagePlayersActionMsg(data.error || "Failed to load players.");
      }
    } catch (err) {
      setManagePlayersActionMsg("Error loading team players.");
    } finally {
      setTeamPlayersLoading(false);
    }
  };

  // Toggle player selection for adding
  const handleToggleSelectPlayer = (player: AdminTeamPlayer) => {
    if (selectedPlayerIdsToAdd.includes(player.id)) {
      setSelectedPlayerIdsToAdd((prev) => prev.filter((id) => id !== player.id));
      return;
    }

    // If player belongs to another team, prompt confirmation first
    if (player.teamName && player.teamId !== teamToManage?.id) {
      setPlayerToMoveConfirm({
        player,
        targetTeam: teamToManage!,
      });
      return;
    }

    setSelectedPlayerIdsToAdd((prev) => [...prev, player.id]);
  };

  // Confirm moving player from another team
  const handleConfirmMovePlayer = () => {
    if (playerToMoveConfirm) {
      setSelectedPlayerIdsToAdd((prev) => [...prev, playerToMoveConfirm.player.id]);
      setPlayerToMoveConfirm(null);
    }
  };

  // Add selected players to team
  const handleAddSelectedPlayers = async () => {
    if (!teamToManage || selectedPlayerIdsToAdd.length === 0) return;

    setIsSavingTeamPlayers(true);
    setManagePlayersActionMsg("");

    try {
      const res = await fetch(`/api/teams/${teamToManage.id}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerIds: selectedPlayerIdsToAdd }),
      });

      const data = await res.json();
      if (res.ok) {
        setTeamCurrentPlayers(data.currentPlayers || []);
        setTeamAvailablePlayers(data.availablePlayers || []);
        setSelectedPlayerIdsToAdd([]);
        setManagePlayersActionMsg("Players assigned successfully.");

        // Update main teams list state
        setTeams((prev) =>
          prev.map((t) =>
            t.id === teamToManage.id
              ? {
                  ...t,
                  players: data.currentPlayers || [],
                  playerCount: data.currentPlayers?.length || 0,
                }
              : {
                  ...t,
                  players: (t.players || []).filter(
                    (p) => !selectedPlayerIdsToAdd.includes(p.id)
                  ),
                  playerCount: (t.players || []).filter(
                    (p) => !selectedPlayerIdsToAdd.includes(p.id)
                  ).length,
                }
          )
        );
      } else {
        setManagePlayersActionMsg(data.error || "Failed to assign players.");
      }
    } catch (err) {
      setManagePlayersActionMsg("Error assigning players.");
    } finally {
      setIsSavingTeamPlayers(false);
    }
  };

  // Remove player from team
  const handleRemovePlayerFromTeam = async (playerId: string) => {
    if (!teamToManage) return;

    setIsSavingTeamPlayers(true);
    setManagePlayersActionMsg("");

    try {
      const res = await fetch(`/api/teams/${teamToManage.id}/players/${playerId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (res.ok) {
        setTeamCurrentPlayers(data.currentPlayers || []);
        setTeamAvailablePlayers(data.availablePlayers || []);
        setManagePlayersActionMsg("Player removed from team.");

        // Update main teams list state
        setTeams((prev) =>
          prev.map((t) =>
            t.id === teamToManage.id
              ? {
                  ...t,
                  players: data.currentPlayers || [],
                  playerCount: data.currentPlayers?.length || 0,
                }
              : t
          )
        );
      } else {
        setManagePlayersActionMsg(data.error || "Failed to remove player.");
      }
    } catch (err) {
      setManagePlayersActionMsg("Error removing player.");
    } finally {
      setIsSavingTeamPlayers(false);
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
              Enter your squad Admin PIN to manage matches, sessions, players, and teams.
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

  // Delete Match Confirmation Modal
  const deleteMatchModalContent = matchToDelete && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#171717]/95 border border-error/40 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-surface-container-high pb-3 text-error">
          <span className="material-symbols-outlined text-2xl">warning</span>
          <h3 className="font-headline text-headline-sm text-on-surface uppercase">
            DELETE MATCH?
          </h3>
        </div>

        <p className="font-body text-sm text-on-surface-variant">
          Are you sure you want to permanently delete this match?
        </p>

        {/* Info Box */}
        <div className="glass-panel rounded-xl p-4 border border-surface-container-high bg-black/40 space-y-1 font-mono text-xs text-on-surface">
          <div className="font-bold text-primary text-sm uppercase">
            MATCH #{matchToDelete.matchNumber}
          </div>
          <div>{matchToDelete.dateStr}</div>
          <div>{matchToDelete.totalKills} KILLS</div>
          <div>#{matchToDelete.topPlacement} PLACEMENT</div>
        </div>

        <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error font-label-caps text-xs">
          ⚠️ This action cannot be undone.
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-surface-container-high">
          <button
            type="button"
            onClick={() => setMatchToDelete(null)}
            disabled={isDeletingMatch}
            className="px-4 py-2.5 rounded-xl border border-surface-container-high text-on-surface-variant font-label-caps text-xs hover:text-on-surface transition-colors"
          >
            CANCEL
          </button>
          <button
            type="button"
            onClick={handleConfirmDeleteMatch}
            disabled={isDeletingMatch}
            className="px-5 py-2.5 rounded-xl bg-error text-on-error font-label-caps text-xs font-bold shadow-[0_0_15px_rgba(255,0,0,0.3)] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {isDeletingMatch && (
              <span className="material-symbols-outlined text-sm animate-spin">
                progress_activity
              </span>
            )}
            {isDeletingMatch ? "DELETING..." : "DELETE MATCH"}
          </button>
        </div>
      </div>
    </div>
  );

  // Admin Edit Player Modal JSX
  const editModalContent = editingPlayer && (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#171717]/95 border border-primary/40 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-surface-container-high pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">manage_accounts</span>
            <h3 className="font-headline text-headline-sm text-on-surface uppercase">
              EDIT PLAYER — {editingPlayer.name}
            </h3>
          </div>
          <button
            onClick={() => setEditingPlayer(null)}
            className="text-on-surface-variant hover:text-on-surface p-1"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {editErrorMsg && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error font-label-caps text-xs flex items-center gap-2">
            <span className="material-symbols-outlined text-base">warning</span>
            <span>{editErrorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveEditPlayer} className="space-y-4">
          {/* Gamertag Input */}
          <div className="space-y-1">
            <label className="font-label-caps text-xs text-primary uppercase font-bold block">
              GAMERTAG
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-headline text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Profile Image URL Input */}
          <div className="space-y-1">
            <label className="font-label-caps text-xs text-primary uppercase font-bold block">
              PROFILE IMAGE URL
            </label>
            <input
              type="url"
              value={editAvatarUrl}
              onChange={(e) => {
                setEditAvatarUrl(e.target.value);
                setEditImageError(false);
              }}
              placeholder="https://example.com/avatar.jpg"
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-body text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          {/* Live Image Preview */}
          <div className="space-y-1">
            <label className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold block">
              LIVE AVATAR PREVIEW
            </label>
            <div className="w-full h-32 rounded-xl border border-surface-container-high overflow-hidden bg-black/60 relative flex items-center justify-center">
              {editAvatarUrl.trim() && !editImageError ? (
                <img
                  src={editAvatarUrl}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                  onError={() => setEditImageError(true)}
                  onLoad={() => setEditImageError(false)}
                />
              ) : (
                <div className="flex flex-col items-center gap-1 text-on-surface-variant">
                  <span className="material-symbols-outlined text-2xl text-error">broken_image</span>
                  <span className="font-label-caps text-[10px]">
                    {editImageError ? "Failed to load image preview" : "Enter a valid image URL"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-label-caps text-xs text-on-surface-variant uppercase font-bold block">
                ROLE
              </label>
              <select
                value={editRole}
                onChange={(e) =>
                  setEditRole(e.target.value as "PLAYER" | "MODERATOR" | "ADMIN")
                }
                className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-label-caps text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="PLAYER">PLAYER</option>
                <option value="MODERATOR">MODERATOR</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-label-caps text-xs text-on-surface-variant uppercase font-bold block">
                ACTIVE STATUS
              </label>
              <button
                type="button"
                onClick={() => setEditIsActive(!editIsActive)}
                className={`w-full py-3 px-4 rounded-xl border font-label-caps text-xs font-bold uppercase transition-colors ${
                  editIsActive
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-surface-container text-on-surface-variant border-surface-container-high"
                }`}
              >
                {editIsActive ? "ACTIVE FRAGGER" : "INACTIVE"}
              </button>
            </div>
          </div>

          {/* Change Access Key (Optional) */}
          <div className="space-y-1 pt-2 border-t border-surface-container-high">
            <label className="font-label-caps text-xs text-on-surface-variant uppercase font-bold block">
              CHANGE ACCESS KEY (OPTIONAL)
            </label>
            <input
              type="text"
              value={editSecretKey}
              onChange={(e) => setEditSecretKey(e.target.value)}
              placeholder="Leave blank to keep existing key"
              className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-3 font-mono text-sm text-on-surface focus:outline-none focus:border-primary"
            />
            <span className="font-body text-[11px] text-on-surface-variant/70 block">
              Enter new secret key only if resetting access key. Existing key is never displayed.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-surface-container-high">
            <button
              type="button"
              onClick={() => setEditingPlayer(null)}
              disabled={editSaving}
              className="px-4 py-2.5 rounded-xl border border-surface-container-high text-on-surface-variant font-label-caps text-xs hover:text-on-surface transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={editSaving}
              className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-caps text-xs font-bold shadow-[0_0_15px_rgba(255,77,0,0.3)] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {editSaving && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
              {editSaving ? "SAVING..." : "SAVE CHANGES"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

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
            BGMI Management: Matches, Squad Players & Teams
          </p>
        </div>

        {/* Section Navigation Tabs */}
        <div className="flex bg-surface-container p-1 rounded-xl border border-surface-container-high w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab("MATCHES")}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg font-label-caps text-label-caps uppercase transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
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
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg font-label-caps text-label-caps uppercase transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === "PLAYERS"
                ? "bg-primary text-on-primary font-bold shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            PLAYERS ({players.length})
          </button>

          <button
            onClick={() => setActiveTab("TEAMS")}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg font-label-caps text-label-caps uppercase transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === "TEAMS"
                ? "bg-primary text-on-primary font-bold shadow-md"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">shield</span>
            TEAMS ({teams.length})
          </button>

          <button
            onClick={() => setActiveTab("GOLDEN_GUN")}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-lg font-label-caps text-label-caps uppercase transition-all flex items-center justify-center gap-2 whitespace-nowrap ${
              activeTab === "GOLDEN_GUN"
                ? "bg-[#D4AF37] text-black font-bold shadow-md shadow-[#D4AF37]/20"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">military_tech</span>
            GOLDEN GUN
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

          {matchActionMsg && (
            <div className="p-3 rounded-lg bg-surface-container border border-primary/30 text-primary font-body text-xs text-center">
              {matchActionMsg}
            </div>
          )}

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

          {/* ADMIN MATCH MANAGEMENT LIST */}
          <section className="space-y-3">
            <div className="flex justify-between items-center bg-surface-container rounded-xl p-4 border border-surface-container-high">
              <h3 className="font-headline text-headline-sm text-on-surface uppercase">
                LOGGED MATCHES ({matches.length})
              </h3>
              <span className="font-label-caps text-xs text-on-surface-variant">
                Manage & Delete Matches
              </span>
            </div>

            <div className="space-y-3">
              {matches.length > 0 ? (
                matches.map((m) => (
                  <div
                    key={m.id}
                    className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-surface-container-high hover:border-primary/40 transition-colors"
                  >
                    {/* Match Overview */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-12 h-12 rounded-xl bg-surface-container border border-surface-container-high flex flex-col items-center justify-center shrink-0">
                        <span className="font-display-stat text-lg text-primary">
                          #{m.matchNumber}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline text-headline-sm text-on-surface">
                            MATCH #{m.matchNumber}
                          </h4>
                          <span
                            className={`font-label-caps text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              m.sessionStatus === "PUBLISHED"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : "bg-primary/10 text-primary border border-primary/30"
                            }`}
                          >
                            {m.sessionStatus}
                          </span>
                        </div>

                        <div className="font-body text-xs text-on-surface-variant flex items-center gap-2 mt-0.5">
                          <span>{m.dateStr}</span>
                          <span>•</span>
                          <span>{m.totalKills} KILLS</span>
                          <span>•</span>
                          <span className="text-gold font-bold">
                            #{m.topPlacement} {m.topTeamName}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-surface-container-high">
                      <Link
                        href={`/admin/matches/${m.id}/edit`}
                        className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high border border-primary/40 text-primary font-label-caps text-xs flex items-center gap-1 transition-colors font-bold"
                        title="Edit Match"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        EDIT
                      </Link>

                      <Link
                        href={`/matches/${m.id}`}
                        className="px-3 py-1.5 rounded bg-surface-container hover:bg-surface-container-high border border-surface-container-high text-on-surface font-label-caps text-xs flex items-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                        VIEW
                      </Link>


                      {/* DELETE MATCH Button */}
                      <button
                        type="button"
                        onClick={() => setMatchToDelete(m)}
                        className="px-3 py-1.5 rounded bg-error/10 hover:bg-error/20 border border-error/40 text-error font-label-caps text-xs flex items-center gap-1 transition-colors font-bold"
                        title="Delete Match"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                        DELETE
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-on-surface-variant font-label-caps text-label-caps glass-panel rounded-xl">
                  NO MATCHES LOGGED YET.
                </div>
              )}
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
                Manage squad member roles, permissions, avatars, and active status.
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
          <div className="space-y-4">
            {players.length > 0 ? (
              players.map((p) => {
                const isAdmin = p.role === "ADMIN";
                const isMod = p.role === "MODERATOR";

                return (
                  <div
                    key={p.id}
                    className={`glass-panel rounded-2xl p-5 flex flex-col gap-4 border transition-colors ${
                      !p.isActive
                        ? "opacity-60 bg-surface-container/30 border-surface-container-high"
                        : "hover:border-primary/40 border-surface-container-high"
                    }`}
                  >
                    {/* Top Row: Avatar + Gamertag + Role + Status */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl border border-primary/30 overflow-hidden relative flex-shrink-0 bg-surface-container flex items-center justify-center shadow-md">
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-headline text-lg font-bold text-on-surface uppercase">
                              {p.name}
                            </h4>

                            <span
                              className={`font-label-caps text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                                isAdmin
                                  ? "bg-[#D4AF37]/20 text-[#F5D76E] border border-[#D4AF37]/40"
                                  : isMod
                                  ? "bg-primary/20 text-primary border border-primary/40"
                                  : "bg-surface-container-high text-on-surface-variant border border-surface-variant"
                              }`}
                            >
                              {p.role}
                            </span>
                          </div>

                          <span className="font-body text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                p.isActive ? "bg-emerald-400" : "bg-zinc-500"
                              }`}
                            />
                            {p.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </div>
                      </div>

                      {/* Quick Role & Active Actions */}
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        {/* Role Selector */}
                        <select
                          value={p.role}
                          disabled={loadingPlayerId === p.id}
                          onChange={(e) =>
                            handleUpdatePlayer(p.id, {
                              role: e.target.value as "PLAYER" | "MODERATOR" | "ADMIN",
                            })
                          }
                          className="bg-surface-container border border-surface-container-high text-on-surface font-label-caps text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-primary"
                        >
                          <option value="PLAYER">PLAYER</option>
                          <option value="MODERATOR">MODERATOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>

                        {/* Active Status Toggle */}
                        <button
                          onClick={() => handleUpdatePlayer(p.id, { isActive: !p.isActive })}
                          disabled={loadingPlayerId === p.id}
                          className={`font-label-caps text-xs px-3 py-1.5 rounded-lg border transition-colors font-bold ${
                            p.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-surface-container text-on-surface-variant border-surface-variant hover:text-on-surface"
                          }`}
                        >
                          {p.isActive ? "ACTIVE" : "INACTIVE"}
                        </button>

                        {/* Delete Action */}
                        <button
                          onClick={() => handleDeletePlayer(p.id, p.name)}
                          disabled={loadingPlayerId === p.id}
                          title="Delete Player"
                          className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded-lg hover:bg-error/10"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-surface-container-high/80 w-full" />

                    {/* Middle Stats Bar: KILLS, MATCHES, GOLDEN GUN */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 rounded-xl bg-surface-container/60 border border-surface-container-high items-center">
                      {/* Kills */}
                      <div className="flex flex-col items-center sm:items-start pl-1 sm:pl-2">
                        <span className="font-label-caps text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                          KILLS
                        </span>
                        <span className="font-mono text-base sm:text-lg text-primary font-extrabold">
                          {p.totalKills || 0}
                        </span>
                      </div>

                      {/* Matches */}
                      <div className="flex flex-col items-center sm:items-start border-x border-surface-container-high px-2">
                        <span className="font-label-caps text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                          MATCHES
                        </span>
                        <span className="font-mono text-base sm:text-lg text-white font-extrabold">
                          {p.matchesCount || 0}
                        </span>
                      </div>

                      {/* Golden Gun with Edit Button */}
                      <div className="flex items-center justify-between gap-2 pr-1 sm:pr-2">
                        <div className="flex flex-col items-center sm:items-start">
                          <span className="font-label-caps text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider flex items-center gap-1">
                            <span>GOLDEN GUN</span>
                          </span>
                          <span className="font-mono text-base sm:text-lg text-[#F5D76E] font-extrabold flex items-center gap-1">
                            <span>🏆</span>
                            <span>× {p.goldenGunCount || 0}</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleOpenEditGoldenGun(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#D4AF37]/15 border border-[#D4AF37]/40 hover:bg-[#D4AF37]/25 text-[#F5D76E] font-label-caps text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 shrink-0 shadow-sm"
                          title="Edit Golden Gun Count"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                          <span>EDIT</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Row Actions */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-surface-container-high/60">
                      <button
                        onClick={() => handleOpenEditModal(p)}
                        disabled={loadingPlayerId === p.id}
                        className="font-label-caps text-xs px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/40 text-primary flex items-center gap-1.5 transition-colors font-bold uppercase tracking-wider"
                        title="Edit Player Profile Details"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        EDIT PROFILE
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

      {/* SECTION 3: TEAMS MANAGEMENT */}
      {activeTab === "TEAMS" && (
        <div className="flex flex-col gap-stack-md">
          {/* Header & Add Button */}
          <div className="flex justify-between items-center bg-surface-container rounded-xl p-4 border border-surface-container-high">
            <div>
              <h3 className="font-headline text-headline-sm text-on-surface uppercase">
                Squad Teams ({teams.length})
              </h3>
              <p className="font-body text-body-md text-on-surface-variant text-xs mt-0.5">
                Manage teams that participate in multi-team BGMI matches.
              </p>
            </div>

            <button
              onClick={() => setShowAddTeam(!showAddTeam)}
              className="bg-primary text-on-primary font-label-caps text-label-caps px-4 py-2.5 rounded-lg flex items-center gap-1.5 uppercase hover:opacity-90 transition-opacity"
            >
              <span className="material-symbols-outlined text-sm">
                {showAddTeam ? "close" : "add"}
              </span>
              {showAddTeam ? "Cancel" : "Add Team"}
            </button>
          </div>

          {teamActionMsg && (
            <div className="p-3 rounded-lg bg-surface-container border border-primary/30 text-primary font-body text-xs text-center">
              {teamActionMsg}
            </div>
          )}

          {/* Add New Team Form Drawer */}
          {showAddTeam && (
            <form
              onSubmit={handleAddTeam}
              className="glass-panel rounded-xl p-5 border border-primary/40 space-y-4"
            >
              <h4 className="font-label-caps text-label-caps text-primary uppercase">
                Create New Team
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_120px] gap-4 items-start">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      value={newTeamName}
                      onChange={(e) => setNewTeamName(e.target.value)}
                      placeholder="e.g. TEAM LION"
                      required
                      minLength={2}
                      maxLength={40}
                      className="w-full bg-surface-container border border-surface-container-high rounded-lg px-3 py-2.5 font-label-caps text-label-caps text-on-surface focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                      Team Avatar URL (HTTPS)
                    </label>
                    <input
                      type="url"
                      value={newTeamAvatarUrl}
                      onChange={(e) => {
                        setNewTeamAvatarUrl(e.target.value);
                        setNewTeamImageError(false);
                      }}
                      placeholder="https://example.com/team-lion.png"
                      className="w-full bg-surface-container border border-surface-container-high rounded-lg px-3 py-2.5 font-label-caps text-label-caps text-on-surface focus:outline-none focus:border-primary"
                    />
                    <span className="text-[11px] text-on-surface-variant/60 block">
                      Optional hosted HTTPS image. Clean initial icon used as fallback.
                    </span>
                  </div>
                </div>

                {/* Live Preview Box */}
                <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-container border border-surface-container-high">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Preview
                  </span>
                  <div className="w-16 h-16 rounded-xl bg-[#030914] border border-primary/30 p-1 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(255,77,0,0.15)] relative">
                    {newTeamAvatarUrl.trim() && !newTeamImageError ? (
                      <img
                        src={newTeamAvatarUrl.trim()}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                        onError={() => setNewTeamImageError(true)}
                      />
                    ) : (
                      <span className="font-headline text-2xl font-extrabold text-primary uppercase">
                        {newTeamName.trim() ? newTeamName.trim().charAt(0).toUpperCase() : "T"}
                      </span>
                    )}
                  </div>
                  {newTeamImageError && (
                    <span className="text-[10px] text-error font-bold">Image Failed</span>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddTeam(false)}
                  className="px-4 py-2 rounded-lg font-label-caps text-xs text-on-surface-variant uppercase border border-surface-container-high hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-on-primary font-label-caps text-label-caps px-6 py-2.5 rounded-lg uppercase font-bold"
                >
                  Add Team
                </button>
              </div>
            </form>
          )}

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.length > 0 ? (
              teams.map((t) => (
                <div
                  key={t.id}
                  className={`glass-panel rounded-xl p-5 flex flex-col justify-between gap-4 border transition-colors ${
                    !t.isActive ? "opacity-60 bg-surface-container/30" : "hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      {/* Hexagonal/Angular Esports Shield Frame */}
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 via-surface-container to-transparent border border-primary/40 p-1 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,77,0,0.2)] overflow-hidden relative">
                        <div className="w-full h-full rounded-lg bg-[#040812] flex items-center justify-center overflow-hidden relative">
                          {t.avatarUrl ? (
                            <img
                              src={t.avatarUrl}
                              alt={t.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                                const fallback = (e.target as HTMLElement).parentElement?.querySelector('.team-card-fallback') as HTMLElement;
                                if (fallback) fallback.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <span
                            className="team-card-fallback font-headline text-xl font-extrabold text-primary uppercase"
                            style={{ display: t.avatarUrl ? "none" : "flex" }}
                          >
                            {t.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-headline text-headline-sm text-on-surface">
                            {t.name}
                          </h4>
                          <span className="font-label-caps text-[10px] px-2 py-0.5 rounded font-bold uppercase bg-primary/10 text-primary border border-primary/30">
                            {t.players?.length || t.playerCount || 0} PLAYERS
                          </span>
                        </div>
                        <span className="font-body text-xs text-on-surface-variant/70 block mt-0.5">
                          Status: {t.isActive ? "Active Team" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* EDIT Team Button */}
                      <button
                        onClick={() => handleOpenEditTeamModal(t)}
                        disabled={loadingTeamId === t.id}
                        className="font-label-caps text-xs px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high border border-primary/40 text-primary flex items-center gap-1 transition-colors font-bold"
                        title="Edit Team"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                        EDIT
                      </button>

                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => handleUpdateTeam(t.id, { isActive: !t.isActive })}
                        disabled={loadingTeamId === t.id}
                        className={`font-label-caps text-xs px-2.5 py-1 rounded border transition-colors ${
                          t.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-surface-container text-on-surface-variant border-surface-variant hover:text-on-surface"
                        }`}
                      >
                        {t.isActive ? "Active" : "Inactive"}
                      </button>

                      {/* Delete Team */}
                      <button
                        onClick={() => handleDeleteTeam(t.id, t.name)}
                        disabled={loadingTeamId === t.id}
                        title="Delete Team"
                        className="p-1 text-on-surface-variant hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Assigned Players List */}
                  <div className="space-y-2 pt-2 border-t border-surface-container-high/60">
                    <div className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
                      Roster Members:
                    </div>
                    {t.players && t.players.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {t.players.map((p) => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container border border-surface-container-high text-xs font-mono text-on-surface"
                          >
                            <img
                              src={p.avatarUrl}
                              alt={p.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span>{p.name}</span>
                            <span className="text-[9px] text-primary uppercase font-bold">
                              [{p.role}]
                            </span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-on-surface-variant/60 font-body italic">
                        No players assigned yet. Click Manage Players to add fraggers.
                      </div>
                    )}
                  </div>

                  {/* Manage Players CTA */}
                  <div className="pt-2 border-t border-surface-container-high/60 flex justify-end">
                    <button
                      onClick={() => handleOpenManagePlayers(t)}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-primary-cta text-white hover:bg-primary-container font-label-caps text-xs flex items-center justify-center gap-1.5 transition-all uppercase font-bold shadow-[0_0_10px_rgba(255,77,0,0.25)]"
                    >
                      <span className="material-symbols-outlined text-base">group_add</span>
                      MANAGE PLAYERS
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-on-surface-variant font-label-caps text-label-caps glass-panel rounded-xl col-span-2">
                NO TEAMS CREATED YET. CLICK "+ ADD TEAM" TO CREATE TEAMS FOR MATCHES.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: GOLDEN GUN AWARD MANAGEMENT */}
      {activeTab === "GOLDEN_GUN" && (
        <AdminGoldenGunSection
          initialDetails={initialGoldenGun || null}
          initialSessions={initialGoldenGunSessions || []}
        />
      )}


      {/* Delete Match Modal Portal */}
      {deleteMatchModalContent && createPortal(deleteMatchModalContent, document.body)}

      {/* Edit Player Modal Portal */}
      {editModalContent && createPortal(editModalContent, document.body)}

      {/* Edit Team Modal Portal */}
      {editingTeam &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#171717]/95 border border-primary/40 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-surface-container-high pb-3">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-2xl">edit_note</span>
                  <h3 className="font-headline text-headline-sm text-on-surface uppercase">
                    EDIT TEAM
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {editTeamErrorMsg && (
                <div className="p-3 rounded-lg bg-error/10 border border-error/30 text-error font-body text-xs text-center">
                  {editTeamErrorMsg}
                </div>
              )}

              <form onSubmit={handleSaveEditTeam} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    value={editTeamName}
                    onChange={(e) => setEditTeamName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={40}
                    className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 font-label-caps text-label-caps text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-label-caps text-xs text-on-surface-variant uppercase">
                    Team Avatar URL (HTTPS)
                  </label>
                  <input
                    type="url"
                    value={editTeamAvatarUrl}
                    onChange={(e) => {
                      setEditTeamAvatarUrl(e.target.value);
                      setEditTeamImageError(false);
                    }}
                    placeholder="https://example.com/team-lion.png"
                    className="w-full bg-surface-container border border-surface-container-high rounded-xl px-4 py-2.5 font-label-caps text-label-caps text-on-surface focus:outline-none focus:border-primary"
                  />
                  <span className="text-[11px] text-on-surface-variant/60 block">
                    Optional hosted HTTPS image. Leave empty to use initial icon.
                  </span>
                </div>

                {/* Live Preview */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-surface-container border border-surface-container-high">
                  <div className="w-14 h-14 rounded-xl bg-[#030914] border border-primary/30 p-1 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(255,77,0,0.2)] shrink-0 relative">
                    {editTeamAvatarUrl.trim() && !editTeamImageError ? (
                      <img
                        src={editTeamAvatarUrl.trim()}
                        alt="Preview"
                        className="w-full h-full object-cover rounded-lg"
                        onError={() => setEditTeamImageError(true)}
                      />
                    ) : (
                      <span className="font-headline text-xl font-extrabold text-primary uppercase">
                        {editTeamName.trim() ? editTeamName.trim().charAt(0).toUpperCase() : "T"}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="font-label-caps text-xs text-on-surface block font-bold">
                      {editTeamName || "Team Name"}
                    </span>
                    <span className="text-[11px] text-on-surface-variant/70 block mt-0.5">
                      {editTeamImageError
                        ? "⚠️ Image URL failed to load"
                        : editTeamAvatarUrl.trim()
                        ? "✓ Custom Avatar Active"
                        : "Fallback initial icon active"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="px-4 py-2.5 rounded-xl border border-surface-container-high text-on-surface-variant font-label-caps text-xs hover:text-on-surface transition-colors"
                  >
                    CANCEL
                  </button>

                  <button
                    type="submit"
                    disabled={editTeamSaving}
                    className="px-6 py-2.5 rounded-xl bg-primary-cta text-white font-label-caps text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,77,0,0.3)] hover:bg-primary-container disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {editTeamSaving && (
                      <span className="material-symbols-outlined text-sm animate-spin">
                        progress_activity
                      </span>
                    )}
                    SAVE CHANGES
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}


      {/* Manage Team Players Modal Portal */}
      {teamToManage &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#171717]/95 border border-primary/40 rounded-2xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-surface-container-high pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-2xl">shield</span>
                  </div>
                  <div>
                    <span className="font-label-caps text-[10px] text-primary uppercase tracking-widest font-bold block">
                      TEAM ROSTER MANAGEMENT
                    </span>
                    <h3 className="font-headline text-headline-sm text-on-surface uppercase">
                      {teamToManage.name}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setTeamToManage(null)}
                  className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-2xl">close</span>
                </button>
              </div>

              {/* Status Action Message */}
              {managePlayersActionMsg && (
                <div className="p-3 rounded-lg bg-surface-container border border-primary/30 text-primary font-body text-xs text-center">
                  {managePlayersActionMsg}
                </div>
              )}

              {/* SECTION 1: CURRENT PLAYERS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                    CURRENT PLAYERS ({teamCurrentPlayers.length})
                  </h4>
                </div>

                {teamPlayersLoading ? (
                  <div className="text-center py-6 text-on-surface-variant font-label-caps text-xs flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg animate-spin">
                      progress_activity
                    </span>
                    LOADING ROSTER...
                  </div>
                ) : teamCurrentPlayers.length > 0 ? (
                  <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                    {teamCurrentPlayers.map((p) => (
                      <div
                        key={p.id}
                        className="glass-panel rounded-xl p-3 flex items-center justify-between gap-3 border border-surface-container-high"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatarUrl}
                            alt={p.name}
                            className="w-9 h-9 rounded-full object-cover border border-surface-container-high"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-headline text-sm text-on-surface font-bold">
                                {p.name}
                              </span>
                              <span className="font-label-caps text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-bold uppercase">
                                {p.role}
                              </span>
                            </div>
                            <span className="font-body text-[11px] text-on-surface-variant/70 block">
                              {p.isActive ? "Active Fragger" : "Inactive"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemovePlayerFromTeam(p.id)}
                          disabled={isSavingTeamPlayers}
                          className="px-3 py-1.5 rounded-lg bg-error/10 hover:bg-error/20 border border-error/40 text-error font-label-caps text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">person_remove</span>
                          REMOVE
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-surface-container/50 border border-surface-container-high text-center text-xs text-on-surface-variant font-body">
                    No players currently assigned to {teamToManage.name}. Select from available players below.
                  </div>
                )}
              </div>

              {/* SECTION 2: ADD PLAYERS TO TEAM */}
              <div className="space-y-3 pt-4 border-t border-surface-container-high">
                <div className="flex items-center justify-between">
                  <h4 className="font-label-caps text-xs text-on-surface-variant uppercase tracking-wider font-bold">
                    AVAILABLE PLAYERS TO ADD
                  </h4>
                  <span className="font-label-caps text-[10px] text-primary">
                    {selectedPlayerIdsToAdd.length} SELECTED
                  </span>
                </div>

                {teamAvailablePlayers.length > 0 ? (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {teamAvailablePlayers.map((p) => {
                      const isSelected = selectedPlayerIdsToAdd.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleToggleSelectPlayer(p)}
                          className={`rounded-xl p-3 flex items-center justify-between gap-3 border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-primary/10 border-primary/60 shadow-[0_0_10px_rgba(255,77,0,0.15)]"
                              : "glass-panel border-surface-container-high hover:border-surface-container-highest"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded border flex items-center justify-center text-xs ${
                                isSelected
                                  ? "bg-primary-cta border-primary text-white"
                                  : "border-surface-container-high bg-surface-container text-transparent"
                              }`}
                            >
                              <span className="material-symbols-outlined text-sm">check</span>
                            </div>

                            <img
                              src={p.avatarUrl}
                              alt={p.name}
                              className="w-9 h-9 rounded-full object-cover border border-surface-container-high"
                            />

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-headline text-sm text-on-surface font-bold">
                                  {p.name}
                                </span>
                                <span className="font-label-caps text-[9px] px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant border border-surface-container-high font-bold uppercase">
                                  {p.role}
                                </span>
                              </div>

                              {p.teamName ? (
                                <span className="font-body text-[11px] text-amber-400 font-semibold block">
                                  ⚠️ Currently assigned to {p.teamName}
                                </span>
                              ) : (
                                <span className="font-body text-[11px] text-emerald-400 font-semibold block">
                                  ✓ Unassigned Fragger
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-surface-container/50 border border-surface-container-high text-center text-xs text-on-surface-variant font-body">
                    All registered players are already in this team.
                  </div>
                )}

                {/* Add Selected Players CTA */}
                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setTeamToManage(null)}
                    className="px-4 py-2.5 rounded-xl border border-surface-container-high text-on-surface-variant font-label-caps text-xs hover:text-on-surface transition-colors"
                  >
                    CLOSE
                  </button>

                  <button
                    type="button"
                    onClick={handleAddSelectedPlayers}
                    disabled={selectedPlayerIdsToAdd.length === 0 || isSavingTeamPlayers}
                    className="px-6 py-2.5 rounded-xl bg-primary-cta text-white font-label-caps text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,77,0,0.3)] hover:bg-primary-container disabled:opacity-50 transition-all flex items-center gap-2"
                  >
                    {isSavingTeamPlayers && (
                      <span className="material-symbols-outlined text-sm animate-spin">
                        progress_activity
                      </span>
                    )}
                    ADD SELECTED PLAYERS ({selectedPlayerIdsToAdd.length})
                  </button>
                </div>
              </div>

              {/* Move Player Confirmation Dialog */}
              {playerToMoveConfirm && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 text-amber-400 font-label-caps text-xs font-bold uppercase">
                    <span className="material-symbols-outlined text-base">swap_horiz</span>
                    CONFIRM ROSTER TRANSFER
                  </div>
                  <p className="font-body text-xs text-on-surface">
                    <span className="font-bold text-white">{playerToMoveConfirm.player.name}</span> is currently assigned to{" "}
                    <span className="font-bold text-amber-400">{playerToMoveConfirm.player.teamName}</span>. Move them to{" "}
                    <span className="font-bold text-primary">{playerToMoveConfirm.targetTeam.name}</span>?
                  </p>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPlayerToMoveConfirm(null)}
                      className="px-3 py-1.5 rounded-lg border border-surface-container-high text-on-surface-variant font-label-caps text-xs"
                    >
                      CANCEL
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmMovePlayer}
                      className="px-4 py-1.5 rounded-lg bg-amber-500 text-black font-label-caps text-xs font-bold"
                    >
                      MOVE PLAYER
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}

      {/* Edit Golden Gun Count Modal Portal */}
      {editingGoldenGunPlayer &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#111111] border border-[#D4AF37]/50 rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center border-b border-surface-container-high pb-3">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <span className="text-2xl">🏆</span>
                  <h3 className="font-headline text-base sm:text-lg font-bold text-white uppercase tracking-tight">
                    EDIT GOLDEN GUN COUNT
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingGoldenGunPlayer(null)}
                  className="text-on-surface-variant hover:text-white p-1 rounded-lg"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {goldenGunEditError && (
                <div className="p-3 rounded-xl bg-error-container/20 border border-error/30 text-error font-label-caps text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base">warning</span>
                  <span>{goldenGunEditError}</span>
                </div>
              )}

              <form onSubmit={handleSaveGoldenGunCount} className="space-y-4">
                <div className="space-y-1">
                  <label className="font-label-caps text-xs text-on-surface-variant uppercase font-bold block">
                    PLAYER
                  </label>
                  <div className="w-full bg-[#161616] border border-surface-container-high rounded-xl px-4 py-2.5 font-headline font-bold text-white flex items-center gap-2.5">
                    <img
                      src={editingGoldenGunPlayer.avatarUrl}
                      alt={editingGoldenGunPlayer.name}
                      className="w-7 h-7 rounded-lg object-cover border border-surface-container-high"
                    />
                    <span>{editingGoldenGunPlayer.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-label-caps text-xs text-on-surface-variant uppercase font-bold block">
                      CURRENT COUNT
                    </label>
                    <div className="w-full bg-[#161616] border border-surface-container-high rounded-xl px-4 py-2.5 font-mono text-sm text-on-surface-variant">
                      🏆 {editingGoldenGunPlayer.goldenGunCount || 0}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-label-caps text-xs text-[#D4AF37] uppercase font-bold block">
                      NEW COUNT
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      required
                      value={newGoldenGunCount}
                      onChange={(e) =>
                        setNewGoldenGunCount(
                          e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                        )
                      }
                      className="w-full bg-[#161616] border border-[#D4AF37]/60 rounded-xl px-4 py-2.5 font-mono text-base font-bold text-[#F5D76E] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container-high">
                  <button
                    type="button"
                    onClick={() => setEditingGoldenGunPlayer(null)}
                    disabled={isSavingGoldenGun}
                    className="px-4 py-2 rounded-xl border border-surface-container-high text-on-surface-variant hover:text-white font-label-caps text-xs font-bold uppercase tracking-wider"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingGoldenGun}
                    className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#e0bb3e] text-black font-label-caps text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                  >
                    {isSavingGoldenGun && (
                      <span className="material-symbols-outlined text-sm animate-spin">
                        progress_activity
                      </span>
                    )}
                    SAVE COUNT
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}
    </main>
  );
}


