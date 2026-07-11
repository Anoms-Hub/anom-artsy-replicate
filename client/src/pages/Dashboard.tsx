import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Zap, Users, Trophy, Coins, Settings, LogOut, Menu } from "lucide-react";
import { useState } from "react";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"missions" | "coins" | "profile" | "lounges">("missions");
  const [showMenu, setShowMenu] = useState(false);

  // Fetch data
  const missionsQuery = trpc.missions.getMissions.useQuery();
  const myContributionsQuery = trpc.missions.getMyContributions.useQuery();
  const coinBalanceQuery = trpc.coins.getBalance.useQuery();
  const coinHistoryQuery = trpc.coins.getHistory.useQuery();
  const profileQuery = trpc.profiles.getProfile.useQuery();
  const loungesQuery = trpc.lounges.getLounges.useQuery();

  // Mutations
  const completeMissionMutation = trpc.missions.completeMission.useMutation({
    onSuccess: () => {
      missionsQuery.refetch();
      myContributionsQuery.refetch();
      coinBalanceQuery.refetch();
      coinHistoryQuery.refetch();
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
            {/* Coin Balance Display */}
            <div className="hidden md:flex items-center gap-2 bg-black/60 px-4 py-2 rounded border border-cyan-500/30">
              <Coins className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-xs text-gray-400">Balance</p>
                <p className="text-lg font-bold text-cyan-400">
                  {coinBalanceQuery.data ? Math.floor(parseFloat(coinBalanceQuery.data.balance?.toString() || "0")) : 0}
                </p>
              </div>
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
                    <Settings className="w-4 h-4" />
                    Profile
                  </button>
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
                          onClick={() => completeMissionMutation.mutate({ missionId: mission.id })}
                          disabled={isCompleted || completeMissionMutation.isPending}
                          className={`w-full ${
                            isCompleted
                              ? "bg-green-500/30 text-green-300"
                              : "bg-pink-500 hover:bg-pink-600 text-white"
                          }`}
                        >
                          {isCompleted ? "✓ Completed" : "Complete Mission"}
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
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 mb-6">
              Your Profile
            </h2>
            <Card className="bg-black/60 border-pink-500/30 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Name</label>
                  <p className="text-lg text-pink-300">{user.name || "Not set"}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Email</label>
                  <p className="text-lg text-cyan-300">{user.email || "Not set"}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Member Since</label>
                  <p className="text-lg text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                {profileQuery.data && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Bio</label>
                    <p className="text-lg text-gray-300">{profileQuery.data.bio || "No bio yet"}</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
