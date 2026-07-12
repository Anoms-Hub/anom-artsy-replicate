import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag, Sparkles, Crown, Zap, Palette, Star, Package,
  Check, ArrowLeft, Loader2, Search, BookOpen, Eye, X, Coins
} from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  "art-pack": "Art Packs",
  "creator-pack": "Creator Packs",
  commission: "Commissions",
  merch: "Digital Merch",
  bundle: "Bundles",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "art-pack": <Sparkles className="w-4 h-4" />,
  "creator-pack": <Palette className="w-4 h-4" />,
  commission: <Star className="w-4 h-4" />,
  merch: <Package className="w-4 h-4" />,
  bundle: <Crown className="w-4 h-4" />,
};

const PLAN_COLORS: Record<string, string> = {
  explorer: "from-cyan-900/40 to-cyan-800/20 border-cyan-700/50",
  creator: "from-purple-900/60 to-purple-800/30 border-purple-500/70",
  founder: "from-yellow-900/40 to-yellow-800/20 border-yellow-600/50",
};

// Gradient backgrounds for product preview modal (by category)
const CATEGORY_GRADIENTS: Record<string, string> = {
  "art-pack": "from-cyan-900 via-purple-900 to-pink-900",
  "creator-pack": "from-purple-900 via-indigo-900 to-blue-900",
  commission: "from-yellow-900 via-orange-900 to-red-900",
  merch: "from-green-900 via-teal-900 to-cyan-900",
  bundle: "from-indigo-900 via-purple-900 to-pink-900",
};

// Coin discount options: coins → discount percent
const COIN_DISCOUNT_OPTIONS = [
  { coins: 100, percent: 10 },
  { coins: 200, percent: 20 },
  { coins: 300, percent: 30 },
  { coins: 400, percent: 40 },
  { coins: 500, percent: 50 },
];

export default function StripeShop() {
  const { isAuthenticated } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [previewProduct, setPreviewProduct] = useState<any | null>(null);
  const [coinDiscountLoading, setCoinDiscountLoading] = useState<string | null>(null);

  const { data, isLoading } = trpc.stripeShop.getProducts.useQuery();
  const { data: mySubscription } = trpc.stripeShop.getMySubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: coinData } = trpc.coins.getBalance.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const coinBalance = Math.floor(Number((coinData as any)?.balance ?? 0));

  const applyCoinDiscount = trpc.stripeShop.applyCoinDiscount.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        toast.success("Redirecting to discounted checkout…", {
          description: "Coins deducted. Opening Stripe Checkout.",
        });
        window.open(data.checkoutUrl, "_blank");
      }
    },
    onError: (err) => {
      toast.error("Coin discount failed", { description: err.message });
    },
    onSettled: () => {
      setCoinDiscountLoading(null);
    },
  });

  const products = data?.products ?? [];
  const plans = data?.plans ?? [];

  const filteredProducts = products.filter((p: any) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.features ?? []).some((f: string) => f.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const categories = ["all", ...Array.from(new Set(products.map((p: any) => p.category as string)))];

  const handleBuyProduct = async (productId: string) => {
    if (!isAuthenticated) { startLogin(); return; }
    setLoadingId(productId);
    try {
      const res = await fetch("/api/stripe/checkout/product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ productId }),
      });
      const json = await res.json();
      if (json.url) {
        toast.success("Redirecting to checkout…", { description: "Opening Stripe Checkout in a new tab." });
        window.open(json.url, "_blank");
      } else {
        toast.error("Checkout error", { description: json.error ?? "Could not create checkout session." });
      }
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    } finally {
      setLoadingId(null);
    }
  };

  const handleCoinDiscount = async (productId: string, coinsToSpend: number) => {
    if (!isAuthenticated) { startLogin(); return; }
    const key = `${productId}-${coinsToSpend}`;
    setCoinDiscountLoading(key);
    applyCoinDiscount.mutate({ productId, coinsToSpend });
  };

  const handleSubscribe = async (planId: string) => {
    if (!isAuthenticated) { startLogin(); return; }
    setLoadingId(planId);
    try {
      const res = await fetch("/api/stripe/checkout/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ planId }),
      });
      const json = await res.json();
      if (json.url) {
        toast.success("Redirecting to checkout…", { description: "Opening Stripe Checkout in a new tab." });
        window.open(json.url, "_blank");
      } else {
        toast.error("Checkout error", { description: json.error ?? "Could not create checkout session." });
      }
    } catch (err: any) {
      toast.error("Error", { description: err.message });
    } finally {
      setLoadingId(null);
    }
  };

  // Coin discount section — rendered inside product cards and preview modal
  const CoinDiscountSection = ({ product, compact = false }: { product: any; compact?: boolean }) => {
    if (!product.coinDiscountEligible) return null;
    const eligibleOptions = COIN_DISCOUNT_OPTIONS.filter((o) => o.coins <= coinBalance);
    if (!isAuthenticated) {
      return (
        <div className={`${compact ? "mt-2" : "mt-3"} p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30`}>
          <p className="text-xs text-yellow-400/80">
            <span className="mr-1">🪙</span>Sign in to use Anom Coins for a discount (up to 50% off)
          </p>
        </div>
      );
    }
    return (
      <div className={`${compact ? "mt-2" : "mt-3"} p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30`}>
        <div className="flex items-center gap-1.5 mb-2">
          <Coins className="w-3.5 h-3.5 text-yellow-400" />
          <p className="text-xs font-semibold text-yellow-400">
            Spend Anom Coins for a discount
          </p>
          {isAuthenticated && (
            <span className="ml-auto text-xs text-yellow-300/70">Balance: {coinBalance} 🪙</span>
          )}
        </div>
        {eligibleOptions.length === 0 ? (
          <p className="text-xs text-yellow-400/60">
            You need at least 100 coins to unlock a discount.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {eligibleOptions.map((opt) => {
              const key = `${product.id}-${opt.coins}`;
              const discountedPrice = (product.price * (1 - opt.percent / 100)) / 100;
              const isLoading = coinDiscountLoading === key;
              return (
                <button
                  key={opt.coins}
                  onClick={() => handleCoinDiscount(product.id, opt.coins)}
                  disabled={isLoading || !!coinDiscountLoading}
                  className="text-xs px-2 py-1 rounded bg-yellow-500/20 hover:bg-yellow-500/35 text-yellow-300 border border-yellow-500/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      {opt.coins}🪙 → {opt.percent}% off (${discountedPrice.toFixed(2)})
                    </>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold font-mono">AO Originals Store</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                {coinBalance > 0 && (
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-xs text-yellow-300">
                    <Coins className="w-3.5 h-3.5" />
                    {coinBalance} coins
                  </div>
                )}
                <Link href="/library">
                  <Button variant="outline" size="sm" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    My Library
                  </Button>
                </Link>
                <Link href="/orders">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Package className="w-4 h-4" />
                    My Orders
                  </Button>
                </Link>
              </>
            )}
            {!isAuthenticated && (
              <Button size="sm" onClick={() => startLogin()} className="gap-2">
                Sign in to Purchase
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold font-mono mb-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Digital Creations by Anom Originals
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm">
            Art packs, creator tools, commissions, and membership tiers — all crafted to support the AO Universe and the Pixel &amp; Dot series.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <p className="text-xs text-muted-foreground/60">
              Test card: <code className="bg-muted px-1 rounded">4242 4242 4242 4242</code> · Any future date · Any CVV
            </p>
            {isAuthenticated && coinBalance >= 100 && (
              <p className="text-xs text-yellow-400/80">
                🪙 You have <strong>{coinBalance} coins</strong> — look for the coin discount button on eligible products!
              </p>
            )}
          </div>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Digital Products</TabsTrigger>
            <TabsTrigger value="membership">Membership Plans</TabsTrigger>
          </TabsList>

          {/* ── Products Tab ─────────────────────────────────────────────── */}
          <TabsContent value="products">
            {/* Search + Category filter */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card/60 border-border/50"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat: string) => (
                  <Button
                    key={cat}
                    variant={activeCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(cat)}
                    className="gap-1.5 capitalize"
                  >
                    {cat !== "all" && CATEGORY_ICONS[cat]}
                    {cat === "all" ? "All Products" : CATEGORY_LABELS[cat] ?? cat}
                  </Button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product: any) => (
                  <Card
                    key={product.id}
                    className="bg-card/60 border-border/50 hover:border-primary/40 transition-all duration-200 flex flex-col relative"
                  >
                    {/* Eye / preview button */}
                    <button
                      onClick={() => setPreviewProduct(product)}
                      className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white/70 hover:text-white transition-colors"
                      title="Quick preview"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 pr-8">
                        <span className="text-3xl">{product.emoji}</span>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {CATEGORY_LABELS[product.category] ?? product.category}
                        </Badge>
                      </div>
                      <CardTitle className="text-base font-mono mt-2">{product.name}</CardTitle>
                      <CardDescription className="text-sm leading-relaxed">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3">
                      <ul className="space-y-1.5">
                        {product.features.map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                            <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                      {/* Coin discount section (compact) */}
                      <CoinDiscountSection product={product} compact />
                    </CardContent>
                    <CardFooter className="pt-3 border-t border-border/30 flex items-center justify-between">
                      <span className="text-xl font-bold font-mono text-primary">
                        ${(product.price / 100).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleBuyProduct(product.id)}
                        disabled={loadingId === product.id}
                        className="gap-2"
                      >
                        {loadingId === product.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <ShoppingBag className="w-4 h-4" />
                        )}
                        Buy Now
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Membership Tab ───────────────────────────────────────────── */}
          <TabsContent value="membership">
            {mySubscription && (mySubscription as any).status === "active" && (
              <div className="mb-6 p-4 rounded-lg border border-green-700/50 bg-green-900/20 flex items-center gap-3">
                <Crown className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="font-semibold text-sm">
                    You have an active{" "}
                    <span className="capitalize text-yellow-300">{(mySubscription as any).planId}</span> membership
                  </p>
                  {(mySubscription as any).cancelAtPeriodEnd && (
                    <p className="text-xs text-muted-foreground">Cancels at end of billing period</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan: any) => {
                const isCurrentPlan =
                  (mySubscription as any)?.planId === plan.id &&
                  (mySubscription as any)?.status === "active";
                return (
                  <Card
                    key={plan.id}
                    className={`bg-gradient-to-b ${PLAN_COLORS[plan.id] ?? "from-card to-card/80 border-border/50"} border flex flex-col relative ${plan.highlight ? "ring-2 ring-purple-500/50" : ""}`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-purple-600 text-white text-xs px-3">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <div className="text-3xl mb-1">{plan.emoji}</div>
                      <CardTitle className="font-mono">{plan.name}</CardTitle>
                      <CardDescription className="text-sm">{plan.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-3">
                      <div className="mb-4">
                        <span className="text-3xl font-bold font-mono text-primary">
                          ${(plan.price / 100).toFixed(2)}
                        </span>
                        <span className="text-muted-foreground text-sm">/{plan.interval}</span>
                      </div>
                      <ul className="space-y-2">
                        {plan.features.map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Check className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="pt-3 border-t border-border/30">
                      {isCurrentPlan ? (
                        <Button variant="outline" className="w-full" disabled>
                          <Check className="w-4 h-4 mr-2" /> Current Plan
                        </Button>
                      ) : (
                        <Button
                          className="w-full gap-2"
                          variant={plan.highlight ? "default" : "outline"}
                          onClick={() => handleSubscribe(plan.id)}
                          disabled={loadingId === plan.id}
                        >
                          {loadingId === plan.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Zap className="w-4 h-4" />
                          )}
                          Subscribe
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Product Preview Modal ─────────────────────────────────────────── */}
      {previewProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewProduct(null)}
        >
          <div
            className="bg-gray-950 border border-gray-700/60 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient image placeholder */}
            <div
              className={`relative h-44 bg-gradient-to-br ${CATEGORY_GRADIENTS[previewProduct.category] ?? "from-gray-900 to-gray-800"} flex items-center justify-center`}
            >
              <span className="text-7xl drop-shadow-lg">{previewProduct.emoji}</span>
              <div className="absolute inset-0 bg-black/20" />
              {/* Close button */}
              <button
                onClick={() => setPreviewProduct(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Category badge */}
              <div className="absolute bottom-3 left-3">
                <Badge variant="secondary" className="text-xs capitalize bg-black/50 text-white border-white/20">
                  {CATEGORY_LABELS[previewProduct.category] ?? previewProduct.category}
                </Badge>
              </div>
              {/* Coin eligible badge */}
              {previewProduct.coinDiscountEligible && (
                <div className="absolute bottom-3 right-3">
                  <Badge className="text-xs bg-yellow-500/30 text-yellow-300 border-yellow-500/40">
                    🪙 Coin Discount Available
                  </Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-lg font-bold font-mono text-white">{previewProduct.name}</h3>
                <span className="text-2xl font-bold font-mono text-cyan-400 shrink-0">
                  ${(previewProduct.price / 100).toFixed(2)}
                </span>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-4">{previewProduct.description}</p>

              {/* Features */}
              <ul className="space-y-1.5 mb-4">
                {previewProduct.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                    <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Coin discount section */}
              <CoinDiscountSection product={previewProduct} />

              {/* Buy button */}
              <Button
                className="w-full mt-4 gap-2"
                onClick={() => {
                  handleBuyProduct(previewProduct.id);
                  setPreviewProduct(null);
                }}
                disabled={loadingId === previewProduct.id}
              >
                {loadingId === previewProduct.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ShoppingBag className="w-4 h-4" />
                )}
                Buy at Full Price — ${(previewProduct.price / 100).toFixed(2)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
