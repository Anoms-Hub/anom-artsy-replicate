import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Coins, CheckCircle2, Loader2, X, Zap, Target, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Mission {
  id: number;
  title: string;
  description: string;
  category: string;
  rewardCoins: number | null;
}

interface MissionDetailModalProps {
  mission: Mission | null;
  isCompleted: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const CATEGORY_INFO: Record<string, { label: string; color: string; hint: string }> = {
  "welcome": { label: "Welcome", color: "text-green-400", hint: "Complete this to get started in the AO Universe." },
  "perimeter-sweep": { label: "Perimeter Sweep", color: "text-cyan-400", hint: "Help keep the community safe and welcoming." },
  "resource-logistics": { label: "Resource Logistics", color: "text-yellow-400", hint: "Contribute resources to the community." },
  "community": { label: "Community", color: "text-pink-400", hint: "Connect with and support other members." },
  "creativity": { label: "Creativity", color: "text-purple-400", hint: "Express yourself and share your creative work." },
  "financial": { label: "Financial District", color: "text-emerald-400", hint: "Learn and practice financial literacy skills." },
  "social-good": { label: "Social Good", color: "text-rose-400", hint: "Make a positive impact in the AO Universe." },
};

export function MissionDetailModal({ mission, isCompleted, onClose, onComplete }: MissionDetailModalProps) {
  const [step, setStep] = useState<"detail" | "confirm" | "success">("detail");
  const utils = trpc.useUtils();

  const completeMissionMutation = trpc.missions.completeMission.useMutation({
    onSuccess: () => {
      utils.missions.getMissions.invalidate();
      utils.missions.getMyContributions.invalidate();
      utils.coins.getBalance.invalidate();
      utils.coins.getHistory.invalidate();
      setStep("success");
      // Notify parent that mission was completed (for balance refresh)
      // but keep modal open so user sees the success screen
      onComplete();
    },
    onError: (err) => {
      toast.error(err.message || "Could not complete mission. Try again.");
      setStep("detail");
    },
  });

  if (!mission) return null;

  const catInfo = CATEGORY_INFO[mission.category] ?? { label: mission.category, color: "text-slate-400", hint: "Complete this mission to earn coins." };
  const coins = mission.rewardCoins ?? 0;

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

        <div className="px-6 py-5">
          {step === "detail" && (
            <div className="space-y-4">
              <p className="text-sm text-slate-300 leading-relaxed">{mission.description}</p>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <p className="text-xs text-slate-500 mb-1">Mission Hint</p>
                <p className="text-sm text-slate-300">{catInfo.hint}</p>
              </div>

              {/* Reward */}
              <div className="flex items-center justify-between bg-cyan-500/10 border border-cyan-500/30 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-slate-300">Coin Reward</span>
                </div>
                <span className="text-xl font-bold text-cyan-400">+{coins}</span>
              </div>

              {isCompleted ? (
                <div className="flex items-center gap-2 justify-center py-2 text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Already Completed</span>
                </div>
              ) : (
                <Button
                  onClick={() => setStep("confirm")}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  I'm Ready to Complete This
                </Button>
              )}
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-pink-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Confirm Completion</h3>
                <p className="text-sm text-slate-400">
                  Mark <span className="text-pink-300 font-semibold">"{mission.title}"</span> as complete?
                  You'll earn <span className="text-cyan-400 font-bold">{coins} coins</span>.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("detail")}
                  className="flex-1 border-white/20 text-slate-300 hover:bg-white/10"
                  disabled={completeMissionMutation.isPending}
                >
                  Go Back
                </Button>
                <Button
                  onClick={() => completeMissionMutation.mutate({ missionId: mission.id })}
                  disabled={completeMissionMutation.isPending}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold"
                >
                  {completeMissionMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Completing...</>
                  ) : (
                    "Yes, Complete It!"
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-4 text-center py-2">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Star className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-1">Mission Complete!</h3>
                <p className="text-sm text-slate-400">
                  You earned <span className="text-cyan-400 font-bold text-lg">+{coins} coins</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">Your balance has been updated.</p>
              </div>
              <Button
                onClick={onClose}
                className="w-full bg-green-500/20 border border-green-500/40 text-green-300 hover:bg-green-500/30"
              >
                Back to Missions
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
