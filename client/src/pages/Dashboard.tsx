import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Zap, Users, Trophy, Coins, Settings, LogOut, Menu, Gamepad2, Sparkles, Globe, Heart, Star, Shield, ExternalLink } from "lucide-react";
import { BeingSelectionModal, BEINGS } from "@/components/BeingSelectionModal";
import { MissionDetailModal } from "@/components/MissionDetailModal";
import { useMissionAutoComplete } from "@/hooks/useMissionAutoComplete";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";

export default function Dashboard() {
  useMissionAutoComplete();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"missions" | "coins" | "profile" | "lounges">("missions");
  const [showMenu, setShowMenu] = useState(false);
  const [earningsFilter, setEarningsFilter] = useState<"all" | "games" | "missions">("all");
  const [selectedMission, setSelectedMission] = useState<{ id: number; title: string; description: string; category: string; rewardCoins: number | null } | null>(null);

  // Fetch data
  const missionsQuery = trpc.missions.getMissions.useQuery();
  const myContributionsQuery = trpc.missions.getMyContributions.useQuery();
  const coinBalanceQuery = trpc.coins.getBalance.useQuery();
  const coinHistoryQuery = trpc.coins.getHistory.useQuery();
  const profileQuery = trpc.profiles.getProfile.useQuery();
  const loungesQuery = trpc.lounges.getLounges.useQuery();

  const utils = trpc.useUtils();

  // Full profile for being system
  const fullProfileQuery = trpc.profiles.getMyFullProfile.useQuery();
  const [showBeingModal, setShowBeingModal] = useState(false);
  // Once the user completes being selection this session, suppress the auto-show
  const [beingSelectionDone, setBeingSelectionDone] = useState(false);

  // Show being selection modal if user has no being chosen yet (and hasn't just completed it)
  const hasChosenBeing = !!fullProfileQuery.data?.profile?.beingType;
  const needsBeingSelection = fullProfileQuery.isSuccess && !hasChosenBeing && !beingSelectionDone;

  // Track previous balance to animate changes
  const prevBalanceRef = useRef<number>(0);
  const [balanceFlash, setBalanceFlash] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentBalance = coinBalanceQuery.data
    ? Math.floor(parseFloat(coinBalanceQuery.data.balance?.toString() || "0"))
    : 0;

  // Whether we've received the first real balance load from the server
  const hasLoadedBalance = useRef(false);

  useEffect(() => {
    // Skip until the query has returned data at least once
    if (!coinBalanceQuery.data) return;

    if (!hasLoadedBalance.current) {
      // First load — record baseline, no animation
      hasLoadedBalance.current = true;
      prevBalanceRef.current = currentBalance;
      return;
    }

    // Fire confetti on any balance increase after baseline is set
    if (currentBalance > prevBalanceRef.current) {
      setBalanceFlash(true);
      setShowConfetti(true);
      setConfettiKey(k => k + 1);
      setTimeout(() => setBalanceFlash(false), 1200);
      setTimeout(() => setShowConfetti(false), 1800);
    }
    prevBalanceRef.current = currentBalance;
  }, [currentBalance, coinBalanceQuery.data]);

  // Confetti particle data — 12 particles with different colors and trajectories
  const confettiParticles = [
    { color: "#ff00cc", dx: -40, dy: -60, rotate: 45 },
    { color: "#00eaff", dx: 40, dy: -70, rotate: -30 },
    { color: "#facc15", dx: -20, dy: -80, rotate: 60 },
    { color: "#c084fc", dx: 60, dy: -50, rotate: -60 },
    { color: "#ff00cc", dx: -60, dy: -40, rotate: 90 },
    { color: "#00eaff", dx: 20, dy: -90, rotate: -45 },
    { color: "#facc15", dx: -50, dy: -55, rotate: 30 },
    { color: "#c084fc", dx: 50, dy: -65, rotate: -90 },
    { color: "#ff6b9d", dx: -30, dy: -75, rotate: 15 },
    { color: "#7dd3fc", dx: 30, dy: -45, rotate: -15 },
    { color: "#86efac", dx: -10, dy: -85, rotate: 75 },
    { color: "#fda4af", dx: 10, dy: -55, rotate: -75 },
  ];

  // Mutations — use cache invalidation for instant UI refresh
  const completeMissionMutation = trpc.missions.completeMission.useMutation({
    onSuccess: () => {
      utils.missions.getMissions.invalidate();
      utils.missions.getMyContributions.invalidate();
      utils.coins.getBalance.invalidate();
      utils.coins.getHistory.invalidate();
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 mb-4">
            Anom Sanctuary
          </h1>
          <p className="text-gray-300 mb-8">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-pink-500/30 bg-black/40 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
                Anom Sanctuary
              </h1>
              <p className="text-xs text-gray-400">Mission Hub</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Coin Balance Display — flashes + confetti when balance increases */}
            <div className="relative hidden md:block">
              <div
                className={`flex items-center gap-2 bg-black/60 px-4 py-2 rounded border transition-all duration-300 ${
                  balanceFlash
                    ? "border-yellow-400/80 shadow-[0_0_16px_rgba(250,204,21,0.6)]"
                    : "border-cyan-500/30"
                }`}
              >
                <Coins className={`w-5 h-5 transition-colors duration-300 ${balanceFlash ? "text-yellow-400" : "text-cyan-400"}`} />
                <div>
                  <p className="text-xs text-gray-400">Balance</p>
                  <p
                    className={`text-lg font-bold transition-all duration-300 ${
                      balanceFlash ? "text-yellow-400 scale-110" : "text-cyan-400 scale-100"
                    }`}
                    style={{ display: "inline-block", transformOrigin: "center" }}
                  >
                    {currentBalance}
                  </p>
                </div>
                {balanceFlash && (
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
                )}
              </div>

              {/* Confetti burst — 12 particles fly out from the center of the pill */}
              {showConfetti && (
                <div
                  key={confettiKey}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  aria-hidden
                >
                  {confettiParticles.map((p, i) => (
                    <span
                      key={i}
                      className="absolute block rounded-sm"
                      style={{
                        width: i % 3 === 0 ? "6px" : "4px",
                        height: i % 3 === 0 ? "4px" : "8px",
                        background: p.color,
                        transform: "translate(0,0) rotate(0deg)",
                        opacity: 1,
                        animation: `confetti-fly-${i} 1.6s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
                      }}
                    />
                  ))}
                  <style>{`
                    ${confettiParticles.map((p, i) => `
                      @keyframes confetti-fly-${i} {
                        0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
                        60%  { opacity: 1; }
                        100% { transform: translate(${p.dx}px, ${p.dy}px) rotate(${p.rotate}deg); opacity: 0; }
                      }
                    `).join("")}
                  `}</style>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 bg-pink-500/20 hover:bg-pink-500/30 px-4 py-2 rounded border border-pink-500/50 text-pink-300 transition"
              >
                <span className="hidden sm:inline">{user.name || "User"}</span>
                <Menu className="w-5 h-5" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-pink-500/50 rounded shadow-lg z-50">
                  <button
                    onClick={() => {
                      setActiveTab("profile");
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-pink-500/20 text-pink-300 flex items-center gap-2"
                  >
                    <Star className="w-4 h-4" />
                    My Profile
                  </button>
                  <Link href="/settings" onClick={() => setShowMenu(false)}>
                    <button className="w-full text-left px-4 py-2 hover:bg-cyan-500/20 text-cyan-300 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Settings
                    </button>
                  </Link>
                  <Link href="/anoms-corner" onClick={() => setShowMenu(false)}>
                    <button className="w-full text-left px-4 py-2 hover:bg-purple-500/20 text-purple-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Anom's Corner
                    </button>
                  </Link>
                  <button
                    onClick={() => logout()}
                    className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400 flex items-center gap-2 border-t border-pink-500/30"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8 border-b border-pink-500/30 pb-4">
          <button
            onClick={() => setActiveTab("missions")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "missions"
                ? "bg-pink-500/30 text-pink-300 border border-pink-500"
                : "text-gray-400 hover:text-pink-300"
            }`}
          >
            <Trophy className="w-5 h-5 inline mr-2" />
            Missions
          </button>
          <button
            onClick={() => setActiveTab("coins")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "coins"
                ? "bg-pink-500/30 text-pink-300 border border-pink-500"
                : "text-gray-400 hover:text-pink-300"
            }`}
          >
            <Coins className="w-5 h-5 inline mr-2" />
            Coins
          </button>
          <button
            onClick={() => setActiveTab("lounges")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "lounges"
                ? "bg-pink-500/30 text-pink-300 border border-pink-500"
                : "text-gray-400 hover:text-pink-300"
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Lounges
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded transition ${
              activeTab === "profile"
                ? "bg-pink-500/30 text-pink-300 border border-pink-500"
                : "text-gray-400 hover:text-pink-300"
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Profile
          </button>
          <Link href="/games">
            <button className="px-4 py-2 rounded transition text-gray-400 hover:text-purple-300 hover:bg-purple-500/20">
              <Gamepad2 className="w-5 h-5 inline mr-2" />
              Games
            </button>
          </Link>
          <Link href="/universe">
            <button className="px-4 py-2 rounded transition text-gray-400 hover:text-cyan-300 hover:bg-cyan-500/20">
              <Globe className="w-5 h-5 inline mr-2" />
              Universe
            </button>
          </Link>
        </div>

        {/* Missions Tab */}
        {activeTab === "missions" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 mb-4">
                Active Missions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {missionsQuery.isLoading ? (
                  <p className="text-gray-400">Loading missions...</p>
                ) : missionsQuery.data && missionsQuery.data.length > 0 ? (
                  missionsQuery.data.map((mission) => {
                    const isCompleted = myContributionsQuery.data?.some(
                      (c) => c.missionId === mission.id && c.claimed
                    );
                    return (
                      <Card key={mission.id} className="bg-black/60 border-pink-500/30 p-4">
                        <h3 className="font-bold text-pink-300 mb-2">{mission.title}</h3>
                        <p className="text-sm text-gray-400 mb-3">{mission.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
                            {mission.category}
                          </span>
                          <span className="text-lg font-bold text-cyan-400 flex items-center gap-1">
                            <Coins className="w-4 h-4" />
                            {mission.rewardCoins}
                          </span>
                        </div>
                        <Button
                          onClick={() => setSelectedMission(mission as any)}
                          className={`w-full ${
                            isCompleted
                              ? "bg-green-500/30 text-green-300 cursor-default"
                              : "bg-pink-500 hover:bg-pink-600 text-white"
                          }`}
                        >
                          {isCompleted ? "✓ Completed" : "View Mission"}
                        </Button>
                      </Card>
                    );
                  })
                ) : (
                  <p className="text-gray-400">No active missions available.</p>
                )}
              </div>
            </div>

            {/* My Contributions */}
            <div>
              <h3 className="text-xl font-bold text-pink-300 mb-4">Your Contributions</h3>
              {myContributionsQuery.isLoading ? (
                <p className="text-gray-400">Loading...</p>
              ) : myContributionsQuery.data && myContributionsQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {myContributionsQuery.data.map((contrib) => (
                    <div
                      key={contrib.id}
                      className="bg-black/60 border border-cyan-500/30 p-3 rounded flex justify-between items-center"
                    >
                      <div>
                        <p className="text-cyan-300 font-semibold">Mission #{contrib.missionId}</p>
                        <p className="text-xs text-gray-400">
                          Status: <span className="text-pink-400">{contrib.status}</span>
                        </p>
                      </div>
                      <span className="text-lg font-bold text-cyan-400">+{contrib.coinsEarned}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No contributions yet. Complete a mission to get started!</p>
              )}
            </div>

            {/* Recent Earnings Activity Feed with Filter Tabs */}
            <div>
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-xl font-bold text-yellow-300">Recent Earnings</h3>
                </div>
                {/* Filter tabs */}
                <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-lg p-1">
                  {(["all", "games", "missions"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setEarningsFilter(f)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition-all duration-200 ${
                        earningsFilter === f
                          ? f === "games"
                            ? "bg-purple-500/80 text-white shadow"
                            : f === "missions"
                            ? "bg-cyan-500/80 text-black shadow"
                            : "bg-yellow-500/80 text-black shadow"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {f === "all" ? "✨ All" : f === "games" ? "🎮 Games" : "🏆 Missions"}
                    </button>
                  ))}
                </div>
              </div>
              {coinHistoryQuery.isLoading ? (
                <p className="text-gray-400 text-sm">Loading activity...</p>
              ) : coinHistoryQuery.data && coinHistoryQuery.data.length > 0 ? (() => {
                const filtered = coinHistoryQuery.data.filter(tx => {
                  if (earningsFilter === "games") return tx.source?.startsWith("Game:");
                  if (earningsFilter === "missions") return !tx.source?.startsWith("Game:");
                  return true;
                });
                return filtered.length > 0 ? (
                  <div className="space-y-2">
                    {filtered.slice(0, 5).map((tx) => {
                      const isGame = tx.source?.startsWith("Game:");
                      return (
                        <div
                          key={tx.id}
                          className="bg-black/60 border border-yellow-500/20 p-3 rounded flex justify-between items-center hover:border-yellow-400/40 transition"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{isGame ? "🎮" : "🏆"}</span>
                            <div>
                              <p className="text-yellow-200 font-semibold text-sm">{tx.source}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(tx.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-yellow-400">+{tx.amount}</p>
                            <p className="text-xs text-gray-500">→ {tx.balanceAfter} total</p>
                          </div>
                        </div>
                      );
                    })}
                    {filtered.length > 5 && (
                      <button
                        onClick={() => setActiveTab("coins")}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition mt-1"
                      >
                        View all {filtered.length} transactions →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-black/40 border border-yellow-500/10 rounded p-4 text-center">
                    <p className="text-gray-500 text-sm">
                      No {earningsFilter === "games" ? "game" : "mission"} earnings yet.
                    </p>
                    {earningsFilter === "games" && (
                      <Link href="/games">
                        <button className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition">
                          🎮 Go to Games Hub →
                        </button>
                      </Link>
                    )}
                  </div>
                );
              })() : (
                <div className="bg-black/40 border border-yellow-500/10 rounded p-4 text-center">
                  <p className="text-gray-500 text-sm">No earnings yet.</p>
                  <p className="text-gray-600 text-xs mt-1">Complete missions or play games to earn coins!</p>
                  <Link href="/games">
                    <button className="mt-3 text-xs text-purple-400 hover:text-purple-300 transition">
                      🎮 Go to Games Hub →
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coins Tab */}
        {activeTab === "coins" && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-cyan-500/20 to-pink-500/20 border-cyan-500/50 p-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-2">Current Balance</p>
                  <p className="text-4xl font-bold text-cyan-400">
                    {coinBalanceQuery.data ? Math.floor(parseFloat(coinBalanceQuery.data.balance?.toString() || "0")) : 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Total Earned</p>
                  <p className="text-3xl font-bold text-green-400">
                    {coinBalanceQuery.data ? Math.floor(parseFloat(coinBalanceQuery.data.totalEarned?.toString() || "0")) : 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-2">Total Spent</p>
                  <p className="text-3xl font-bold text-red-400">
                    {coinBalanceQuery.data ? Math.floor(parseFloat(coinBalanceQuery.data.totalSpent?.toString() || "0")) : 0}
                  </p>
                </div>
              </div>
            </Card>

            <div>
              <h3 className="text-xl font-bold text-pink-300 mb-4">Transaction History</h3>
              {coinHistoryQuery.isLoading ? (
                <p className="text-gray-400">Loading...</p>
              ) : coinHistoryQuery.data && coinHistoryQuery.data.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {coinHistoryQuery.data.map((tx) => (
                    <div
                      key={tx.id}
                      className="bg-black/60 border border-pink-500/30 p-3 rounded flex justify-between items-center"
                    >
                      <div>
                        <p className="text-pink-300 font-semibold">{tx.source}</p>
                        <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.type === "EARN" ? "text-green-400" : "text-red-400"}`}>
                          {tx.type === "EARN" ? "+" : "-"}
                          {tx.amount}
                        </p>
                        <p className="text-xs text-gray-400">Balance: {tx.balanceAfter}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No transactions yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Lounges Tab */}
        {activeTab === "lounges" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              Community Lounges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loungesQuery.isLoading ? (
                <p className="text-gray-400">Loading lounges...</p>
              ) : loungesQuery.data && loungesQuery.data.length > 0 ? (
                loungesQuery.data.map((lounge) => (
                  <Card key={lounge.id} className="bg-black/60 border-cyan-500/30 p-4 hover:border-pink-500/50 transition">
                    <h3 className="font-bold text-cyan-300 mb-2">{lounge.name}</h3>
                    <p className="text-sm text-gray-400 mb-3">{lounge.description || "No description"}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-1 rounded">
                        {lounge.type}
                      </span>
                      <Button className="bg-cyan-500 hover:bg-cyan-600 text-black text-sm">Join</Button>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-gray-400">No lounges available yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="max-w-2xl space-y-6">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500">
              Your Being
            </h2>

            {/* Being Card */}
            {(() => {
              const fp = fullProfileQuery.data;
              const beingMeta = fp?.profile?.beingType ? BEINGS.find(b => b.id === fp.profile.beingType) : null;
              return (
                <Card className="bg-black/60 border-pink-500/30 p-6">
                  {beingMeta ? (
                    <div className="space-y-4">
                      <div className={`flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${beingMeta.gradient} border ${beingMeta.borderColor}`}>
                        <div className={`text-4xl`}>{beingMeta.emoji}</div>
                        <div>
                          <div className="font-bold text-white text-lg">{fp?.profile?.beingName || beingMeta.name}</div>
                          <div className={`text-sm ${beingMeta.color}`}>{beingMeta.title}</div>
                          {fp?.profile?.username && (
                            <div className="text-xs text-gray-400 mt-0.5">@{fp.profile.username}</div>
                          )}
                        </div>
                      </div>

                      {fp?.profile?.bio && (
                        <p className="text-gray-300 text-sm">{fp.profile.bio}</p>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><Star className="w-3 h-3 text-yellow-400" /> Social Good Score</div>
                          <div className="text-xl font-bold text-yellow-400">{fp?.profile?.socialGoodScore ?? 0}</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><Shield className="w-3 h-3 text-cyan-400" /> Privilege Tier</div>
                          <div className="text-xl font-bold text-cyan-400">{["Newcomer","Citizen","Member","Contributor","Guardian"][fp?.profile?.privilegeTier ?? 0]}</div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-pink-500/40 text-pink-300 hover:bg-pink-500/20"
                          onClick={() => setShowBeingModal(true)}
                        >
                          Change Being
                        </Button>
                        {fp?.profile?.username && (
                          <Link href={`/profile/${fp.profile.username}`}>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white gap-1">
                              <ExternalLink className="w-3 h-3" /> View Public Profile
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 space-y-3">
                      <div className="text-4xl">🌌</div>
                      <h3 className="font-bold text-white">You haven't chosen your being yet</h3>
                      <p className="text-gray-400 text-sm">Your being is your identity across all worlds in the AO Universe.</p>
                      <Button
                        onClick={() => setShowBeingModal(true)}
                        className="bg-purple-600 hover:bg-purple-500 text-white gap-2"
                      >
                        <Sparkles className="w-4 h-4" /> Choose Your Being
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })()}

            {/* Basic account info */}
            <Card className="bg-black/60 border-pink-500/30 p-6">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Account Info</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name</label>
                  <p className="text-pink-300">{user.name || "Not set"}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Email</label>
                  <p className="text-cyan-300">{user.email || "Not set"}</p>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Member Since</label>
                  <p className="text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Mission Detail Modal */}
        <MissionDetailModal
          mission={selectedMission}
          isCompleted={!!myContributionsQuery.data?.some((c) => c.missionId === selectedMission?.id && c.claimed)}
          onClose={() => setSelectedMission(null)}
          onComplete={() => {
            // Don't close — let the modal show the success screen
            // The modal's "Back to Missions" button calls onClose
          }}
        />

        {/* Being Selection Modal */}
        <BeingSelectionModal
          open={showBeingModal || needsBeingSelection}
          onComplete={() => {
            setShowBeingModal(false);
            setBeingSelectionDone(true);
            utils.profiles.getMyFullProfile.invalidate();
          }}
        />
      </main>
    </div>
  );
}
