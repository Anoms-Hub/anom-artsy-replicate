import { useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  ShoppingBag, Sparkles, Crown, Zap, Palette, Star, Package,
  Check, ArrowLeft, Loader2, ExternalLink
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

export default function StripeShop() {
  const { isAuthenticated } = useAuth();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const { data, isLoading } = trpc.stripeShop.getProducts.useQuery();
  const { data: mySubscription } = trpc.stripeShop.getMySubscription.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const products = data?.products ?? [];
  const plans = data?.plans ?? [];

  const filteredProducts =
    activeCategory === "all"
      ? products
      : products.filter((p: any) => p.category === activeCategory);

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
              <Link href="/orders">
                <Button variant="outline" size="sm" className="gap-2">
                  <Package className="w-4 h-4" />
                  My Orders
                </Button>
              </Link>
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
          <p className="text-xs text-muted-foreground/60 mt-2">
            Test card: <code className="bg-muted px-1 rounded">4242 4242 4242 4242</code> · Any future date · Any CVV
          </p>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products">Digital Products</TabsTrigger>
            <TabsTrigger value="membership">Membership Plans</TabsTrigger>
          </TabsList>

          {/* ── Products Tab ─────────────────────────────────────────────── */}
          <TabsContent value="products">
            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-6">
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

            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((product: any) => (
                  <Card
                    key={product.id}
                    className="bg-card/60 border-border/50 hover:border-primary/40 transition-all duration-200 flex flex-col"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
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
    </div>
  );
}
