import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Zap, ArrowLeft, Trophy, Coins } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { startLogin } from "@/const";
import { OffGridGame } from "./OffGrid";

// ===================== TRIVIA GAME =====================
const triviaQuestions = [
  { q: "What is the fabric of the AO Universe called?", a: "The Weave", opts: ["The Weave", "The Grid", "The Bloom", "The Spark"] },
  { q: "What realm solidifies first in Era 2?", a: "Neon City", opts: ["Dream Drift", "Neon City", "Snack Vault", "Wild Grid"] },
  { q: "Which AO Law says every major event traces back to a snack decision?", a: "Law of Snack Causality", opts: ["Law of Story Loops", "Law of Creative Gravity", "Law of Snack Causality", "Law of the Weave"] },
  { q: "Who is the very first character born in the AO Universe?", a: "AO Main Character", opts: ["Grandma", "Jay", "AO Main Character", "Lila"] },
  { q: "What was the AO Universe before the First Spark?", a: "The Void", opts: ["Darkness", "The Void", "The Grid", "Nothingness"] },
  { q: "Which realm requires emotional sincerity to enter?", a: "Snack Vault", opts: ["Dream Drift", "Wild Grid", "Snack Vault", "Story Plane"] },
  { q: "What does the Law of Story Loops say about endings?", a: "Every ending is a beginning in disguise", opts: ["Stories end permanently", "Every ending is a beginning in disguise", "Loops only happen in Wild Grid", "Endings reset the universe"] },
  { q: "In Kids Corner Ep 2 what does Grandma reorganize twice?", a: "The kitchen", opts: ["The living room", "The garage", "The kitchen", "The kids room"] },
  { q: "What is the soft space between sleep and inspiration called?", a: "Dream Drift", opts: ["Wild Grid", "Story Plane", "Dream Drift", "The Void"] },
  { q: "What do characters find when they reach the edge of The Void?", a: "New abilities", opts: ["The end of all stories", "New abilities", "The Snack Vault", "AO Main Characters home"] },
];

function TriviaGame({ onEarnCoins }: { onEarnCoins: (amount: number) => void }) {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);
  const [msg, setMsg] = useState("");
  const [shuffledOpts, setShuffledOpts] = useState<string[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState(false);

  useEffect(() => {
    if (idx < triviaQuestions.length) {
      setShuffledOpts([...triviaQuestions[idx].opts].sort(() => Math.random() - 0.5));
      setMsg("");
      setLocked(false);
    }
  }, [idx]);

  const answer = (chosen: string) => {
    if (locked) return;
    setLocked(true);
    const correct = triviaQuestions[idx].a;
    if (chosen === correct) {
      setScore(s => s + 1);
      setMsg("✨ Correct! The Weave grows stronger.");
    } else {
      setMsg(`🌑 Not quite. Answer: ${correct}`);
    }
    setTimeout(() => {
      if (idx + 1 >= triviaQuestions.length) {
        setGameOver(true);
      } else {
        setIdx(i => i + 1);
      }
    }, 1800);
  };

  const reset = () => {
    setIdx(0);
    setScore(0);
    setLocked(false);
    setMsg("");
    setGameOver(false);
    setCoinsAwarded(false);
  };

  useEffect(() => {
    if (gameOver && !coinsAwarded) {
      const earned = score * 5;
      if (earned > 0) {
        onEarnCoins(earned);
        setCoinsAwarded(true);
      }
    }
  }, [gameOver, score, coinsAwarded, onEarnCoins]);

  if (gameOver) {
    return (
      <div className="text-center py-4">
        <p className="text-2xl font-bold text-pink-400 mb-2">Game Over!</p>
        <p className="text-cyan-300 text-lg mb-1">Final Score: {score}/10</p>
        <p className="text-yellow-400 text-sm mb-4">+{score * 5} Anom Coins earned!</p>
        <button onClick={reset} className="px-4 py-2 border border-cyan-500 text-cyan-400 rounded-full text-sm hover:bg-cyan-500/20 transition">
          Play Again
        </button>
      </div>
    );
  }

  const q = triviaQuestions[idx];
  return (
    <div>
      <div className="bg-black/40 rounded-xl p-4 text-center mb-4">
        <p className="text-3xl font-black text-pink-400">{score}</p>
        <p className="text-xs text-gray-400 uppercase tracking-widest">Score | Q {idx + 1}/10</p>
      </div>
      <p className="text-gray-200 mb-3 leading-relaxed min-h-[48px]">{q.q}</p>
      <div className="space-y-2">
        {shuffledOpts.map((opt) => {
          let cls = "w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ";
          if (locked && opt === q.a) cls += "border-green-500 bg-green-500/15 text-green-300";
          else if (locked) cls += "border-white/10 bg-white/5 text-gray-500";
          else cls += "border-white/10 bg-white/5 text-gray-300 hover:border-cyan-400 hover:text-white hover:bg-cyan-500/10 cursor-pointer";
          return (
            <button key={opt} className={cls} onClick={() => answer(opt)} disabled={locked}>
              {opt}
            </button>
          );
        })}
      </div>
      {msg && <p className="text-purple-400 italic text-sm mt-3">{msg}</p>}
    </div>
  );
}

// ===================== MEMORY GAME =====================
const memEmojis = ["🎨", "⚡", "🍕", "🌌", "📖", "💭", "🏙️", "🌀"];

function MemoryGame({ onEarnCoins }: { onEarnCoins: (amount: number) => void }) {
  const [cards, setCards] = useState<{ val: string; idx: number; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matched, setMatched] = useState(0);
  const [lock, setLock] = useState(false);
  const [coinsAwarded, setCoinsAwarded] = useState(false);

  const init = () => {
    const deck = [...memEmojis, ...memEmojis]
      .sort(() => Math.random() - 0.5)
      .map((val, idx) => ({ val, idx, flipped: false, matched: false }));
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setMatched(0);
    setLock(false);
    setCoinsAwarded(false);
  };

  useEffect(() => { init(); }, []);

  const flip = (idx: number) => {
    if (lock || cards[idx].flipped || cards[idx].matched) return;
    const newCards = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
    const newFlipped = [...flipped, idx];
    setCards(newCards);
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setLock(true);
      const [a, b] = newFlipped;
      if (newCards[a].val === newCards[b].val) {
        const matchedCards = newCards.map((c, i) =>
          i === a || i === b ? { ...c, matched: true, flipped: true } : c
        );
        setCards(matchedCards);
        const newMatched = matched + 1;
        setMatched(newMatched);
        setFlipped([]);
        setLock(false);
        if (newMatched === 8 && !coinsAwarded) {
          onEarnCoins(25);
          setCoinsAwarded(true);
        }
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) =>
            i === a || i === b ? { ...c, flipped: false } : c
          ));
          setFlipped([]);
          setLock(false);
        }, 900);
      }
    }
  };

  return (
    <div>
      <div className="bg-black/40 rounded-xl p-4 text-center mb-4">
        <p className="text-3xl font-black text-pink-400">{moves}</p>
        <p className="text-xs text-gray-400 uppercase tracking-widest">Moves | {matched}/8 matched</p>
      </div>
      {matched === 8 && (
        <p className="text-yellow-400 text-center text-sm mb-3">🎉 You matched all! +25 Anom Coins!</p>
      )}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {cards.map((card) => (
          <button
            key={card.idx}
            onClick={() => flip(card.idx)}
            className={`aspect-square rounded-xl flex items-center justify-center text-2xl transition-all border-2 ${
              card.matched
                ? "border-green-500 bg-green-500/10 cursor-default"
                : card.flipped
                ? "border-pink-500 bg-slate-800"
                : "border-white/10 bg-slate-900 hover:border-cyan-400 cursor-pointer"
            }`}
          >
            {(card.flipped || card.matched) ? card.val : ""}
          </button>
        ))}
      </div>
      <button onClick={init} className="px-4 py-2 border border-cyan-500 text-cyan-400 rounded-full text-sm hover:bg-cyan-500/20 transition">
        New Game
      </button>
    </div>
  );
}

// ===================== MOOD MATCHER =====================
const moodMap: Record<string, { char: string; msg: string; color: string }> = {
  Creative: { char: "AO Main Character", msg: "Full creation mode. The Wild Grid is calling. Start making that thing you have been sitting on.", color: "#c084fc" },
  Tired: { char: "Grandma (Ep 2)", msg: "Rest is productive. Grandma knows this. The universe does not require you at 100% every second.", color: "#818cf8" },
  Hungry: { char: "Snack Vault Guardian", msg: "The Snack Vault opens for you. You are tapping into the Law of Snack Causality. Honor it.", color: "#f59e0b" },
  Hyped: { char: "AO Persona — CEO Mode", msg: "This is your activation moment. Big energy without direction dissipates. Pick one task and dominate it.", color: "#00eaff" },
  Reflective: { char: "Dream Drift Wanderer", msg: "You are in the Dream Drift. This is where clarity comes from. Something important is assembling itself.", color: "#38bdf8" },
  Chaotic: { char: "Wild Grid Entity", msg: "Pure Wild Grid energy. Stop trying to organize it. Let it out in one explosive creative act.", color: "#ff5ebc" },
};

function MoodMatcher() {
  const [selected, setSelected] = useState<string | null>(null);
  const moods = ["Creative 🎨", "Tired 😴", "Hungry 🍕", "Hyped ⚡", "Reflective 🌙", "Chaotic 🌀"];

  return (
    <div>
      <p className="text-gray-400 text-sm mb-4">What energy are you bringing today?</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {moods.map((mood) => {
          const key = mood.split(" ")[0];
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={`px-4 py-2 rounded-full text-sm border transition-all ${
                selected === key
                  ? "border-pink-500 bg-pink-500/20 text-white"
                  : "border-white/10 bg-white/5 text-gray-300 hover:border-pink-400 hover:text-white"
              }`}
            >
              {mood}
            </button>
          );
        })}
      </div>
      {selected && moodMap[selected] && (
        <div
          className="rounded-xl p-4 text-sm leading-relaxed"
          style={{
            background: "linear-gradient(135deg, rgba(255,0,204,0.08), rgba(0,234,255,0.08))",
            borderLeft: `3px solid ${moodMap[selected].color}`,
          }}
        >
          <p className="font-bold mb-1" style={{ color: moodMap[selected].color }}>
            Your AO Match: {moodMap[selected].char}
          </p>
          <p className="text-gray-300">{moodMap[selected].msg}</p>
        </div>
      )}
    </div>
  );
}

// ===================== SNACK CLICKER =====================
const snacks = ["🍕", "🍪", "🍿", "🍩", "🍜", "🧇", "🍫", "🥤"];
const clickerMsgs = [
  "Tap faster! The Vault needs you!",
  "You are doing great, keeper!",
  "Level up incoming...",
  "The Weave grows stronger!",
  "Snack Causality is real!",
  "AO approves this mission.",
  "Keep going! Almost there!",
  "Legendary snack energy!",
];

function SnackClicker({ onEarnCoins }: { onEarnCoins: (amount: number) => void }) {
  const [count, setCount] = useState(0);
  const [level, setLevel] = useState(1);
  const [goal, setGoal] = useState(20);
  const [currentSnack, setCurrentSnack] = useState("🍕");
  const [msg, setMsg] = useState("Tap the snack to begin your mission!");
  const [coinsEarned, setCoinsEarned] = useState(0);

  const click = () => {
    const newCount = count + 1;
    setCount(newCount);
    setCurrentSnack(snacks[Math.floor(Math.random() * snacks.length)]);
    setMsg(clickerMsgs[Math.floor(Math.random() * clickerMsgs.length)]);

    if (newCount >= goal) {
      const newLevel = level + 1;
      const newGoal = newLevel * 20;
      setLevel(newLevel);
      setGoal(newGoal);
      setMsg(`🎉 LEVEL ${newLevel}! Snack Vault expanding!`);
      const earned = 10;
      setCoinsEarned(c => c + earned);
      onEarnCoins(earned);
    }
  };

  const progress = Math.min((count / goal) * 100, 100);

  return (
    <div>
      <div className="bg-black/40 rounded-xl p-4 text-center mb-4">
        <p className="text-3xl font-black text-pink-400">{count}</p>
        <p className="text-xs text-gray-400 uppercase tracking-widest">Snacks | Level {level}</p>
      </div>
      {coinsEarned > 0 && (
        <p className="text-yellow-400 text-center text-xs mb-2">+{coinsEarned} Anom Coins earned!</p>
      )}
      <div className="text-center py-4">
        <button
          onClick={click}
          className="text-6xl select-none hover:scale-110 active:scale-90 transition-transform cursor-pointer bg-transparent border-none"
        >
          {currentSnack}
        </button>
      </div>
      <div className="bg-white/5 rounded-lg h-3 mb-3 overflow-hidden">
        <div
          className="h-full rounded-lg transition-all duration-300"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg, #ff00cc, #00eaff)" }}
        />
      </div>
      <p className="text-purple-400 italic text-sm text-center">{msg}</p>
    </div>
  );
}

// ===================== ANOM TYCOON =====================
interface TycoonState {
  money: number;
  inventory: number;
  day: number;
  level: number;
  buffs: string[];
}

function AnomTycoon({ onEarnCoins }: { onEarnCoins: (amount: number) => void }) {
  const [game, setGame] = useState<TycoonState>(() => {
    try {
      const saved = localStorage.getItem("aoTycoonSave");
      return saved ? JSON.parse(saved) : { money: 1000, inventory: 0, day: 1, level: 1, buffs: [] };
    } catch {
      return { money: 1000, inventory: 0, day: 1, level: 1, buffs: [] };
    }
  });
  const [log, setLog] = useState("Terminal ready. Welcome, Anom.");

  const save = (g: TycoonState) => {
    setGame(g);
    localStorage.setItem("aoTycoonSave", JSON.stringify(g));
  };

  const plantCrop = () => {
    if (game.money >= 50) {
      const multiplier = game.buffs.includes("Fertilizer") ? 1.5 : 1;
      const yieldAmount = Math.floor((10 + game.level * 5) * multiplier);
      save({ ...game, money: game.money - 50, inventory: game.inventory + yieldAmount });
      setLog(`Crops planted. Yield: ${yieldAmount} units.`);
    } else {
      setLog("Insufficient funds.");
    }
  };

  const scoutWasteland = () => {
    if (game.money >= 50) {
      const roll = Math.random();
      const newGame = { ...game, money: game.money - 50 };
      if (roll > 0.7 && !game.buffs.includes("Beast Guard")) {
        newGame.buffs = [...game.buffs, "Beast Guard"];
        setLog("Found a Beast Guard! Production buff active.");
      } else if (roll > 0.4 && !game.buffs.includes("Fertilizer")) {
        newGame.buffs = [...game.buffs, "Fertilizer"];
        setLog("Found high-grade Fertilizer! Yield increased.");
      } else {
        newGame.money += 20;
        setLog("Scouted small scrap. +$20.");
      }
      save(newGame);
    } else {
      setLog("Insufficient funds.");
    }
  };

  const wholesaleSale = () => {
    if (game.inventory > 0) {
      const marketVol = 0.8 + Math.random() * 0.4;
      const price = Math.floor((50 + game.level * 10) * marketVol);
      const profit = game.inventory * price;
      const newGame = { ...game, money: game.money + profit, inventory: 0, day: game.day + 1 };
      save(newGame);
      setLog(`Sold for $${price}/unit. Total: $${profit}.`);
      if (profit > 500) {
        onEarnCoins(15);
        setLog(`Sold for $${price}/unit. Total: $${profit}. +15 Anom Coins!`);
      }
    } else {
      setLog("Nothing to sell.");
    }
  };

  const upgradeLevel = () => {
    if (game.money >= 2000) {
      const newGame = { ...game, money: game.money - 2000, level: game.level + 1 };
      save(newGame);
      setLog(`System Upgraded to Level ${newGame.level}. +20 Anom Coins!`);
      onEarnCoins(20);
    } else {
      setLog("Need $2000 for upgrade.");
    }
  };

  const resetGame = () => {
    const fresh = { money: 1000, inventory: 0, day: 1, level: 1, buffs: [] };
    save(fresh);
    setLog("Terminal reset. Welcome back, Anom.");
  };

  return (
    <div className="font-mono">
      <div className="border border-pink-500/40 rounded-lg p-4 mb-4 bg-black/60 text-sm space-y-1">
        <p className="text-cyan-400">AO BALANCE: <span className="text-white font-bold">${game.money}</span></p>
        <p className="text-cyan-400">INVENTORY: <span className="text-white font-bold">{game.inventory} units</span></p>
        <p className="text-cyan-400">DAY: <span className="text-white">{game.day}</span> | LEVEL: <span className="text-white">{game.level}</span></p>
        <p className="text-cyan-400">BUFFS: <span className="text-green-400">{game.buffs.length > 0 ? game.buffs.join(", ") : "None"}</span></p>
      </div>
      <div className="space-y-2 mb-4">
        {[
          { label: "PLANT CROP (-$50)", action: plantCrop },
          { label: "SCOUT WASTELAND (-$50)", action: scoutWasteland },
          { label: "WHOLESALE SALE", action: wholesaleSale },
          { label: "UPGRADE LEVEL (-$2000)", action: upgradeLevel },
        ].map(({ label, action }) => (
          <button
            key={label}
            onClick={action}
            className="w-full text-left px-4 py-2 border border-green-500/50 text-green-400 bg-black hover:bg-green-500 hover:text-black transition-all text-sm rounded"
          >
            {label}
          </button>
        ))}
      </div>
      <div className="border-t border-white/10 pt-3 mb-3">
        <p className="text-white/80 text-sm">{log}</p>
      </div>
      <button onClick={resetGame} className="text-xs text-gray-500 hover:text-red-400 transition">
        Reset Game
      </button>
    </div>
  );
}

// ===================== MAIN GAMES HUB PAGE =====================
const gameCards = [
  {
    id: "trivia",
    icon: "🧠",
    title: "AO UNIVERSE TRIVIA",
    desc: "Test your lore knowledge — 10 questions from the Codex",
    reward: "5 coins per correct answer",
  },
  {
    id: "memory",
    icon: "🧩",
    title: "NEON MEMORY",
    desc: "Match AO Universe icons in as few moves as possible",
    reward: "25 coins for completing",
  },
  {
    id: "mood",
    icon: "✨",
    title: "AO MOOD MATCHER",
    desc: "Pick your vibe — get your AO character match",
    reward: "Free — just for fun!",
  },
  {
    id: "snack",
    icon: "🍕",
    title: "SNACK VAULT RUSH",
    desc: "Click to fill the Snack Vault before it empties",
    reward: "10 coins per level up",
  },
  {
    id: "tycoon",
    icon: "💻",
    title: "AO TERMINAL",
    desc: "Economic simulation — plant, scout, sell, upgrade",
    reward: "15–20 coins per milestone",
  },
  {
    id: "offgrid",
    icon: "🛡️",
    title: "OFF GRID",
    desc: "Defend the grid. Clear threats. Earn coins.",
    reward: "10 coins per threat cleared",
  },
];

export default function Games() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [earnFlash, setEarnFlash] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [pendingEarnAmount, setPendingEarnAmount] = useState(0);
  const coinBalanceQuery = trpc.coins.getBalance.useQuery(undefined, { enabled: !!user });
  const utils = trpc.useUtils();

  const earnCoinsMutation = trpc.games.earnCoins.useMutation({
    onSuccess: () => {
      // Immediately refresh balance and history across the app
      utils.coins.getBalance.invalidate();
      utils.coins.getHistory.invalidate();
    },
  });

  const handleEarnCoins = (amount: number, source: string = "Game") => {
    setTotalCoinsEarned(c => c + amount);
    setEarnFlash(`+${amount}`);
    setTimeout(() => setEarnFlash(""), 2500);
    if (user) {
      earnCoinsMutation.mutate({ amount, source });
    } else {
      setPendingEarnAmount(a => a + amount);
      setShowLoginPrompt(true);
    }
  };

  const renderGame = () => {
    switch (activeGame) {
      case "trivia": return <TriviaGame onEarnCoins={(n) => handleEarnCoins(n, "Game: AO Trivia")} />;
      case "memory": return <MemoryGame onEarnCoins={(n) => handleEarnCoins(n, "Game: Neon Memory")} />;
      case "mood": return <MoodMatcher />;
      case "snack": return <SnackClicker onEarnCoins={(n) => handleEarnCoins(n, "Game: Snack Vault Rush")} />;
      case "tycoon": return <AnomTycoon onEarnCoins={(n) => handleEarnCoins(n, "Game: AO Terminal")} />;
      case "offgrid": return <OffGridGame onEarnCoins={(n) => handleEarnCoins(n, "Game: Off-Grid")} />;
      default: return null;
    }
  };

  const activeCard = gameCards.find(g => g.id === activeGame);

  return (
    <div className="min-h-screen" style={{ background: "#0b0e14" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b px-6 py-4 flex items-center justify-between backdrop-blur"
        style={{ background: "rgba(11,14,20,0.95)", borderColor: "rgba(255,0,204,0.2)" }}
      >
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition text-sm">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Sanctuary</span>
            </button>
          </Link>
          <div className="w-px h-6 bg-white/10 mx-1" />
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-pink-500" />
            <span className="font-bold" style={{ color: "#ff00cc", fontFamily: "'Space Mono', monospace" }}>
              AO Games Hub
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Earn flash — briefly shows +N when coins are awarded */}
          {earnFlash && (
            <div className="flex items-center gap-1 text-yellow-300 text-sm font-bold" style={{ animation: "fadeInUp 0.3s ease-out" }}>
              <Trophy className="w-4 h-4" />
              {earnFlash} coins!
            </div>
          )}
          {totalCoinsEarned > 0 && !earnFlash && (
            <div className="flex items-center gap-1 text-yellow-400/70 text-xs">
              <Trophy className="w-3.5 h-3.5" />
              +{totalCoinsEarned} this session
            </div>
          )}
          {user && (
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border text-sm"
              style={{ background: "rgba(0,0,0,0.6)", borderColor: "rgba(0,234,255,0.3)" }}
            >
              <Coins className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 font-bold">
                {coinBalanceQuery.data ? Math.floor(parseFloat(coinBalanceQuery.data.balance?.toString() || "0")) : "—"}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <div
        className="text-center px-6 py-12"
        style={{ background: "radial-gradient(ellipse at center, rgba(255,0,204,0.08) 0%, transparent 70%)" }}
      >
        <p
          className="text-xs tracking-widest uppercase mb-3"
          style={{ color: "#00eaff", fontFamily: "monospace" }}
        >
          // AO Games Hub //
        </p>
        <h1
          className="text-4xl sm:text-5xl font-black mb-3"
          style={{
            background: "linear-gradient(135deg, #ff00cc, #c084fc, #00eaff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "2px",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          PLAY THE AO UNIVERSE
        </h1>
        <p className="text-gray-400 max-w-lg mx-auto">
          Original mini-games built from AO lore. Earn Anom Coins while you play. No downloads. Just vibes, snacks, and cosmic fun.
        </p>
        {!user && (
          <p className="text-yellow-400/80 text-sm mt-3">
            💡 Sign in to save your Anom Coins earnings to your account
          </p>
        )}
      </div>

      {/* Active Game Modal */}
      {activeGame && activeCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)" }}>
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: "#0f1420", border: "1px solid rgba(255,0,204,0.3)" }}
          >
            <div
              className="px-5 py-4 flex items-center justify-between border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeCard.icon}</span>
                <div>
                  <p className="font-bold text-cyan-400 text-sm">{activeCard.title}</p>
                  <p className="text-xs text-yellow-400">{activeCard.reward}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveGame(null)}
                className="text-gray-500 hover:text-white transition text-xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-5">
              {renderGame()}
            </div>
          </div>
        </div>
      )}

      {/* Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-6 pb-16">
        {gameCards.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1"
            style={{
              background: "#0f1420",
              border: "1px solid rgba(255,0,204,0.15)",
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,234,255,0.4)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,0,204,0.15)")}
            onClick={() => setActiveGame(card.id)}
          >
            <div
              className="px-5 py-4 flex items-center gap-3 border-b"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <span className="text-3xl">{card.icon}</span>
              <div>
                <p className="font-bold text-cyan-400 text-sm">{card.title}</p>
                <p className="text-xs text-gray-500">{card.desc}</p>
              </div>
            </div>
            <div className="px-5 py-4 flex items-center justify-between">
              <span className="text-xs text-yellow-400/80">{card.reward}</span>
              <button
                className="px-4 py-1.5 rounded-full text-xs font-bold border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 transition"
                onClick={(e) => { e.stopPropagation(); setActiveGame(card.id); }}
              >
                PLAY
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer
        className="text-center py-8 text-gray-500 text-sm border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}
      >
        AO Games Hub — Original games by{" "}
        <span style={{ fontFamily: "'Brush Script MT', cursive", color: "#ff00cc", fontSize: "1rem" }}>Anom</span>{" "}
        © 2026 AO Universe
      </footer>

      {/* Login prompt modal for unauthenticated users who earn coins */}
      {showLoginPrompt && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.80)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowLoginPrompt(false); }}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-8 text-center"
            style={{
              background: "linear-gradient(135deg, #0f1117 0%, #1a0a2e 100%)",
              border: "1px solid rgba(255,0,204,0.5)",
              boxShadow: "0 0 40px rgba(255,0,204,0.2)",
            }}
          >
            <div className="text-5xl mb-4">🪙</div>
            <h3
              className="text-xl font-bold text-pink-300 mb-2"
              style={{ fontFamily: "'Space Mono', monospace" }}
            >
              You Earned {pendingEarnAmount} Coins!
            </h3>
            <p className="text-gray-400 text-sm mb-2">
              Sign in to save your Anom Coins to your account and track your progress on the Dashboard.
            </p>
            <p className="text-yellow-400/70 text-xs mb-6">
              Without signing in, coins earned this session will be lost when you leave.
            </p>
            <button
              onClick={() => startLogin()}
              className="w-full py-3 rounded-lg font-bold text-white mb-3 transition hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #ff00cc, #c084fc)" }}
            >
              Sign In to Save Coins
            </button>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="text-xs text-gray-500 hover:text-gray-300 transition"
            >
              Continue playing without saving
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
