import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { startLogin } from "@/const";
import {
  ArrowLeft, ShoppingBag, Coins, Crown, Star, Zap,
  Lock, CheckCircle, Sparkles, Filter
} from "lucide-react";

const ITEM_TYPES = [
  { value: "all", label: "All Items", icon: "✨" },
  { value: "sticker", label: "Stickers", icon: "🎨" },
  { value: "background", label: "Backgrounds", icon: "🖼️" },
  { value: "emote", label: "Emotes", icon: "💎" },
  { value: "profile_build", label: "Profile Builds", icon: "🏗️" },
  { value: "gif_pack", label: "GIF Packs", icon: "🎬" },
  { value: "color_theme", label: "Themes", icon: "🎨" },
  { value: "decoration", label: "Decorations", icon: "✨" },
] as const;

const TIERS = [
  { value: "all", label: "All Tiers" },
  { value: "free", label: "Free", color: "text-gray-300" },
  { value: "coin", label: "Coin Shop", color: "text-yellow-400" },
  { value: "starter", label: "Starter Pack", color: "text-blue-400" },
  { value: "creator", label: "Creator Pack", color: "text-purple-400" },
  { value: "elite", label: "Elite Pack", color: "text-pink-400" },
] as const;

type FilterType = typeof ITEM_TYPES[number]["value"];
type TierFilter = typeof TIERS[number]["value"];

export default function Shop() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [previewItem, setPreviewItem] = useState<number | null>(null);

  const itemsQuery = trpc.shop.getItems.useQuery();
  const myPurchasesQuery = trpc.shop.getMyPurchases.useQuery(undefined, { enabled: isAuthenticated });
  const coinBalanceQuery = trpc.coins.getBalance.useQuery(undefined, { enabled: isAuthenticated });

  const purchaseMutation = trpc.shop.purchaseWithCoins.useMutation({
    onSuccess: (data) => {
      toast.success(`You now own "${data.item.name}"! 🎉`, {
        description: "Check your profile to apply it.",
      });
      utils.shop.getMyPurchases.invalidate();
      utils.coins.getBalance.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const items = itemsQuery.data ?? [];
  const myPurchasedIds = new Set((myPurchasesQuery.data ?? []).map(p => p.purchase.shopItemId));
  const coinBalance = coinBalanceQuery.data
    ? Math.floor(parseFloat(coinBalanceQuery.data.balance?.toString() || "0"))
    : 0;

  const filtered = items.filter(item => {
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (tierFilter !== "all" && item.tier !== tierFilter) return false;
    return true;
  });

  const tierBadge = (tier: string) => {
    const map: Record<string, string> = {
      free: "bg-gray-500/20 text-gray-300 border-gray-500/40",
      coin: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
      starter: "bg-blue-500/20 text-blue-300 border-blue-500/40",
      creator: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      elite: "bg-pink-500/20 text-pink-300 border-pink-500/40",
    };
    return map[tier] ?? map.coin;
  };

  const tierLabel = (tier: string) => {
    const map: Record<string, string> = {
      free: "Free", coin: "Coin Shop", starter: "Starter Pack",
      creator: "Creator Pack", elite: "Elite Pack",
    };
    return map[tier] ?? tier;
  };

  const typeEmoji = (type: string) => {
    const map: Record<string, string> = {
      sticker: "🎨", background: "🖼️", emote: "💎",
      profile_build: "🏗️", gif_pack: "🎬", color_theme: "🎨", decoration: "✨",
    };
    return map[type] ?? "✨";
  };

  const handlePurchase = (itemId: number, coinPrice: number) => {
    if (!isAuthenticated) { startLogin(); return; }
    if (coinBalance < coinPrice) {
      toast.error("Not enough coins!", {
        description: `You need ${coinPrice} coins but only have ${coinBalance}. Earn more by completing missions and playing games.`,
      });
      return;
    }
    purchaseMutation.mutate({ shopItemId: itemId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0015] via-[#0d0025] to-[#0a0015] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/universe">
              <button className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm">
                <ArrowLeft className="w-4 h-4" />
                Universe
              </button>
            </Link>
            <div className="w-px h-5 bg-gray-700" />
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-400" />
              <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
                AO Identity Shop
              </h1>
            </div>
          </div>

          {isAuthenticated && (
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-yellow-500/30">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 font-bold text-sm">{coinBalance}</span>
              <span className="text-slate-500 text-xs">coins</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Hero Banner */}
        <div className="relative rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-purple-900/60 via-pink-900/40 to-cyan-900/60 border border-white/10 p-8">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="text-pink-300 text-sm font-semibold uppercase tracking-wider">Pimp Your Identity</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">AO Identity Shop</h2>
            <p className="text-slate-300 max-w-xl">
              Customize your Sanctuary presence with exclusive stickers, backgrounds, emotes, and profile builds
              crafted by Anom Originals. Earn coins through missions and games, or grab premium packs.
            </p>
            {!isAuthenticated && (
              <Button
                onClick={() => startLogin()}
                className="mt-4 bg-pink-500 hover:bg-pink-600 text-white"
              >
                Sign In to Shop
              </Button>
            )}
          </div>
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Filter className="w-4 h-4" />
            <span>Filter:</span>
          </div>
          {ITEM_TYPES.map(t => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                typeFilter === t.value
                  ? "bg-pink-500/30 border-pink-500/60 text-pink-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
          {TIERS.map(t => (
            <button
              key={t.value}
              onClick={() => setTierFilter(t.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                tierFilter === t.value
                  ? "bg-cyan-500/30 border-cyan-500/60 text-cyan-300"
                  : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {itemsQuery.isLoading ? (
          <div className="text-center py-20 text-slate-500">Loading shop...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500">No items match your filters.</p>
            <button
              onClick={() => { setTypeFilter("all"); setTierFilter("all"); }}
              className="mt-3 text-pink-400 text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(item => {
              const owned = myPurchasedIds.has(item.id);
              const isPurchasing = purchaseMutation.isPending && purchaseMutation.variables?.shopItemId === item.id;
              const canAfford = coinBalance >= (item.coinPrice ?? 0);
              const isPreviewing = previewItem === item.id;

              return (
                <Card
                  key={item.id}
                  className={`bg-black/50 border overflow-hidden transition-all hover:scale-[1.02] ${
                    owned ? "border-green-500/40" : "border-white/10 hover:border-pink-500/30"
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-36 bg-gradient-to-br from-purple-900/40 to-pink-900/40 flex items-center justify-center overflow-hidden">
                    {item.imageUrl ? (
                      <img
                        src={isPreviewing && item.previewUrl ? item.previewUrl : item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl">{typeEmoji(item.type)}</span>
                    )}

                    {/* Tier badge */}
                    <span className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full border font-semibold ${tierBadge(item.tier)}`}>
                      {tierLabel(item.tier)}
                    </span>

                    {/* Owned badge */}
                    {owned && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="bg-green-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Owned
                        </div>
                      </div>
                    )}

                    {/* Preview toggle */}
                    {item.previewUrl && !owned && (
                      <button
                        onMouseEnter={() => setPreviewItem(item.id)}
                        onMouseLeave={() => setPreviewItem(null)}
                        className="absolute bottom-2 left-2 text-xs bg-black/70 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 hover:bg-cyan-500/20"
                      >
                        Preview
                      </button>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <p className="font-bold text-white text-sm truncate">{item.name}</p>
                    {item.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                    )}

                    {/* Price + CTA */}
                    <div className="mt-3">
                      {owned ? (
                        <Button size="sm" disabled className="w-full bg-green-500/20 text-green-300 border border-green-500/30 text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" /> In Your Collection
                        </Button>
                      ) : item.tier === "free" ? (
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(item.id, 0)}
                          disabled={!isAuthenticated || isPurchasing}
                          className="w-full bg-gray-500/30 hover:bg-gray-500/50 text-gray-200 text-xs border border-gray-500/30"
                        >
                          {isPurchasing ? "Claiming..." : "Claim Free"}
                        </Button>
                      ) : item.realPrice ? (
                        <div className="space-y-1.5">
                          <Button
                            size="sm"
                            disabled
                            className="w-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs"
                          >
                            <Lock className="w-3 h-3 mr-1" />
                            ${item.realPrice} — Coming Soon
                          </Button>
                          {(item.coinPrice ?? 0) > 0 && (
                            <Button
                              size="sm"
                              onClick={() => handlePurchase(item.id, item.coinPrice ?? 0)}
                              disabled={!isAuthenticated || isPurchasing || !canAfford}
                              className={`w-full text-xs ${
                                canAfford
                                  ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30"
                                  : "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed"
                              }`}
                            >
                              <Coins className="w-3 h-3 mr-1" />
                              {isPurchasing ? "Buying..." : `${item.coinPrice} coins`}
                              {!canAfford && <Lock className="w-3 h-3 ml-1" />}
                            </Button>
                          )}
                        </div>
                      ) : (item.coinPrice ?? 0) > 0 ? (
                        <Button
                          size="sm"
                          onClick={() => handlePurchase(item.id, item.coinPrice ?? 0)}
                          disabled={!isAuthenticated || isPurchasing || !canAfford}
                          className={`w-full text-xs ${
                            canAfford
                              ? "bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30"
                              : "bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed"
                          }`}
                        >
                          <Coins className="w-3 h-3 mr-1" />
                          {isPurchasing ? "Buying..." : `${item.coinPrice} coins`}
                          {!canAfford && isAuthenticated && <Lock className="w-3 h-3 ml-1" />}
                        </Button>
                      ) : (
                        <Button size="sm" disabled className="w-full text-xs bg-white/5 text-slate-500 border border-white/10">
                          Not Available
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Earn More Coins CTA */}
        {isAuthenticated && coinBalance < 100 && (
          <div className="mt-10 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-400 shrink-0" />
              <div>
                <p className="text-white font-semibold">Need more coins?</p>
                <p className="text-slate-400 text-sm">Complete missions and play games to earn coins for the shop.</p>
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href="/dashboard">
                <Button size="sm" className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 text-xs">
                  Missions
                </Button>
              </Link>
              <Link href="/games">
                <Button size="sm" className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-xs">
                  Games
                </Button>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
