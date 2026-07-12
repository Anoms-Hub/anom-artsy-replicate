import { useState } from "react";
import { useRoute, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { BEINGS } from "@/components/BeingSelectionModal";
import {
  Heart,
  Star,
  Coins,
  Trophy,
  Shield,
  Globe,
  Calendar,
  Eye,
  ArrowLeft,
  Sparkles,
  Lock,
} from "lucide-react";

// Award type metadata
const AWARD_META: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  patience:           { label: "Patience",          color: "text-rose-300",   bg: "bg-rose-950/50 border-rose-500/30",   emoji: "🌸" },
  emotion:            { label: "Emotion",            color: "text-pink-300",   bg: "bg-pink-950/50 border-pink-500/30",   emoji: "💜" },
  community:          { label: "Community",          color: "text-green-300",  bg: "bg-green-950/50 border-green-500/30", emoji: "🌿" },
  creativity:         { label: "Creativity",         color: "text-yellow-300", bg: "bg-yellow-950/50 border-yellow-500/30", emoji: "✨" },
  loyalty:            { label: "Loyalty",            color: "text-blue-300",   bg: "bg-blue-950/50 border-blue-500/30",   emoji: "💙" },
  discovery:          { label: "Discovery",          color: "text-cyan-300",   bg: "bg-cyan-950/50 border-cyan-500/30",   emoji: "🔭" },
  guardian:           { label: "Guardian",           color: "text-purple-300", bg: "bg-purple-950/50 border-purple-500/30", emoji: "🛡️" },
  "financial-literacy": { label: "Financial Literacy", color: "text-emerald-300", bg: "bg-emerald-950/50 border-emerald-500/30", emoji: "💰" },
  "world-builder":    { label: "World Builder",      color: "text-orange-300", bg: "bg-orange-950/50 border-orange-500/30", emoji: "🌍" },
  "ao-symbol":        { label: "AO Symbol",          color: "text-violet-300", bg: "bg-violet-950/50 border-violet-500/30", emoji: "⭐" },
};

// Privilege tier labels
const TIER_LABELS = ["Newcomer", "Citizen", "Member", "Contributor", "Guardian"];
const TIER_COLORS = [
  "text-gray-400",
  "text-green-400",
  "text-cyan-400",
  "text-purple-400",
  "text-yellow-400",
];

function SGSBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score));
  const color =
    pct >= 80 ? "bg-green-500" :
    pct >= 50 ? "bg-cyan-500" :
    pct >= 25 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full bg-white/10 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function MemberProfile() {
  const [, params] = useRoute("/profile/:username");
  const username = params?.username ?? "";
  const { user: authUser, isAuthenticated } = useAuth();

  const { data: profileData, isLoading } = trpc.profiles.getByUsername.useQuery(
    { username },
    { enabled: !!username }
  );

  const { data: awards } = trpc.profiles.getAwards.useQuery(
    { userId: profileData?.profile?.userId ?? 0 },
    { enabled: !!profileData?.profile?.userId }
  );

  const { data: likeStatus, refetch: refetchLike } = trpc.profiles.getLikeStatus.useQuery(
    { toUserId: profileData?.profile?.userId ?? 0 },
    { enabled: isAuthenticated && !!profileData?.profile?.userId }
  );

  const { data: likeCount } = trpc.profiles.getLikeCount.useQuery(
    { userId: profileData?.profile?.userId ?? 0 },
    { enabled: !!profileData?.profile?.userId }
  );

  const utils2 = trpc.useUtils();
  const likeMutation = trpc.profiles.likeProfile.useMutation({
    onSuccess: () => {
      refetchLike();
      utils2.profiles.getLikeCount.invalidate({ userId: profileData?.profile?.userId ?? 0 });
    },
  });

  const utils = trpc.useUtils();

  const isOwnProfile = isAuthenticated && authUser?.id === profileData?.profile?.userId;

  // Find being metadata
  const beingMeta = profileData?.profile?.beingType
    ? BEINGS.find((b) => b.id === profileData.profile.beingType)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🌌</div>
          <h2 className="text-xl font-bold text-white">Being Not Found</h2>
          <p className="text-gray-400 text-sm">No member with username <span className="text-purple-400">@{username}</span> exists in the AO Universe.</p>
          <Link href="/">
            <Button variant="ghost" className="text-gray-400 hover:text-white gap-2">
              <ArrowLeft className="w-4 h-4" /> Return to AO-City
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { profile, user, coinBalance, totalEarned } = profileData;
  const tier = profile.privilegeTier ?? 0;
  const sgs = profile.socialGoodScore ?? 0;
  const displayName = profile.beingName || user.name || username;
  const joinedDate = new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const totalLikes = likeCount?.count ?? 0;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Background gradient based on being */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          background: beingMeta
            ? `radial-gradient(ellipse at 50% 0%, ${
                beingMeta.id === "clifford" ? "#be185d" :
                beingMeta.id === "tater" ? "#b45309" :
                beingMeta.id === "x9" ? "#0e7490" :
                "#7c3aed"
              } 0%, transparent 70%)`
            : "radial-gradient(ellipse at 50% 0%, #7c3aed 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Back nav */}
        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
        </Link>

        {/* Profile Header Card */}
        <div className={`rounded-2xl border p-6 bg-gradient-to-br ${beingMeta?.gradient ?? "from-gray-900 to-gray-800"} ${beingMeta?.borderColor ?? "border-white/10"}`}>
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Avatar / Being icon */}
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0 bg-black/30 border ${beingMeta?.borderColor ?? "border-white/20"}`}>
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={displayName} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span>{beingMeta?.emoji ?? "🌌"}</span>
              )}
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-white truncate">{displayName}</h1>
                {beingMeta && (
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-black/30 border ${beingMeta.borderColor} ${beingMeta.color} font-medium`}>
                    {beingMeta.title}
                  </span>
                )}
              </div>

              {profile.username && (
                <p className="text-gray-400 text-sm mb-2">@{profile.username}</p>
              )}

              {profile.bio && (
                <p className="text-gray-300 text-sm leading-relaxed mb-3">{profile.bio}</p>
              )}

              {/* Profile GIF — stored in customizationData.gifUrl */}
              {(() => {
                const customization = (profile.customizationData as Record<string, unknown> | null) ?? {};
                const savedGifUrl = customization.gifUrl as string | undefined;
                return savedGifUrl ? (
                  <div className="mb-3">
                    <img
                      src={savedGifUrl}
                      alt="Profile GIF"
                      className="rounded-xl max-h-28 object-cover border border-purple-500/30"
                    />
                    <p className="text-xs text-slate-600 mt-0.5">via Giphy</p>
                  </div>
                ) : null;
              })()}

              {/* Meta row */}
              <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> Joined {joinedDate}
                </span>
                <span className={`flex items-center gap-1 font-semibold ${TIER_COLORS[tier]}`}>
                  <Shield className="w-3 h-3" /> {TIER_LABELS[tier]}
                </span>
                <span className="flex items-center gap-1 text-yellow-400">
                  <Coins className="w-3 h-3" /> {Math.round(parseFloat(coinBalance ?? "0"))} AO Coins
                </span>
              </div>
            </div>

            {/* Like button (only for other users) */}
            {!isOwnProfile && isAuthenticated && (
              <button
                onClick={() => {
                  if (!profileData?.profile?.userId) return;
                  likeMutation.mutate({ toUserId: profileData.profile.userId });
                }}
                disabled={likeMutation.isPending}
                className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border transition-all duration-200 ${
                  likeStatus?.liked
                    ? "bg-rose-950/60 border-rose-500/50 text-rose-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:border-rose-500/30 hover:text-rose-400"
                }`}
              >
                <Heart className={`w-5 h-5 ${likeStatus?.liked ? "fill-rose-400" : ""}`} />
                <span className="text-xs">{totalLikes}</span>
              </button>
            )}

            {/* Edit button (own profile) */}
            {isOwnProfile && (
              <Link href="/dashboard">
                <Button size="sm" variant="outline" className="border-white/20 text-gray-300 hover:text-white">
                  Edit Profile
                </Button>
              </Link>
            )}
          </div>

          {/* Social Good Score */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-400" /> Social Good Score
              </span>
              <span className={`text-sm font-bold ${sgs >= 80 ? "text-green-400" : sgs >= 50 ? "text-cyan-400" : sgs >= 25 ? "text-yellow-400" : "text-gray-400"}`}>
                {sgs} / 100
              </span>
            </div>
            <SGSBar score={sgs} />
            <p className="text-xs text-gray-500 mt-1">
              Earned through missions, financial literacy, and community contributions.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Earned", value: `${Math.round(parseFloat(totalEarned ?? "0"))} AO`, icon: <Coins className="w-4 h-4 text-yellow-400" /> },
            { label: "Hearts Received", value: totalLikes.toString(), icon: <Heart className="w-4 h-4 text-rose-400" /> },
            { label: "Awards", value: (awards?.length ?? 0).toString(), icon: <Trophy className="w-4 h-4 text-purple-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-900/60 border border-white/10 rounded-xl p-4 text-center">
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Being Info */}
        {beingMeta && (
          <div className={`rounded-xl border p-4 bg-gradient-to-r ${beingMeta.gradient} ${beingMeta.borderColor}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={beingMeta.color}>{beingMeta.icon}</div>
              <div>
                <div className="font-bold text-white text-sm">{beingMeta.name} Archetype</div>
                <div className={`text-xs ${beingMeta.color}`}>{beingMeta.title}</div>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{beingMeta.description}</p>
            <div className="mt-2 pt-2 border-t border-white/10">
              <span className={`text-xs font-semibold ${beingMeta.color}`}>Special Power: </span>
              <span className="text-xs text-gray-300">{beingMeta.power}</span>
            </div>
          </div>
        )}

        {/* Awards Gallery */}
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-400" /> Awards Gallery
          </h2>
          {!awards || awards.length === 0 ? (
            <div className="bg-gray-900/40 border border-white/10 rounded-xl p-6 text-center">
              <div className="text-3xl mb-2">🏆</div>
              <p className="text-gray-400 text-sm">No awards yet.</p>
              <p className="text-gray-500 text-xs mt-1">Complete missions and Financial District lessons to earn awards.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {awards
                .filter((a: any) => a.isDisplayed)
                .map((award: any) => {
                  const meta = AWARD_META[award.awardType] ?? {
                    label: award.awardType,
                    color: "text-gray-300",
                    bg: "bg-gray-900/50 border-white/10",
                    emoji: "🏅",
                  };
                  return (
                    <div
                      key={award.id}
                      className={`rounded-xl border p-3 ${meta.bg} text-center`}
                    >
                      <div className="text-2xl mb-1">{meta.emoji}</div>
                      <div className={`text-xs font-bold ${meta.color}`}>{award.awardName}</div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {new Date(award.earnedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Recent Visitors (own profile only) */}
        {isOwnProfile && <RecentVisitorsSection />}

        {/* Universe Travel CTA */}
        <div className="bg-gray-900/40 border border-purple-500/20 rounded-xl p-5 text-center">
          <Globe className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <h3 className="font-bold text-white text-sm mb-1">Explore the AO Universe</h3>
          <p className="text-gray-400 text-xs mb-3">Visit AO-City districts, earn coins, and travel to creator worlds.</p>
          <Link href="/universe">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white gap-2">
              <Sparkles className="w-3 h-3" /> Open Universe Map
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function RecentVisitorsSection() {
  const { data: visitors } = trpc.profiles.getRecentVisitors.useQuery();

  if (!visitors || visitors.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
        <Eye className="w-4 h-4 text-cyan-400" />
        Recent Visitors
        <span className="text-xs text-gray-600 normal-case font-normal">(only visible to you)</span>
      </h2>
      <div className="flex flex-wrap gap-2">
        {visitors.map((v: any, i: number) => (
          <div
            key={i}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900/60 border border-white/10 text-xs text-gray-300"
          >
            <Lock className="w-2.5 h-2.5 text-gray-500" />
            {v.visitor.name || "Anonymous"}
          </div>
        ))}
      </div>
    </div>
  );
}
