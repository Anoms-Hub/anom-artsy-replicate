import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { triggerCoinDrop } from "@/components/CoinDropOverlay";

/**
 * useMissionAutoComplete
 *
 * Drop this hook into any page that can be a mission destination.
 * When the URL contains ?completeMission=<id>, it automatically:
 *  1. Fires the completeMission mutation for that mission ID
 *  2. Shows a success toast with the coin reward
 *  3. Removes the query param from the URL so refreshing doesn't re-fire
 */
export function useMissionAutoComplete() {
  const [location, setLocation] = useLocation();
  const firedRef = useRef(false);
  const utils = trpc.useUtils();

  // Parse ?completeMission=<id> from the current URL
  const searchParams = new URLSearchParams(window.location.search);
  const missionIdStr = searchParams.get("completeMission");
  const missionId = missionIdStr ? parseInt(missionIdStr, 10) : null;

  const completeMutation = trpc.missions.completeMission.useMutation({
    onSuccess: (data) => {
      const result = data as { success?: boolean; coinsEarned?: number; error?: string };

      // Strip the query param regardless of outcome
      const clean = window.location.pathname;
      setLocation(clean, { replace: true });

      if (!result?.success) {
        // Server returned success:false — show the error
        toast.error("Mission could not be completed", {
          description: result?.error || "Please try again from the Missions page.",
          duration: 6000,
        });
        return;
      }

      utils.missions.getMissions.invalidate();
      utils.missions.getMyContributions.invalidate();
      utils.coins.getBalance.invalidate();
      utils.coins.getHistory.invalidate();

      const earned = result?.coinsEarned;

      // Fire the coin drop animation overlay
      if (earned && earned > 0) {
        triggerCoinDrop(earned);
      }

      toast.success("Mission Complete!", {
        description: earned
          ? `You earned +${earned} coins. Your balance has been updated.`
          : "Your mission has been marked as complete.",
        duration: 5000,
      });
    },
    onError: (err) => {
      // If already completed, silently strip the param — don't show an error
      if (err.message?.includes("already completed") || err.message?.includes("already")) {
        const clean = window.location.pathname;
        setLocation(clean, { replace: true });
        return;
      }
      toast.error("Could not complete mission", {
        description: err.message || "Please try again from the Missions page.",
      });
      const clean = window.location.pathname;
      setLocation(clean, { replace: true });
    },
  });

  useEffect(() => {
    if (!missionId || firedRef.current) return;
    firedRef.current = true;
    completeMutation.mutate({ missionId });
  }, [missionId]); // eslint-disable-line react-hooks/exhaustive-deps
}
