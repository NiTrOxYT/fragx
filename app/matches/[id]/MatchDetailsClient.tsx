"use client";

import { useState } from "react";
import ScreenshotModal from "@/components/common/ScreenshotModal";

interface MatchTeamPlayer {
  id: string;
  name: string;
  avatarUrl: string;
  kills: number;
}

interface MatchTeamDetail {
  id: string;
  teamName: string;
  placement: number;
  players: MatchTeamPlayer[];
}

interface MatchDetailsClientProps {
  match: {
    id: string;
    matchNumber: number;
    placement: number;
    kills: number;
    playerName: string;
    dateStr: string;
    screenshotUrl: string;
    duration: string;
    matchTeams?: MatchTeamDetail[];
  };
}

export default function MatchDetailsClient({ match }: MatchDetailsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isMultiTeam = Boolean(match.matchTeams && match.matchTeams.length > 0);
  const topTeam = isMultiTeam && match.matchTeams ? match.matchTeams[0] : null;

  const totalKills = isMultiTeam && match.matchTeams
    ? match.matchTeams.reduce(
        (acc, mt) => acc + mt.players.reduce((pAcc, p) => pAcc + p.kills, 0),
        0
      )
    : match.kills;


  const handleShare = async () => {
    const titleText = isMultiTeam
      ? `FRAGX - Match #${match.matchNumber} (${topTeam?.teamName} WINNER)`
      : `FRAGX - Match #${match.matchNumber} (${match.playerName})`;

    const shareData = {
      title: titleText,
      text: isMultiTeam
        ? `Match #${match.matchNumber} result: ${topTeam?.teamName} placed #${topTeam?.placement} with ${totalKills} total squad kills!`
        : `${match.playerName} got #${match.placement} Placement with ${match.kills} Kills on BGMI!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Share cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch (err) {
        console.error("Clipboard copy failed", err);
      }
    }
  };

  return (
    <>
      <main className="flex-1 w-full max-w-md mx-auto pt-header-safe md:pt-24 px-safe-margin pb-stack-lg flex flex-col gap-stack-lg relative z-10">
        {/* Primary Match Stat Hero */}
        <section className="flex flex-col items-center justify-center text-center">
          <div className="flex items-end gap-stack-md justify-center">
            <div className="flex flex-col items-center">
              <span className="font-display-stat text-display-stat text-primary drop-shadow-[0_0_12px_rgba(255,181,158,0.4)]">
                #{match.matchNumber}
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant mt-stack-sm uppercase">
                MATCH NUMBER
              </span>
            </div>

            <div className="h-12 w-px bg-surface-container-high mx-stack-sm mb-stack-sm" />

            <div className="flex flex-col items-center">
              <span className="font-display-stat text-display-stat text-on-background">
                {totalKills}
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant mt-stack-sm uppercase">
                TOTAL KILLS
              </span>
            </div>
          </div>

          <div className="mt-stack-md flex items-center justify-center gap-stack-sm text-on-surface-variant font-label-caps text-label-caps border border-surface-container-high rounded-full px-4 py-2 bg-surface-container-low/50 backdrop-blur-sm">
            <span
              className="material-symbols-outlined text-[16px] text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              calendar_today
            </span>
            <span className="text-on-background">{match.dateStr}</span>
            <span className="w-1 h-1 rounded-full bg-surface-container-highest mx-1" />
            <span>{match.duration}</span>
          </div>
        </section>

        {/* Multi-Team Roster & Placements Breakdown */}
        {isMultiTeam && match.matchTeams && (
          <section className="space-y-3">
            <h3 className="font-label-caps text-label-caps text-primary uppercase font-bold">
              PARTICIPATING TEAMS & PLAYER FRAGS
            </h3>

            <div className="space-y-3">
              {match.matchTeams.map((team) => (
                <div
                  key={team.id}
                  className="glass-panel rounded-xl p-4 border border-surface-container-high space-y-3"
                >
                  <div className="flex justify-between items-center border-b border-surface-container-high pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-headline-sm text-gold font-bold">
                        #{team.placement}
                      </span>
                      <h4 className="font-headline text-headline-sm text-on-surface">
                        {team.teamName}
                      </h4>
                    </div>

                    <span className="font-label-caps text-xs text-primary font-bold">
                      {team.players.reduce((acc, p) => acc + p.kills, 0)} TEAM KILLS
                    </span>
                  </div>

                  <div className="space-y-2">
                    {team.players.map((p) => (
                      <div
                        key={p.id}
                        className="flex justify-between items-center p-2 rounded-lg bg-surface-container/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden bg-surface-container flex items-center justify-center">
                            <img
                              src={p.avatarUrl || "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"}
                              alt={p.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-headline text-sm text-on-surface">
                            {p.name}
                          </span>
                        </div>

                        <span className="font-stat-value text-sm text-primary font-bold font-mono">
                          {p.kills} KILLS
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Match Screenshot / Proof */}
        <section
          onClick={() => setIsModalOpen(true)}
          className="relative w-full aspect-video rounded-xl overflow-hidden border border-surface-container shadow-[0_8px_32px_rgba(0,0,0,0.6)] group cursor-pointer"
        >
          <img
            src={match.screenshotUrl}
            alt={`Match #${match.matchNumber} proof`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          <div className="absolute bottom-4 left-4 right-4 p-stack-sm rounded-lg bg-surface/60 backdrop-blur-md border border-surface-container-highest flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                photo_camera
              </span>
              <span className="font-label-caps text-label-caps text-on-background">
                MATCH #{match.matchNumber} PROOF
              </span>
            </div>
            <span className="font-label-caps text-label-caps text-primary uppercase">
              TAP TO ENLARGE
            </span>
          </div>
        </section>

        {/* Action Button */}
        <button
          onClick={handleShare}
          className="w-full mt-auto bg-primary text-on-primary font-headline text-headline-md rounded-xl py-4 flex justify-center items-center gap-2 shadow-[0_0_20px_rgba(255,181,158,0.2)] hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            share
          </span>
          {copied ? "LINK COPIED TO CLIPBOARD!" : "SHARE RESULT"}
        </button>
      </main>

      {/* Screenshot Modal */}
      <ScreenshotModal
        isOpen={isModalOpen}
        src={match.screenshotUrl}
        alt={`Match #${match.matchNumber} screenshot`}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
