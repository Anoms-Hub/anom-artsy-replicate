import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Package, ShoppingBag, Loader2, ExternalLink } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-500/20 text-green-300 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  failed: "bg-red-500/20 text-red-300 border-red-500/30",
  refunded: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

export default function Orders() {
  const { isAuthenticated, loading } = useAuth();
  const { data: orders, isLoading } = trpc.stripeShop.getMyOrders.useQuery(undefined, {
    enabled: isAuthenticated,
  });

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
        <Package className="w-12 h-12 text-muted-foreground" />
        <p className="text-muted-foreground">Sign in to view your orders</p>
        <Button onClick={() => startLogin()}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/store">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Store
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <h1 className="text-lg font-bold font-mono">My Orders</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet.</p>
            <Link href="/store">
              <Button>Browse the Store</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
            {orders.map((order: any) => (
              <Card key={order.id} className="bg-card/60 border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base font-mono">{order.productName}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={`text-xs border ${STATUS_COLORS[order.status] ?? STATUS_COLORS.pending}`}>
                        {order.status}
                      </Badge>
                      <span className="text-lg font-bold font-mono text-primary">
                        ${(order.amountTotal / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                {order.stripePaymentIntentId && (
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground/60 font-mono truncate">
                      Payment: {order.stripePaymentIntentId}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
