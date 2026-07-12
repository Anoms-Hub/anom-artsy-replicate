import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  BookOpen, ArrowLeft, Loader2, Download, Search,
  ShoppingBag, Sparkles, Crown, Palette, Star, Package
} from "lucide-react";

// Product metadata (mirrors server/stripe/products.ts)
const PRODUCT_META: Record<string, { emoji: string; category: string; features: string[] }> = {
  "art-pack-neon-cyberpunk": {
    emoji: "🌆", category: "Art Pack",
    features: ["20+ high-res PNG assets", "Neon & cyberpunk aesthetic", "Commercial use license"],
  },
  "art-pack-ao-universe": {
    emoji: "✨", category: "Art Pack",
    features: ["4 official AO Universe characters", "Sticker-ready transparent PNGs", "Personal use license"],
  },
  "art-pack-pixel-dot": {
    emoji: "🎬", category: "Art Pack",
    features: ["30+ series art assets", "Pixel & Dot characters", "Fan & personal use license"],
  },
  "creator-pack-brand-starter": {
    emoji: "🎨", category: "Creator Pack",
    features: ["Logo template kit (editable SVG)", "5 curated color palettes", "Commercial use license"],
  },
  "creator-pack-social-good": {
    emoji: "💫", category: "Creator Pack",
    features: ["Community post templates", "Social good badge set", "AO Universe co-branding assets"],
  },
  "commission-custom-portrait": {
    emoji: "🖼️", category: "Commission",
    features: ["1 custom character/portrait", "Neon/cyberpunk art style", "1 revision included"],
  },
  "commission-being-portrait": {
    emoji: "🌟", category: "Commission",
    features: ["Your chosen AO Being", "Custom color/accessory options", "Personal use license"],
  },
  "merch-pixel-dot-sticker-pack": {
    emoji: "🐾", category: "Digital Merch",
    features: ["24 digital stickers", "Animated GIF + static PNG", "Discord & Telegram ready"],
  },
  "merch-tater-nugget-pack": {
    emoji: "🐕", category: "Digital Merch",
    features: ["Tater Nugget sticker set (12 designs)", "Phone & desktop wallpapers", "Discord emote set"],
  },
  "bundle-ao-universe-ultimate": {
    emoji: "🌌", category: "Bundle",
    features: ["All 3 art packs included", "Brand Starter Creator Pack", "Save over 40%"],
  },
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Art Pack": <Sparkles className="w-4 h-4" />,
  "Creator Pack": <Palette className="w-4 h-4" />,
  "Commission": <Star className="w-4 h-4" />,
  "Digital Merch": <Package className="w-4 h-4" />,
  "Bundle": <Crown className="w-4 h-4" />,
};

export default function Library() {
  const { isAuthenticated, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: orders, isLoading } = trpc.stripeShop.getMyOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Only show completed digital product orders (not commissions which are services)
  const purchasedItems = (orders ?? []).filter(
    (o: any) => o.status === "completed"
  );

  const filteredItems = purchasedItems.filter((o: any) => {
    const meta = PRODUCT_META[o.productId];
    const cat = meta?.category ?? "Other";
    const matchesCategory = activeCategory === "all" || cat === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || o.productName.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const categories = [
    "all",
    ...Array.from(new Set(purchasedItems.map((o: any) => PRODUCT_META[o.productId]?.category ?? "Other"))),
  ] as string[];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <BookOpen className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Sign in to access your library</p>
        <Button onClick={() => startLogin()}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/store">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold font-mono">My Library</h1>
            </div>
          </div>
          <Link href="/orders">
            <Button variant="outline" size="sm" className="gap-2">
              <Package className="w-4 h-4" />
              Order History
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : purchasedItems.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2 font-mono">Your library is empty.</p>
            <p className="text-sm text-muted-foreground/60 mb-6">
              Purchase digital products from the store to access them here.
            </p>
            <Link href="/store">
              <Button className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Browse the Store
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Search + filters */}
            <div className="flex flex-col gap-3 mb-8">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search your library…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card/60 border-border/50"
                />
              </div>
              {categories.length > 2 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Button
                      key={cat}
                      variant={activeCategory === cat ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveCategory(cat)}
                      className="gap-1.5"
                    >
                      {cat !== "all" && CATEGORY_ICONS[cat]}
                      {cat === "all" ? "All Items" : cat}
                    </Button>
                  ))}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} in your library
              </p>
            </div>

            {/* Library grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredItems.map((order: any) => {
                const meta = PRODUCT_META[order.productId];
                const isCommission = meta?.category === "Commission";
                return (
                  <Card
                    key={order.id}
                    className="bg-card/60 border-border/50 hover:border-primary/40 transition-all duration-200 flex flex-col"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-3xl">{meta?.emoji ?? "📦"}</span>
                        <Badge variant="secondary" className="text-xs">
                          {meta?.category ?? "Product"}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-mono mt-2">{order.productName}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Purchased {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3">
                      {meta?.features && (
                        <ul className="space-y-1.5 mb-4">
                          {meta.features.map((f: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                              <span className="text-green-400 mt-0.5">✓</span>
                              {f}
                            </li>
                          ))}
                        </ul>
                      )}
                      {isCommission ? (
                        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-3 text-xs text-yellow-300">
                          <p className="font-semibold mb-1">Commission in progress</p>
                          <p>Anom will deliver your custom artwork within the stated turnaround time. Check your email for updates.</p>
                        </div>
                      ) : (
                        <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/30 p-3 text-xs text-cyan-300">
                          <p className="font-semibold mb-1">Ready to access</p>
                          <p>Your digital files will be delivered to your email. Contact support if you haven't received them.</p>
                        </div>
                      )}
                    </CardContent>
                    <div className="px-6 pb-5 pt-0">
                      {isCommission ? (
                        <Button variant="outline" size="sm" className="w-full gap-2" disabled>
                          <Star className="w-4 h-4" />
                          Commission in Progress
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="w-full gap-2 bg-cyan-600 hover:bg-cyan-500"
                          onClick={() => {
                            // In production: trigger download from S3 or email
                            window.open("mailto:support@anomartsy.xyz?subject=Download%20Request%3A%20" + encodeURIComponent(order.productName), "_blank");
                          }}
                        >
                          <Download className="w-4 h-4" />
                          Request Download
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
