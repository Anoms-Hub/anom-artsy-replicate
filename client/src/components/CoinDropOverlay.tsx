import { useEffect, useState } from "react";

/** Dispatch this event from anywhere to trigger the coin drop animation */
export const COIN_DROP_EVENT = "sanctuary:coin-drop";

export function triggerCoinDrop(coinsEarned?: number) {
  window.dispatchEvent(
    new CustomEvent(COIN_DROP_EVENT, { detail: { coinsEarned } })
  );
}

type CoinParticle = {
  id: number;
  x: number;       // vw percentage
  delay: number;   // ms
  duration: number; // ms
  size: number;    // px
  rotation: number; // deg
  wobble: number;  // px horizontal wobble
};

function makeCoins(count: number): CoinParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 800,
    duration: 900 + Math.random() * 700,
    size: 18 + Math.random() * 16,
    rotation: Math.random() * 720 - 360,
    wobble: (Math.random() - 0.5) * 40,
  }));
}

/**
 * CoinDropOverlay
 *
 * Mount once in App.tsx. Listens for the `sanctuary:coin-drop` custom event
 * and renders a brief full-screen coin rain animation.
 *
 * Trigger from anywhere:
 *   import { triggerCoinDrop } from "@/components/CoinDropOverlay";
 *   triggerCoinDrop(coinsEarned);
 */
export default function CoinDropOverlay() {
  const [active, setActive] = useState(false);
  const [coins, setCoins] = useState<CoinParticle[]>([]);
  const [earnedLabel, setEarnedLabel] = useState<number | null>(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { coinsEarned?: number };
      setCoins(makeCoins(28));
      setEarnedLabel(detail?.coinsEarned ?? null);
      setAnimKey(k => k + 1);
      setActive(true);
      setTimeout(() => setActive(false), 2400);
    };

    window.addEventListener(COIN_DROP_EVENT, handler);
    return () => window.removeEventListener(COIN_DROP_EVENT, handler);
  }, []);

  if (!active) return null;

  return (
    <div
      key={animKey}
      className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden"
      aria-hidden
    >
      {/* Coin particles */}
      {coins.map(c => (
        <span
          key={c.id}
          className="absolute select-none"
          style={{
            left: `${c.x}vw`,
            top: "-40px",
            fontSize: `${c.size}px`,
            animationName: `coin-fall-${animKey}-${c.id}`,
            animationDuration: `${c.duration}ms`,
            animationDelay: `${c.delay}ms`,
            animationTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)",
            animationFillMode: "forwards",
            opacity: 0,
          }}
        >
          🪙
        </span>
      ))}

      {/* Earned label — pops up in center */}
      {earnedLabel !== null && earnedLabel > 0 && (
        <div
          className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
          style={{
            animation: `coin-label-${animKey} 2.2s cubic-bezier(0.23, 1, 0.32, 1) forwards`,
            opacity: 0,
          }}
        >
          <span className="text-5xl font-black text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.9)]"
            style={{ textShadow: "0 0 20px #facc15, 0 2px 4px rgba(0,0,0,0.8)" }}
          >
            +{earnedLabel}
          </span>
          <span className="text-lg font-bold text-yellow-200 tracking-widest uppercase"
            style={{ textShadow: "0 0 10px #facc15" }}
          >
            Coins Earned!
          </span>
        </div>
      )}

      {/* Inject keyframes dynamically so each burst is independent */}
      <style>{`
        ${coins.map(c => `
          @keyframes coin-fall-${animKey}-${c.id} {
            0%   { transform: translateY(0) rotate(0deg) translateX(0); opacity: 0; }
            8%   { opacity: 1; }
            80%  { opacity: 1; }
            100% { transform: translateY(110vh) rotate(${c.rotation}deg) translateX(${c.wobble}px); opacity: 0; }
          }
        `).join("")}
        @keyframes coin-label-${animKey} {
          0%   { transform: translate(-50%, -50%) scale(0.4); opacity: 0; }
          15%  { transform: translate(-50%, -50%) scale(1.15); opacity: 1; }
          30%  { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          70%  { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
