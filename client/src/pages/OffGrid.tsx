import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useMissionAutoComplete } from "@/hooks/useMissionAutoComplete";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlayerState {
  identity: string;
  level: number;
  currency: number; // in-game currency (mirrors Sanctuary coins earned)
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
  lastTick: number;
  player: PlayerState;
  shop: {
    filter: ShopItem;
    shield: ShopItem;
  };
  autoFilterTimer: number;
  shieldActive: boolean;
}

interface LogEntry {
  id: number;
  html: string;
  ts: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SAVE_KEY = "offgrid_player_state_v2";
const BASE_ALERT_INTERVAL = 8000; // ms between threat spawns
const SHIELD_MULTIPLIER = 2.0; // Grid FireWall v2 doubles interval
const AUTO_FILTER_INTERVAL = 15000; // Auto-Filter clears 1 threat every 15s
const TICK_MS = 100; // game loop tick in ms

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

const INITIAL_STATE: GameState = {
  isRunning: false,
  activeThreats: 0,
  tickerTimer: 0,
  lastTick: 0,
  player: {
    identity: "OPERATOR",
    level: 1,
    currency: 0,
    inventory: [],
    filterCount: 0,
    shieldCount: 0,
  },
  shop: {
    filter: { name: "Auto-Filter Subroutine", cost: 50, count: 0, desc: "Passively clears 1 threat every 15s", key: "filter" },
    shield: { name: "Grid FireWall v2", cost: 120, count: 0, desc: "Doubles time between threat spawns", key: "shield" },
  },
  autoFilterTimer: 0,
  shieldActive: false,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function loadSave(): Partial<PlayerState> | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSave(player: PlayerState) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(player));
  } catch {
    // ignore
  }
}

const DEFAULT_PLAYER: PlayerState = {
  identity: "OPERATOR",
  level: 1,
  currency: 0,
  inventory: [],
  filterCount: 0,
  shieldCount: 0,
};

// ─── Component ────────────────────────────────────────────────────────────────

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

  // Keep ref in sync so the interval closure always sees fresh state
  useEffect(() => { gsRef.current = gs; }, [gs]);

  const addLog = useCallback((html: string) => {
    setLogId(id => {
      const newId = id + 1;
      setLogs(prev => [...prev.slice(-199), { id: newId, html, ts: Date.now() }]);
      return newId;
    });
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // Game loop
  useEffect(() => {
    if (!gs.isRunning) return;

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const cur = gsRef.current;
      const delta = TICK_MS;

      const alertInterval = cur.shop.shield.count > 0
        ? BASE_ALERT_INTERVAL * SHIELD_MULTIPLIER
        : BASE_ALERT_INTERVAL;

      let newTickerTimer = cur.tickerTimer + delta;
      let newAutoFilterTimer = cur.autoFilterTimer + delta;
      let newThreats = cur.activeThreats;
      let newCurrency = cur.player.currency;

      // Spawn threat
      if (newTickerTimer >= alertInterval) {
        newTickerTimer = 0;
        newThreats += 1;
        const incident = INCIDENTS[Math.floor(Math.random() * INCIDENTS.length)];
        addLog(`<span style="color:#ff0055;font-weight:bold">[!] ${incident}</span>`);
        addLog(`ACTIVE INCIDENTS: ${newThreats}. Run <span style="color:#00eaff">clearance</span> to fix.`);
      }

      // Auto-Filter passive clear
      if (cur.shop.filter.count > 0 && newAutoFilterTimer >= AUTO_FILTER_INTERVAL) {
        newAutoFilterTimer = 0;
        if (newThreats > 0) {
          newThreats -= 1;
          addLog(`<span style="color:#c084fc">[AUTO-FILTER] Subroutine cleared 1 anomaly passively.</span>`);
        }
      }

      const newGs: GameState = {
        ...cur,
        tickerTimer: newTickerTimer,
        autoFilterTimer: newAutoFilterTimer,
        activeThreats: newThreats,
        lastTick: now,
        player: { ...cur.player, currency: newCurrency },
      };

      setGs(newGs);
    }, TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [gs.isRunning, addLog]);

  // Boot sequence
  useEffect(() => {
    const saved = loadSave();
    if (saved) {
      addLog(`<span style="color:#c084fc">PROFILE SYNC: Operator data restored. LVL ${saved.level ?? 1} // ${saved.currency ?? 0} tokens.</span>`);
    }
    addLog(`<span style="color:#00eaff;font-weight:bold">OFF GRID Engine: Initializing...</span>`);
    addLog(`Type <span style="color:#00eaff">help</span> to scan available terminal protocols.`);
    setGs(prev => ({ ...prev, isRunning: true, lastTick: Date.now() }));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const processCommand = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    addLog(`<span style="color:#888">&gt; ${trimmed}</span>`);

    const args = trimmed.toLowerCase().split(" ");
    const cmd = args[0];

    setGs(prev => {
      const p = { ...prev.player };
      const shop = { ...prev.shop, filter: { ...prev.shop.filter }, shield: { ...prev.shop.shield } };
      let threats = prev.activeThreats;
      let newLogs: string[] = [];

      switch (cmd) {
        case "help":
          newLogs.push("AVAILABLE PROTOCOLS: [ status | scan | clearance | levelup | shop | buy filter | buy shield | clear ]");
          break;

        case "status":
          newLogs.push(`OPERATOR: ${p.identity.toUpperCase()} // LVL: ${p.level} // TOKENS: ${p.currency} // STATUS: LEGENDARY`);
          newLogs.push(`ACTIVE THREATS: ${threats} // AUTO-FILTER: ${shop.filter.count > 0 ? "ONLINE" : "OFFLINE"} // FIREWALL: ${shop.shield.count > 0 ? "ACTIVE" : "INACTIVE"}`);
          break;

        case "scan":
          if (threats > 0) {
            newLogs.push(`<span style="color:#ff0055">SCANNING... Found ${threats} structural memory anomalies running. Execute 'clearance' protocol.</span>`);
          } else {
            newLogs.push(`<span style="color:#00eaff">SCANNING... Grid space 100% clean. Systems nominal.</span>`);
          }
          break;

        case "clearance": {
          if (threats > 0) {
            const earned = threats * 10;
            newLogs.push(`<span style="color:#00eaff">Running clearance protocols... Purging volatile node buffers...</span>`);
            newLogs.push(`GRID INTEGRITY RESTORED. +${earned} tokens earned.`);
            p.currency += earned;
            threats = 0;
            writeSave(p);
            // Notify parent to persist coins to Sanctuary
            setTimeout(() => onEarnCoins(earned), 0);
          } else {
            newLogs.push("No active threat nodes to clean inside the current cluster.");
          }
          break;
        }

        case "levelup":
          p.level += 1;
          newLogs.push(`PROTOCOL UPGRADE: Operator level scaled up to: ${p.level}`);
          writeSave(p);
          break;

        case "shop":
          newLogs.push("=== AO GRID SHOP ===");
          newLogs.push(`[1] Auto-Filter Subroutine — ${shop.filter.cost} tokens — ${shop.filter.desc} (owned: ${shop.filter.count})`);
          newLogs.push(`[2] Grid FireWall v2 — ${shop.shield.cost} tokens — ${shop.shield.desc} (owned: ${shop.shield.count})`);
          newLogs.push(`Use: <span style="color:#00eaff">buy filter</span> or <span style="color:#00eaff">buy shield</span>`);
          break;

        case "buy": {
          const item = args[1];
          if (item === "filter") {
            if (p.currency >= shop.filter.cost) {
              p.currency -= shop.filter.cost;
              shop.filter.count += 1;
              p.filterCount = shop.filter.count;
              newLogs.push(`<span style="color:#c084fc">PURCHASED: Auto-Filter Subroutine installed. Passive threat clearing active.</span>`);
              writeSave(p);
            } else {
              newLogs.push(`<span style="color:#ff3333">INSUFFICIENT TOKENS. Need ${shop.filter.cost}, have ${p.currency}.</span>`);
            }
          } else if (item === "shield") {
            if (p.currency >= shop.shield.cost) {
              p.currency -= shop.shield.cost;
              shop.shield.count += 1;
              p.shieldCount = shop.shield.count;
              newLogs.push(`<span style="color:#c084fc">PURCHASED: Grid FireWall v2 deployed. Threat spawn rate halved.</span>`);
              writeSave(p);
            } else {
              newLogs.push(`<span style="color:#ff3333">INSUFFICIENT TOKENS. Need ${shop.shield.cost}, have ${p.currency}.</span>`);
            }
          } else {
            newLogs.push(`<span style="color:#ff3333">Unknown item. Use: buy filter | buy shield</span>`);
          }
          break;
        }

        case "clear":
          setLogs([]);
          newLogs.push("Console logs purged.");
          break;

        default:
          newLogs.push(`<span style="color:#ff3333">CRITICAL: Command syntax error '${cmd}'. Run 'help' for grid options.</span>`);
      }

      newLogs.forEach(l => addLog(l));

      return {
        ...prev,
        activeThreats: threats,
        player: p,
        shop,
      };
    });
  }, [addLog, onEarnCoins]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    processCommand(input);
    setInput("");
  };

  const threatColor = gs.activeThreats === 0 ? "#00eaff" : gs.activeThreats < 3 ? "#facc15" : "#ff0055";

  return (
    <div
      className="flex flex-col gap-3 font-mono text-sm"
      style={{ fontFamily: "'Space Mono', 'Courier New', monospace" }}
    >
      {/* HUD */}
      <div
        className="grid grid-cols-3 gap-2 p-3 rounded-lg text-xs"
        style={{ background: "rgba(0,234,255,0.05)", border: "1px solid rgba(0,234,255,0.2)" }}
      >
        <div className="text-center">
          <div className="text-gray-500 uppercase tracking-widest mb-1">Operator</div>
          <div style={{ color: "#c084fc" }}>{gs.player.identity}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 uppercase tracking-widest mb-1">Level</div>
          <div style={{ color: "#00eaff" }}>LVL {gs.player.level}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 uppercase tracking-widest mb-1">Tokens</div>
          <div style={{ color: "#facc15" }}>{gs.player.currency} ◈</div>
        </div>
      </div>

      {/* Threat Bar */}
      <div
        className="flex items-center justify-between px-3 py-2 rounded-lg text-xs"
        style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${threatColor}40` }}
      >
        <span style={{ color: threatColor }}>
          ⚡ ACTIVE THREATS: {gs.activeThreats}
        </span>
        <div className="flex gap-2">
          {gs.shop.filter.count > 0 && (
            <span style={{ color: "#c084fc" }}>AUTO-FILTER ✓</span>
          )}
          {gs.shop.shield.count > 0 && (
            <span style={{ color: "#00eaff" }}>FIREWALL ✓</span>
          )}
        </div>
      </div>

      {/* Terminal Log */}
      <div
        ref={logRef}
        className="rounded-lg p-3 overflow-y-auto text-xs leading-relaxed"
        style={{
          background: "#050810",
          border: "1px solid rgba(0,234,255,0.15)",
          height: "220px",
          color: "#b0c4de",
        }}
      >
        {logs.map(entry => (
          <div
            key={entry.id}
            className="mb-0.5"
            dangerouslySetInnerHTML={{ __html: entry.html }}
          />
        ))}
        {logs.length === 0 && (
          <span style={{ color: "#444" }}>Terminal ready...</span>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <span style={{ color: "#00eaff", lineHeight: "2rem" }}>$</span>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="type a command..."
          autoComplete="off"
          spellCheck={false}
          className="flex-1 bg-transparent outline-none text-xs"
          style={{
            color: "#e2e8f0",
            borderBottom: "1px solid rgba(0,234,255,0.3)",
            paddingBottom: "2px",
            fontFamily: "inherit",
          }}
        />
        <button
          type="submit"
          className="px-3 py-1 rounded text-xs font-bold transition"
          style={{
            background: "rgba(0,234,255,0.1)",
            border: "1px solid rgba(0,234,255,0.4)",
            color: "#00eaff",
          }}
        >
          EXEC
        </button>
      </form>

      <p className="text-xs text-center" style={{ color: "#444" }}>
        Type <span style={{ color: "#00eaff" }}>help</span> for commands ·{" "}
        <span style={{ color: "#facc15" }}>clearance</span> earns Sanctuary coins
      </p>
    </div>
  );
}

// ─── Standalone Page (for /games/off-grid route) ──────────────────────────────

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
    if (user) {
      earnCoinsMutation.mutate({ amount, source: "Game: Off-Grid" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: "#0b0e14" }}>
      {/* Header */}
      <div className="w-full max-w-lg mb-6 text-center">
        <p
          className="text-xs tracking-widest uppercase mb-2"
          style={{ color: "#00eaff", fontFamily: "monospace" }}
        >
          // AO Games Hub //
        </p>
        <h1
          className="text-3xl font-black mb-1"
          style={{
            background: "linear-gradient(135deg, #ff00cc, #c084fc, #00eaff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "2px",
            fontFamily: "'Space Mono', monospace",
          }}
        >
          OFF GRID
        </h1>
        <p className="text-gray-500 text-sm">Defend the grid. Clear threats. Earn coins.</p>
      </div>

      {/* Game Card */}
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "#0f1420", border: "1px solid rgba(0,234,255,0.2)" }}
      >
        <div
          className="px-5 py-4 border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-bold text-cyan-400 text-sm">OFF GRID TERMINAL</p>
              <p className="text-xs text-yellow-400">10 coins per threat cleared · shop upgrades available</p>
            </div>
          </div>
        </div>
        <div className="p-5">
          <OffGridGame onEarnCoins={handleEarnCoins} />
        </div>
      </div>

      {!user && (
        <p className="text-yellow-400/70 text-xs mt-4 text-center">
          💡 Sign in to save your Anom Coins earnings to your account
        </p>
      )}

      <a
        href="/games"
        className="mt-6 text-xs text-gray-600 hover:text-cyan-400 transition"
      >
        ← Back to Games Hub
      </a>
    </div>
  );
}
