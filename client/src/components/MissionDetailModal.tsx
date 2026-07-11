import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, CheckCircle2, X, Target, ExternalLink } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Mission {
  id: number;
  title: string;
  description: string;
  category: string;
  rewardCoins: number | null;
  actionUrl?: string | null;
}

interface MissionDetailModalProps {
  mission: Mission | null;
  isCompleted: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const CATEGORY_INFO: Record<string, { label: string; color: string }> = {
  "welcome": { label: "Welcome", color: "text-green-400" },
  "perimeter-sweep": { label: "Perimeter Sweep", color: "text-cyan-400" },
  "resource-logistics": { label: "Resource Logistics", color: "text-yellow-400" },
  "community": { label: "Community", color: "text-pink-400" },
  "creativity": { label: "Creativity", color: "text-purple-400" },
  "financial": { label: "Financial District", color: "text-emerald-400" },
  "social-good": { label: "Social Good", color: "text-rose-400" },
};

export function MissionDetailModal({ mission, isCompleted, onClose, onComplete }: MissionDetailModalProps) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  // Keep the mutation available for the "already completed" path
  // (the hook on the destination page handles the normal path)
  const completeMissionMutation = trpc.missions.completeMission.useMutation({
    onSuccess: () => {
      utils.missions.getMissions.invalidate();
      utils.missions.getMyContributions.invalidate();
      utils.coins.getBalance.invalidate();
      utils.coins.getHistory.invalidate();
      onComplete();
    },
    onError: (err) => {
      toast.error(err.message || "Could not complete mission. Try again.");
    },
  });
  // suppress unused warning — mutation is kept for future use
  void completeMissionMutation;

  if (!mission) return null;

  const catInfo = CATEGORY_INFO[mission.category] ?? { label: mission.category, color: "text-slate-400" };
  const coins = mission.rewardCoins ?? 0;

  // Navigate to the mission's destination page.
  // The ?completeMission=<id> param is picked up by useMissionAutoComplete
  // on the destination page, which fires the mutation and shows a success toast.
  const handleGoToMission = () => {
    const dest = mission.actionUrl || "/dashboard";
    const url = `${dest}?completeMission=${mission.id}`;
    onClose();
    setLocation(url);
  };

  return (
    <Dialog open={!!mission} onOpenChange={onClose}>
      <DialogContent className="bg-[#0d0025] border border-pink-500/30 text-white max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">{mission.title}</DialogTitle>

        {/* Header bar */}
        <div className="relative bg-gradient-to-r from-pink-900/60 to-purple-900/60 px-6 pt-6 pb-4 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <Target className="w-5 h-5 text-pink-400" />
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${catInfo.color}`}>
                {catInfo.label}
              </p>
              <h2 className="text-lg font-bold text-white leading-tight">{mission.title}</h2>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Mission description */}
          <p className="text-sm text-slate-300 leading-relaxed">{mission.description}</p>

          {/* Coin reward */}
          <div className="flex items-center justify-between bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-cyan-400" />
              <span className="text-sm text-slate-300">Coin Reward</span>
            </div>
            <span className="text-xl font-bold text-cyan-400">+{coins}</span>
          </div>

          {/* Destination hint */}
          {!isCompleted && mission.actionUrl && (
            <p className="text-xs text-slate-500 text-center">
              You'll be taken to{" "}
              <span className="text-pink-300 font-medium">{mission.actionUrl}</span>{" "}
              — completing the action there marks this mission done automatically.
            </p>
          )}

          {/* CTA */}
          {isCompleted ? (
            <div className="flex items-center gap-2 justify-center py-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-semibold">Already Completed</span>
            </div>
          ) : (
            <Button
              onClick={handleGoToMission}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Go Complete This Mission
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
