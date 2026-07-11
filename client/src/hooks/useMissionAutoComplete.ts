import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

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
      utils.missions.getMissions.invalidate();
      utils.missions.getMyContributions.invalidate();
      utils.coins.getBalance.invalidate();
      utils.coins.getHistory.invalidate();

      const coins = (data as { coinsEarned?: number })?.coinsEarned;
      toast.success("Mission Complete!", {
        description: coins
          ? `You earned +${coins} coins. Your balance has been updated.`
          : "Your mission has been marked as complete.",
        duration: 5000,
      });

      // Strip the query param so a page refresh doesn't re-fire
      const clean = window.location.pathname;
      setLocation(clean, { replace: true });
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
