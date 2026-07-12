import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useMissionAutoComplete } from "@/hooks/useMissionAutoComplete";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlayerState {
  identity: string;
  level: number;
  currency: number;
  inventory: string[];
  filterCount: number;
  shieldCount: number;
}

interface ShopItem {
  name: string;
  cost: number;
  count: number;
  desc: string;
  key: "filter" | "shield";
}

interface GameState {
  isRunning: boolean;
  activeThreats: number;
  tickerTimer: number;
  player: PlayerState;
  shop: {
    filter: ShopItem;
    shield: ShopItem;
  };
  autoFilterTimer: number;
}

interface LogEntry {
  id: number;
  html: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SAVE_KEY = "offgrid_player_state_v2";

// Pacing: base interval 15s (was 8s), scales slower with level
// Level 1 = 15s, Level 2 = 18s, Level 3+ = 20s cap
const BASE_ALERT_INTERVAL = 15000;
const SHIELD_MULTIPLIER = 2.0;       // FireWall v2 doubles the interval
const AUTO_FILTER_INTERVAL = 20000;  // Auto-Filter clears 1 threat every 20s
const TICK_MS = 200;                 // Tick every 200ms (was 100ms) — lighter on CPU

// Color tokens
const C = {
  threat:  "#ff3333",
  success: "#00ff88",
  info:    "#00eaff",
  shop:    "#facc15",
  system:  "#c084fc",
  muted:   "#666666",
  dim:     "#3a4a3a",
};

const INCIDENTS = [
  "VECTOR ALERT: Intrusion anomaly detected in sector 09.",
  "SPAM BLOCK: Automated bot cluster filtering targeted chat flows.",
  "NODE ERROR: Data leak identified in background memory arrays.",
  "FILTER TRIPPED: Toxic signature blocked by moderation layer.",
  "BREACH ATTEMPT: Unauthorized access probe on node cluster 7.",
  "MALWARE PING: Hostile packet signature identified at gateway.",
  "OVERFLOW: Memory buffer saturation detected in sector 12.",
  "PHISHING VECTOR: Social engineering attempt logged.",
];

const DEFAULT_PLAYER: PlayerState = {
  identity: "OPERATOR",
  level: 1,
  currency: 0,
  inventory: [],
  filterCount: 0,
  shieldCount: 0,
};

const INITIAL_STATE: GameState = {
  isRunning: false,
  activeThreats: 0,
  tickerTimer: 0,
  player: { ...DEFAULT_PLAYER },
  shop: {
    filter: { name: "Auto-Filter Subroutine", cost: 50, count: 0, desc: "Passively clears 1 threat every 20s", key: "filter" },
    shield: { name: "Grid FireWall v2", cost: 120, count: 0, desc: "Doubles time between threat spawns", key: "shield" },
  },
  autoFilterTimer: 0,
};

// ─── Property Graphics ────────────────────────────────────────────────────────
// ASCII/emoji art panels that unlock as player levels up

interface PropertyTile {
  emoji: string;
  label: string;
  unlocksAt: number; // player level required
  description: string;
}

const PROPERTY_TILES: PropertyTile[] = [
  { emoji: "🏚️", label: "Shelter",     unlocksAt: 1,  description: "Basic off-grid cabin. Your starting point." },
  { emoji: "🌱", label: "Seedling",    unlocksAt: 1,  description: "First garden plot. Small but growing." },
  { emoji: "☀️", label: "Solar Panel", unlocksAt: 2,  description: "1 solar panel. Power is yours." },
  { emoji: "🌿", label: "Garden",      unlocksAt: 3,  description: "Full vegetable garden. Self-sufficient." },
  { emoji: "💧", label: "Rain Barrel", unlocksAt: 4,  description: "Water collection system online." },
  { emoji: "🏡", label: "Cabin",       unlocksAt: 5,  description: "Upgraded cabin. Insulated and warm." },
  { emoji: "🌳", label: "Orchard",     unlocksAt: 6,  description: "Fruit trees planted. Long-term thinking." },
  { emoji: "⚡", label: "Wind Turbine", unlocksAt: 7, description: "Wind turbine added. Full energy grid." },
  { emoji: "🐔", label: "Chickens",    unlocksAt: 8,  description: "Livestock added. Eggs every morning." },
  { emoji: "🏗️", label: "Workshop",    unlocksAt: 9,  description: "Build and repair anything here." },
  { emoji: "🌻", label: "Sunflowers",  unlocksAt: 10, description: "Decorative garden. You earned beauty." },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadSave(): Partial<PlayerState> | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function writeSave(player: PlayerState) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(player)); }
  catch { /* ignore */ }
}

function col(text: string, color: string) {
  return `<span style="color:${color}">${text}</span>`;
}

// ─── CRT Styles ───────────────────────────────────────────────────────────────

const CRT_STYLE = `
@keyframes crt-flicker {
  0%,91%,95%,100% { opacity:1; }
  92%             { opacity:0.93; }
  94%             { opacity:0.97; }
}
@keyframes crt-cursor-blink {
  0%,49% { opacity:1; }
  50%,100%{ opacity:0; }
}
.crt-screen {
  position: relative;
  animation: crt-flicker 8s infinite;
}
.crt-screen::before {
  content:'';
  position:absolute;
  inset:0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px, transparent 3px,
    rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px
  );
  pointer-events:none;
  z-index:10;
  border-radius:inherit;
}
.crt-screen::after {
  content:'';
  position:absolute;
  inset:0;
  background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5) 100%);
  pointer-events:none;
  z-index:11;
  border-radius:inherit;
}
.crt-text {
  text-shadow: 0 0 5px rgba(0,255,136,0.55), 0 0 10px rgba(0,255,136,0.25);
}
.crt-cursor::after {
  content:'█';
  animation: crt-cursor-blink 1s step-end infinite;
  color:#00ff88;
  margin-left:2px;
}
`;

let crtStyleInjected = false;
function injectCRTStyle() {
  if (crtStyleInjected) return;
  const el = document.createElement("style");
  el.textContent = CRT_STYLE;
  document.head.appendChild(el);
  crtStyleInjected = true;
}

// ─── Property Panel Component ─────────────────────────────────────────────────

function PropertyPanel({ level }: { level: number }) {
  const unlocked = PROPERTY_TILES.filter(t => t.unlocksAt <= level);
  const next = PROPERTY_TILES.find(t => t.unlocksAt > level);
  const [hovered, setHovered] = useState<PropertyTile | null>(null);

  return (
    <div
      className="rounded-lg p-3 text-xs"
      style={{ background: "rgba(0,20,5,0.8)", border: "1px solid rgba(0,255,136,0.15)" }}
    >
      <div className="flex items-center justify-between mb-2">
        <span style={{ color: C.success, fontFamily: "monospace" }}>// OFF-GRID PROPERTY //</span>
        <span style={{ color: C.muted }}>LVL {level}</span>
      </div>

      {/* Unlocked tiles grid */}
      <div className="flex flex-wrap gap-2 mb-2">
        {unlocked.map(tile => (
          <button
            key={tile.label}
            className="flex flex-col items-center gap-0.5 p-2 rounded transition-all"
            style={{
              background: hovered?.label === tile.label ? "rgba(0,255,136,0.1)" : "rgba(0,0,0,0.4)",
              border: `1px solid ${hovered?.label === tile.label ? C.success + "60" : "rgba(0,255,136,0.1)"}`,
              minWidth: "48px",
            }}
            onMouseEnter={() => setHovered(tile)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="text-xl">{tile.emoji}</span>
            <span style={{ color: C.muted, fontSize: "9px" }}>{tile.label.toUpperCase()}</span>
          </button>
        ))}

        {/* Locked next tile */}
        {next && (
          <div
            className="flex flex-col items-center gap-0.5 p-2 rounded opacity-30"
            style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)", minWidth: "48px" }}
          >
            <span className="text-xl grayscale">🔒</span>
            <span style={{ color: C.dim, fontSize: "9px" }}>LVL {next.unlocksAt}</span>
          </div>
        )}
      </div>

      {/* Hover description */}
      <div style={{ minHeight: "28px" }}>
        {hovered ? (
          <p style={{ color: C.success }}>{hovered.emoji} {hovered.label}: <span style={{ color: "#aaa" }}>{hovered.description}</span></p>
        ) : (
          <p style={{ color: C.dim }}>
            {next
              ? `Next unlock at LVL ${next.unlocksAt}: ${next.emoji} ${next.label} — use ${col("levelup", C.info)} to advance`
              : col("All property tiles unlocked. You are fully off-grid.", C.success)}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Game Component ──────────────────────────────────────────────────────

interface OffGridGameProps {
  onEarnCoins: (amount: number) => void;
}

export function OffGridGame({ onEarnCoins }: OffGridGameProps) {
  const [gs, setGs] = useState<GameState>(() => {
    const saved = loadSave();
    const player = saved ? { ...DEFAULT_PLAYER, ...saved } : { ...DEFAULT_PLAYER };
    return {
      ...INITIAL_STATE,
      player,
      shop: {
        filter: { ...INITIAL_STATE.shop.filter, count: player.filterCount },
        shield: { ...INITIAL_STATE.shop.shield, count: player.shieldCount },
      },
    };
  });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [input, setInput] = useState("");
  const [logId, setLogId] = useState(0);
  const logRef = useRef<HTMLDivElement>(null);
  const gsRef = useRef(gs);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { injectCRTStyle(); }, []);
  useEffect(() => { gsRef.current = gs; }, [gs]);

  const addLog = useCallback((html: string) => {
    setLogId(id => {
      const newId = id + 1;
      setLogs(prev => [...prev.slice(-299), { id: newId, html }]);
      return newId;
    });
  }, []);

  // Auto-scroll — always snap to bottom after new log
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }, [logs]);

  // Game loop — level scales the alert interval (higher level = more time between threats)
  useEffect(() => {
    if (!gs.isRunning) return;
    intervalRef.current = setInterval(() => {
      const cur = gsRef.current;
      const levelBonus = Math.min((cur.player.level - 1) * 2000, 10000); // +2s per level, cap at +10s
      const alertInterval = (BASE_ALERT_INTERVAL + levelBonus) * (cur.shop.shield.count > 0 ? SHIELD_MULTIPLIER : 1);

      let newTickerTimer = cur.tickerTimer + TICK_MS;
      let newAutoFilterTimer = cur.autoFilterTimer + TICK_MS;
      let newThreats = cur.activeThreats;

      if (newTickerTimer >= alertInterval) {
        newTickerTimer = 0;
        newThreats += 1;
        const incident = INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)];
        addLog(col(`[!] ${incident}`, C.threat));
        addLog(`ACTIVE INCIDENTS: ${col(String(newThreats), C.threat)}. Run ${col("clearance", C.info)} to fix.`);
      }

      if (cur.shop.filter.count > 0 && newAutoFilterTimer >= AUTO_FILTER_INTERVAL) {
        newAutoFilterTimer = 0;
        if (newThreats > 0) {
          newThreats -= 1;
          addLog(col("[AUTO-FILTER] Subroutine cleared 1 anomaly passively.", C.system));
        }
      }

      setGs(prev => ({
        ...prev,
        tickerTimer: newTickerTimer,
        autoFilterTimer: newAutoFilterTimer,
        activeThreats: newThreats,
      }));
    }, TICK_MS);

    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [gs.isRunning, addLog]);

  // Boot
  useEffect(() => {
    const saved = loadSave();
    if (saved) {
      addLog(col(`PROFILE SYNC: Operator data restored. LVL ${saved.level ?? 1} // ${saved.currency ?? 0} tokens.`, C.system));
    }
    addLog(col("OFF GRID Engine: Initializing...", C.info));
    addLog(`Type ${col("help", C.info)} to scan available terminal protocols.`);
    setGs(prev => ({ ...prev, isRunning: true }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const processCommand = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    addLog(col(`> ${trimmed}`, C.muted));
    const args = trimmed.toLowerCase().split(" ");
    const cmd = args[0];

    setGs(prev => {
      const p = { ...prev.player };
      const shop = { ...prev.shop, filter: { ...prev.shop.filter }, shield: { ...prev.shop.shield } };
      let threats = prev.activeThreats;
      const newLogs: string[] = [];

      switch (cmd) {
        case "help":
          newLogs.push(`PROTOCOLS: [ ${col("status", C.info)} | ${col("scan", C.info)} | ${col("clearance", C.success)} | ${col("levelup", C.success)} | ${col("shop", C.shop)} | ${col("buy filter", C.shop)} | ${col("buy shield", C.shop)} | ${col("clear", C.muted)} ]`);
          break;

        case "status":
          newLogs.push(`OPERATOR: ${col(p.identity.toUpperCase(), C.system)} // LVL: ${col(String(p.level), C.info)} // TOKENS: ${col(`${p.currency} ◈`, C.shop)}`);
          newLogs.push(`THREATS: ${col(String(threats), threats > 0 ? C.threat : C.success)} // AUTO-FILTER: ${col(shop.filter.count > 0 ? "ONLINE" : "OFFLINE", shop.filter.count > 0 ? C.success : C.muted)} // FIREWALL: ${col(shop.shield.count > 0 ? "ACTIVE" : "INACTIVE", shop.shield.count > 0 ? C.success : C.muted)}`);
          break;

        case "scan":
          if (threats > 0) {
            newLogs.push(col(`SCANNING... Found ${threats} structural memory anomalies running. Execute 'clearance' protocol.`, C.threat));
          } else {
            newLogs.push(col("SCANNING... Grid space 100% clean. Systems nominal.", C.success));
          }
          break;

        case "clearance": {
          if (threats > 0) {
            const earned = threats * 10;
            newLogs.push(col("Running clearance protocols... Purging volatile node buffers...", C.info));
            newLogs.push(col(`GRID INTEGRITY RESTORED. +${earned} tokens earned. 🌿`, C.success));
            p.currency += earned;
            threats = 0;
            writeSave(p);
            setTimeout(() => onEarnCoins(earned), 0);
          } else {
            newLogs.push(col("No active threat nodes to clean inside the current cluster.", C.muted));
          }
          break;
        }

        case "levelup":
          p.level += 1;
          newLogs.push(col(`PROTOCOL UPGRADE: Operator level scaled up to ${p.level}. New property tile may be unlocked — check your homestead!`, C.success));
          writeSave(p);
          break;

        case "shop":
          newLogs.push(col("=== AO GRID SHOP ===", C.shop));
          newLogs.push(`${col("[filter]", C.shop)} ${shop.filter.name} — ${col(`${shop.filter.cost} ◈`, C.shop)} — ${shop.filter.desc} ${col(`(owned: ${shop.filter.count})`, C.system)}`);
          newLogs.push(`${col("[shield]", C.shop)} ${shop.shield.name} — ${col(`${shop.shield.cost} ◈`, C.shop)} — ${shop.shield.desc} ${col(`(owned: ${shop.shield.count})`, C.system)}`);
          newLogs.push(`Use: ${col("buy filter", C.info)} or ${col("buy shield", C.info)}`);
          break;

        case "buy": {
          const item = args[1];
          if (item === "filter") {
            if (p.currency >= shop.filter.cost) {
              p.currency -= shop.filter.cost;
              shop.filter.count += 1;
              p.filterCount = shop.filter.count;
              newLogs.push(col("PURCHASED: Auto-Filter Subroutine installed. Passive threat clearing active.", C.success));
              writeSave(p);
            } else {
              newLogs.push(col(`INSUFFICIENT TOKENS. Need ${shop.filter.cost} ◈, have ${p.currency} ◈.`, C.threat));
            }
          } else if (item === "shield") {
            if (p.currency >= shop.shield.cost) {
              p.currency -= shop.shield.cost;
              shop.shield.count += 1;
              p.shieldCount = shop.shield.count;
              newLogs.push(col("PURCHASED: Grid FireWall v2 deployed. Threat spawn rate halved.", C.success));
              writeSave(p);
            } else {
              newLogs.push(col(`INSUFFICIENT TOKENS. Need ${shop.shield.cost} ◈, have ${p.currency} ◈.`, C.threat));
            }
          } else {
            newLogs.push(col("Unknown item. Use: buy filter | buy shield", C.threat));
          }
          break;
        }

        case "clear":
          setLogs([]);
          newLogs.push(col("Console logs purged.", C.muted));
          break;

        default:
          newLogs.push(col(`CRITICAL: Command syntax error '${cmd}'. Run 'help' for grid options.`, C.threat));
      }

      newLogs.forEach(l => addLog(l));
      return { ...prev, activeThreats: threats, player: p, shop };
    });
  }, [addLog, onEarnCoins]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input);
    setInput("");
  };

  const threatColor = gs.activeThreats === 0 ? C.success : gs.activeThreats < 3 ? C.shop : C.threat;

  return (
    <div className="flex flex-col gap-3 text-xs" style={{ fontFamily: "'Space Mono', 'Courier New', monospace" }}>

      {/* HUD */}
      <div
        className="grid grid-cols-3 gap-2 p-3 rounded-lg"
        style={{ background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.18)" }}
      >
        <div className="text-center">
          <div className="mb-1" style={{ color: C.dim }}>OPERATOR</div>
          <div className="crt-text" style={{ color: C.system }}>{gs.player.identity}</div>
        </div>
        <div className="text-center">
          <div className="mb-1" style={{ color: C.dim }}>LEVEL</div>
          <div className="crt-text" style={{ color: C.info }}>LVL {gs.player.level}</div>
        </div>
        <div className="text-center">
          <div className="mb-1" style={{ color: C.dim }}>TOKENS</div>
          <div style={{ color: C.shop }}>{gs.player.currency} ◈</div>
        </div>
      </div>

      {/* Threat bar */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-700"
        style={{ background: "rgba(0,0,0,0.5)", border: `1px solid ${threatColor}35` }}
      >
        <span style={{ color: threatColor, fontWeight: gs.activeThreats > 0 ? "bold" : "normal" }}>
          {gs.activeThreats > 0 ? "⚠" : "✓"} ACTIVE THREATS: {gs.activeThreats}
        </span>
        <div className="flex gap-3">
          {gs.shop.filter.count > 0 && <span style={{ color: C.system }}>AUTO-FILTER ✓</span>}
          {gs.shop.shield.count > 0 && <span style={{ color: C.info }}>FIREWALL ✓</span>}
        </div>
      </div>

      {/* Property panel */}
      <PropertyPanel level={gs.player.level} />

      {/* CRT Terminal */}
      <div
        className="crt-screen rounded-lg overflow-hidden"
        style={{ border: "1px solid rgba(0,255,136,0.22)", boxShadow: "0 0 18px rgba(0,255,136,0.07), inset 0 0 24px rgba(0,0,0,0.6)" }}
      >
        <div
          ref={logRef}
          className="p-3 overflow-y-auto leading-relaxed crt-text"
          style={{ background: "#010d03", height: "200px", color: "#00ff88" }}
        >
          {logs.map(entry => (
            <div key={entry.id} className="mb-0.5 break-words" dangerouslySetInnerHTML={{ __html: entry.html }} />
          ))}
          {logs.length === 0 && <span style={{ color: C.dim }}>Terminal ready...</span>}
          <div style={{ height: 1 }} />
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <span className="crt-text" style={{ color: C.info }}>$</span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="type a command..."
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent outline-none crt-cursor"
          style={{ color: "#e2e8f0", borderBottom: `1px solid ${C.info}40`, paddingBottom: "2px", fontFamily: "inherit", fontSize: "12px" }}
        />
        <button
          type="submit"
          className="px-3 py-1 rounded font-bold transition-all active:scale-95"
          style={{ background: "rgba(0,255,136,0.07)", border: `1px solid ${C.success}50`, color: C.success, fontSize: "11px" }}
        >
          EXEC
        </button>
      </form>

      <p className="text-center" style={{ color: C.dim, fontSize: "10px" }}>
        Type {col("help", C.info)} for commands · {col("clearance", C.success)} earns Sanctuary coins · {col("levelup", C.info)} unlocks property tiles
      </p>
    </div>
  );
}

// ─── Standalone Page (/games/off-grid) ────────────────────────────────────────

export default function OffGrid() {
  useMissionAutoComplete();
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const earnCoinsMutation = trpc.games.earnCoins.useMutation({
    onSuccess: () => {
      utils.coins.getBalance.invalidate();
      utils.coins.getHistory.invalidate();
    },
  });

  const handleEarnCoins = (amount: number) => {
    if (user) earnCoinsMutation.mutate({ amount, source: "Game: Off-Grid" });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "#030a04" }}>
      <div className="w-full max-w-lg mb-5 text-center">
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#00eaff", fontFamily: "monospace" }}>
          // AO Games Hub //
        </p>
        <h1
          className="text-3xl font-black mb-1"
          style={{
            background: "linear-gradient(135deg, #00ff88, #00eaff, #c084fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "2px",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          OFF GRID
        </h1>
        <p style={{ color: "#3a4a3a" }} className="text-sm">Defend the grid. Clear threats. Earn coins. Build your homestead.</p>
      </div>

      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "#060e07", border: "1px solid rgba(0,255,136,0.12)", boxShadow: "0 0 40px rgba(0,255,136,0.04)" }}
      >
        <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-bold text-sm" style={{ color: "#00ff88" }}>OFF GRID TERMINAL</p>
              <p className="text-xs" style={{ color: "#facc15" }}>10 coins per threat cleared · shop upgrades · property unlocks</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <OffGridGame onEarnCoins={handleEarnCoins} />
        </div>
      </div>

      {!user && (
        <p className="text-xs mt-4 text-center" style={{ color: "#facc1570" }}>
          💡 Sign in to save your Anom Coins earnings to your account
        </p>
      )}

      <a
        href="/games"
        className="mt-6 text-xs transition"
        style={{ color: "#3a4a3a" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#00eaff")}
        onMouseLeave={e => (e.currentTarget.style.color = "#3a4a3a")}
      >
        ← Back to Games Hub
      </a>
    </div>
  );
}
