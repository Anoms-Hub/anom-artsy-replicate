import { Coins, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

/** Coin colours for the confetti burst */
const CONFETTI_COLORS = ["#facc15", "#fb923c", "#f472b6", "#34d399", "#60a5fa", "#a78bfa"];

type Particle = { dx: number; dy: number; rotate: number; color: string };

function makeParticles(count = 12): Particle[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 2 * Math.PI + Math.random() * 0.4;
    const dist = 28 + Math.random() * 28;
    return {
      dx: Math.cos(angle) * dist,
      dy: Math.sin(angle) * dist,
      rotate: Math.random() * 360,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    };
  });
}

/**
 * CoinBalancePill
 *
 * Drop-in coin balance display for any page header.
 * Automatically polls the live balance and fires a confetti + flash
 * animation whenever the balance increases.
 *
 * Usage:
 *   import CoinBalancePill from "@/components/CoinBalancePill";
 *   <CoinBalancePill />
 */
export default function CoinBalancePill() {
  const coinBalanceQuery = trpc.coins.getBalance.useQuery(undefined, {
    refetchInterval: 15_000, // poll every 15s as a fallback
  });

  const [balanceFlash, setBalanceFlash] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [confettiParticles, setConfettiParticles] = useState<Particle[]>([]);
  const prevBalanceRef = useRef<number>(0);
  const hasLoadedBalance = useRef(false);

  const currentBalance = coinBalanceQuery.data
    ? Math.floor(parseFloat(coinBalanceQuery.data.balance?.toString() || "0"))
    : 0;

  useEffect(() => {
    if (!coinBalanceQuery.data) return;

    if (!hasLoadedBalance.current) {
      hasLoadedBalance.current = true;
      prevBalanceRef.current = currentBalance;
      return;
    }

    if (currentBalance > prevBalanceRef.current) {
      // Flash the pill
      setBalanceFlash(true);
      setTimeout(() => setBalanceFlash(false), 1200);

      // Burst confetti
      setConfettiParticles(makeParticles(12));
      setConfettiKey(k => k + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1800);
    }

    prevBalanceRef.current = currentBalance;
  }, [currentBalance, coinBalanceQuery.data]);

  return (
    <div className="relative hidden sm:block">
      <div
        className={`flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded border transition-all duration-300 ${
          balanceFlash
            ? "border-yellow-400/80 shadow-[0_0_16px_rgba(250,204,21,0.6)]"
            : "border-cyan-500/30"
        }`}
      >
        <Coins
          className={`w-4 h-4 transition-colors duration-300 ${
            balanceFlash ? "text-yellow-400" : "text-cyan-400"
          }`}
        />
        <div>
          <p className="text-[10px] text-gray-400 leading-none">Balance</p>
          <p
            className={`text-sm font-bold transition-all duration-300 leading-tight ${
              balanceFlash ? "text-yellow-400 scale-110" : "text-cyan-400 scale-100"
            }`}
            style={{ display: "inline-block", transformOrigin: "center" }}
          >
            {currentBalance}
          </p>
        </div>
        {balanceFlash && (
          <Sparkles className="w-3 h-3 text-yellow-300 animate-spin" />
        )}
      </div>

      {/* Confetti burst */}
      {showConfetti && (
        <div
          key={confettiKey}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          {confettiParticles.map((p, i) => (
            <span
              key={i}
              className="absolute block rounded-sm"
              style={{
                width: i % 3 === 0 ? "5px" : "3px",
                height: i % 3 === 0 ? "3px" : "7px",
                background: p.color,
                transform: "translate(0,0) rotate(0deg)",
                opacity: 1,
                animation: `cpill-fly-${confettiKey}-${i} 1.6s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
              }}
            />
          ))}
          <style>{`
            ${confettiParticles
              .map(
                (p, i) => `
              @keyframes cpill-fly-${confettiKey}-${i} {
                0%   { transform: translate(0,0) rotate(0deg); opacity: 1; }
                60%  { opacity: 1; }
                100% { transform: translate(${p.dx}px, ${p.dy}px) rotate(${p.rotate}deg); opacity: 0; }
              }
            `
              )
              .join("")}
          `}</style>
        </div>
      )}
    </div>
  );
}
