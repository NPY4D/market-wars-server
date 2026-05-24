// ═══════════════════════════════════════════════════════
// MARKET WARS — WebSocket Game Server
// ═══════════════════════════════════════════════════════
// รัน: node server.js
// Port: 3001 (ปรับได้ใน .env)
// ═══════════════════════════════════════════════════════

const WebSocket = require("ws");
const { randomUUID } = require("crypto");

const PORT = process.env.PORT || 3001;
const http = require("http");
const server = http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Market Wars Server OK");
});
const wss = new WebSocket.Server({ server });
server.listen(PORT, () => {
  console.log(`🚀 Market Wars Server running on port ${PORT}`);
});

console.log(`🚀 Market Wars Server running on ws://localhost:${PORT}`);

// ─── DATA ─────────────────────────────────────────────
const ASSETS = [
  { id:"AAPL", name:"Apple",    emoji:"🍎", type:"stock",      bp:52,   vol:0.028, color:"#38bdf8" },
  { id:"TSLA", name:"Tesla",    emoji:"⚡",  type:"stock",      bp:68,   vol:0.048, color:"#4ade80" },
  { id:"NVDA", name:"Nvidia",   emoji:"🎮", type:"stock",      bp:95,   vol:0.038, color:"#a3e635" },
  { id:"PTT",  name:"PTT",      emoji:"⛽", type:"stock",      bp:35,   vol:0.022, color:"#ea580c" },
  { id:"BTC",  name:"Bitcoin",  emoji:"₿",  type:"crypto",     bp:420,  vol:0.075, color:"#fb923c" },
  { id:"ETH",  name:"Ethereum", emoji:"◆",  type:"crypto",     bp:180,  vol:0.095, color:"#818cf8" },
  { id:"SOL",  name:"Solana",   emoji:"◎",  type:"crypto",     bp:28,   vol:0.115, color:"#c084fc" },
  { id:"DOGE", name:"Dogecoin", emoji:"🐕", type:"crypto",     bp:8,    vol:0.14,  color:"#eab308" },
  { id:"CONDO",name:"คอนโด",   emoji:"🏢", type:"realestate", bp:1200, vol:0.022, color:"#f87171", inc:40 },
  { id:"HOUSE",name:"บ้าน",    emoji:"🏠", type:"realestate", bp:2200, vol:0.018, color:"#fbbf24", inc:75 },
  { id:"MALL", name:"ห้าง",    emoji:"🏪", type:"realestate", bp:4500, vol:0.025, color:"#f472b6", inc:160 },
  { id:"GOLD", name:"ทองคำ",   emoji:"🥇", type:"gold",       bp:280,  vol:0.038, color:"#f59e0b", inc:5 },
  { id:"SILV", name:"เงิน",    emoji:"🥈", type:"gold",       bp:45,   vol:0.032, color:"#94a3b8", inc:2 },
  { id:"OIL",  name:"น้ำมัน",  emoji:"🛢",  type:"commodity",  bp:95,   vol:0.048, color:"#78716c", inc:3 },
  { id:"WATR", name:"น้ำ",     emoji:"💧", type:"commodity",  bp:38,   vol:0.03,  color:"#67e8f9", inc:1 },
  { id:"RICE", name:"ข้าว",    emoji:"🌾", type:"commodity",  bp:22,   vol:0.04,  color:"#86efac", inc:1 },
];

const EVENTS = [
  { id:"fed",   title:"🏦 Fed ขึ้นดอกเบี้ย",  eff:{stock:-0.08,crypto:-0.04,realestate:-0.06,gold:0.06,commodity:-0.03}, dur:15 },
  { id:"bull",  title:"🚀 Crypto Bull Run!",   eff:{stock:0.02,crypto:0.20,realestate:0,gold:0,commodity:0},             dur:15 },
  { id:"tech",  title:"💻 Tech Boom",          eff:{stock:0.14,crypto:0.06,realestate:0.02,gold:-0.02,commodity:0},      dur:15 },
  { id:"crash", title:"📉 วิกฤตเศรษฐกิจ",     eff:{stock:-0.12,crypto:-0.15,realestate:-0.08,gold:0.15,commodity:-0.05},dur:20 },
  { id:"prop",  title:"🏘️ อสังหาฯบูม",         eff:{stock:0.01,crypto:0,realestate:0.18,gold:0,commodity:0},            dur:15 },
  { id:"dump",  title:"🐋 Whale Dump!",        eff:{stock:-0.02,crypto:-0.22,realestate:0,gold:0.04,commodity:0},        dur:10 },
  { id:"war",   title:"⚔️ สงครามปะทุ!",        eff:{stock:-0.10,crypto:-0.05,realestate:-0.04,gold:0.22,commodity:0.28},dur:20 },
  { id:"elon",  title:"🤖 Elon Tweet Crypto!", eff:{stock:0.03,crypto:0.32,realestate:0,gold:-0.02,commodity:0},        dur:8  },
  { id:"flood", title:"🌊 น้ำท่วมใหญ่!",       eff:{stock:-0.05,crypto:0,realestate:-0.16,gold:0.03,commodity:0.10},    dur:15 },
  { id:"oil",   title:"🛢 น้ำมันพุ่งสูง!",      eff:{stock:-0.06,crypto:-0.02,realestate:0.02,gold:0.05,commodity:0.25},dur:15 },
  { id:"goldB", title:"🥇 ทองทะลุ All-Time!",  eff:{stock:0.01,crypto:0.02,realestate:0.04,gold:0.28,commodity:0.06},  dur:12 },
  { id:"rate",  title:"✂️ Fed ลดดอกเบี้ย!",    eff:{stock:0.10,crypto:0.08,realestate:0.13,gold:0.06,commodity:0.03},  dur:15 },
  { id:"hack",  title:"👾 Exchange ถูกแฮก!",   eff:{stock:-0.03,crypto:-0.28,realestate:0,gold:0.10,commodity:0},       dur:10 },
  { id:"boom",  title:"🇹🇭 ไทยบูม! ศก.พุ่ง",   eff:{stock:0.16,crypto:0.05,realestate:0.20,gold:0.02,commodity:0.08},  dur:15 },
  { id:"nuke",  title:"☢️ วิกฤตนิวเคลียร์!",   eff:{stock:-0.18,crypto:-0.10,realestate:-0.12,gold:0.30,commodity:0.15},dur:20},
];

const MINI_EVENTS = [
  {a:"AAPL",msg:"🍎 Apple รายได้ดี!",   ch:+0.06},
  {a:"TSLA",msg:"⚡ Tesla delivery สูง!",ch:+0.08},
  {a:"BTC", msg:"₿ BTC ขยับขึ้น",       ch:+0.07},
  {a:"ETH", msg:"◆ ETH network active",  ch:+0.09},
  {a:"SOL", msg:"◎ SOL dApps เยอะขึ้น",  ch:+0.10},
  {a:"GOLD",msg:"🥇 ทองขึ้นเล็กน้อย",    ch:+0.05},
  {a:"OIL", msg:"🛢 น้ำมันปรับตัวสูง",   ch:+0.08},
  {a:"RICE",msg:"🌾 ข้าวขาดแคลน",        ch:+0.12},
  {a:"NVDA",msg:"🎮 GPU demand พุ่ง!",   ch:+0.07},
  {a:"DOGE",msg:"🐕 Doge meme viral!",   ch:+0.15},
  {a:"TSLA",msg:"⚡ Tesla recall!",       ch:-0.09},
  {a:"BTC", msg:"₿ BTC profit-taking",   ch:-0.06},
  {a:"CONDO",msg:"🏢 คอนโดลดราคา!",     ch:-0.05},
  {a:"OIL", msg:"🛢 น้ำมันล้นตลาด",      ch:-0.07},
  {a:"DOGE",msg:"🐕 Doge ปั๊ม dump",     ch:-0.12},
];

const MODES = {
  casual:{ name:"Casual", dur:300, evInt:[18,32], start:20000, cards:true  },
  deep:  { name:"Deep",   dur:900, evInt:[35,60], start:20000, cards:false },
};

// ─── STATE ────────────────────────────────────────────
// rooms = Map<roomCode, Room>
const rooms = new Map();
// clients = Map<ws, { playerId, roomCode, nick }>
const clients = new Map();

// ─── ROOM STRUCTURE ───────────────────────────────────
function createRoom(code, hostId, mode, endMode, target, duration) {
  const cfg = MODES[mode];
  const room = {
    code,
    hostId,
    mode,
    endMode,        // "time" | "target"
    target,         // net worth target (target mode)
    duration: endMode === "time" ? duration : 99999,
    cfg,
    status: "waiting",  // waiting | running | ended
    players: new Map(),  // playerId → PlayerState
    prices: Object.fromEntries(ASSETS.map(a => [a.id, a.bp])),
    priceHistory: Object.fromEntries(ASSETS.map(a => [a.id, [a.bp]])),
    activeEvent: null,
    eventTimer: 0,
    nextEventIn: 20,
    timeLeft: endMode === "time" ? duration : 99999,
    tick: 0,
    marketPhase: "BULL",
    marketplace: [],    // hype items listed for sale
    chat: [],
    loop: null,         // setInterval handle
    hypeIdx: { card:1.0, figure:1.0, gameid:1.0 },
    winner: null,
  };
  return room;
}

function createPlayer(id, nick, isHost) {
  return {
    id, nick, isHost,
    cash: 0,        // set when game starts
    hold: {},       // { assetId: qty }
    basis: {},      // { assetId: totalCost }
    gWin: 0,
    gLoss: 0,
    nw: 0,
    ready: isHost ? false : false,
    connected: true,
  };
}

// ─── BROADCAST HELPERS ────────────────────────────────
function send(ws, type, payload) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, ...payload }));
  }
}

function broadcast(room, type, payload, excludeId = null) {
  for (const [ws, info] of clients) {
    if (info.roomCode === room.code && info.playerId !== excludeId) {
      send(ws, type, payload);
    }
  }
}

function broadcastAll(room, type, payload) {
  broadcast(room, type, payload, null);
}

function getWsForPlayer(room, playerId) {
  for (const [ws, info] of clients) {
    if (info.roomCode === room.code && info.playerId === playerId) return ws;
  }
  return null;
}

// ─── GAME LOGIC ───────────────────────────────────────
function calcNW(player, prices) {
  return player.cash + Object.entries(player.hold)
    .reduce((s, [id, q]) => s + (prices[id] || 0) * q, 0);
}

function tickPrices(room) {
  const ev = room.activeEvent;
  ASSETS.forEach(a => {
    const eff = ev ? (ev.eff[a.type] || 0) : 0;
    const prev = room.prices[a.id] || a.bp;
    room.prices[a.id] = Math.max(
      prev * (1 + eff * 0.07 + (Math.random() - 0.5) * 1.2 * a.vol),
      a.bp * 0.04
    );
    const hist = room.priceHistory[a.id];
    hist.push(room.prices[a.id]);
    if (hist.length > 60) hist.shift();
  });
}

function tickEvents(room) {
  room.nextEventIn--;
  if (room.nextEventIn <= 0) {
    const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
    room.activeEvent = ev;
    room.eventTimer = ev.dur;
    broadcastAll(room, "EVENT", { event: ev });

    // RE/Gold bonus income on good events
    if ((ev.eff.realestate || 0) > 0.1) {
      room.players.forEach(p => {
        const bonus = ["CONDO","HOUSE","MALL"].reduce((s,id) => {
          const a = ASSETS.find(x => x.id === id);
          return s + (p.hold[id] || 0) * (a?.inc || 0) * 3;
        }, 0);
        if (bonus > 0) {
          p.cash += bonus;
          const ws = getWsForPlayer(room, p.id);
          if (ws) send(ws, "INCOME", { amount: bonus, msg: `🏘️ อสังหาฯบูม! ค่าเช่าพิเศษ +฿${Math.round(bonus).toLocaleString()}` });
        }
      });
    }

    const [lo, hi] = room.cfg.evInt;
    room.nextEventIn = Math.floor(Math.random() * (hi - lo)) + lo;
  }

  if (room.eventTimer > 0) {
    room.eventTimer--;
    if (room.eventTimer <= 0) room.activeEvent = null;
  }
}

function tickPassiveIncome(room) {
  if (room.tick % 30 !== 0) return;
  ASSETS.filter(a => a.inc).forEach(a => {
    room.players.forEach(p => {
      const q = p.hold[a.id] || 0;
      if (q > 0) {
        const earned = a.inc * q;
        p.cash += earned;
        const ws = getWsForPlayer(room, p.id);
        const icon = a.type === "realestate" ? "🏠" : a.type === "gold" ? "✨" : "📦";
        if (ws) send(ws, "INCOME", { amount: earned, msg: `${icon} ค่าเช่า/ปันผล ${a.name} +฿${Math.round(earned).toLocaleString()}` });
      }
    });
  });
}

function tickMiniEvent(room) {
  if (room.tick % 20 !== 0 || room.activeEvent) return;
  const mev = MINI_EVENTS[Math.floor(Math.random() * MINI_EVENTS.length)];
  if (room.prices[mev.a]) {
    const a = ASSETS.find(x => x.id === mev.a);
    room.prices[mev.a] = Math.max(
      room.prices[mev.a] * (1 + mev.ch),
      (a?.bp || 1) * 0.05
    );
    broadcastAll(room, "MINI_EVENT", { msg: mev.msg, assetId: mev.a, change: mev.ch });
  }
}

function tickHypeIdx(room) {
  if (room.tick % 4 !== 0) return;
  ["card","figure","gameid"].forEach(t => {
    const pull = (1.05 - room.hypeIdx[t]) * 0.04;
    const noise = (Math.random() - 0.5) * 0.28;
    room.hypeIdx[t] = Math.max(0.25, Math.min(5.5, room.hypeIdx[t] + pull + noise));
  });
}

function updateLeaderboard(room) {
  const board = [];
  room.players.forEach(p => {
    p.nw = calcNW(p, room.prices);
    board.push({ id: p.id, nick: p.nick, nw: p.nw, connected: p.connected });
  });
  board.sort((a, b) => b.nw - a.nw);
  return board;
}

function checkWinCondition(room, board) {
  if (room.endMode === "target" && room.target) {
    const winner = board.find(p => p.nw >= room.target);
    if (winner) return winner;
  }
  return null;
}

function endRoom(room, winnerNick = null) {
  if (room.status === "ended") return;
  room.status = "ended";
  clearInterval(room.loop);
  room.loop = null;

  const board = updateLeaderboard(room);
  broadcastAll(room, "GAME_OVER", {
    board,
    prices: room.prices,
    winner: winnerNick,
    reason: winnerNick ? "target" : "time",
  });
  console.log(`[${room.code}] Game ended. Winner: ${winnerNick || board[0]?.nick}`);

  // Clean up room after 2 minutes
  setTimeout(() => rooms.delete(room.code), 120000);
}

function startGameLoop(room) {
  room.status = "running";
  room.tick = 0;

  // Send initial state to everyone
  broadcastAll(room, "GAME_START", {
    prices: room.prices,
    assets: ASSETS,
    duration: room.duration,
    mode: room.mode,
    endMode: room.endMode,
    target: room.target,
    startMoney: room.cfg.start,
  });

  room.loop = setInterval(() => {
    room.tick++;

    // ── Time ──
    if (room.endMode === "time") {
      room.timeLeft--;
      if (room.timeLeft <= 0) {
        endRoom(room, null);
        return;
      }
      const pct = room.timeLeft / room.duration;
      room.marketPhase = pct > 0.66 ? "BULL" : pct > 0.33 ? "SIDEWAYS" : "BEAR";
    }

    // ── Prices ──
    tickPrices(room);
    tickMiniEvent(room);

    // ── Events ──
    tickEvents(room);

    // ── Income ──
    tickPassiveIncome(room);

    // ── Hype ──
    tickHypeIdx(room);

    // ── Leaderboard ──
    const board = updateLeaderboard(room);

    // ── Broadcast tick ──
    broadcastAll(room, "TICK", {
      prices: room.prices,
      timeLeft: room.timeLeft,
      phase: room.marketPhase,
      activeEvent: room.activeEvent,
      eventTimer: room.eventTimer,
      nextEventIn: room.nextEventIn,
      hypeIdx: room.hypeIdx,
      board: board.map(p => ({ id:p.id, nick:p.nick, nw:Math.round(p.nw) })),
    });

    // ── Win check ──
    const winner = checkWinCondition(room, board);
    if (winner) {
      endRoom(room, winner.nick);
    }
  }, 1000);

  console.log(`[${room.code}] Game started! Mode: ${room.mode}, Players: ${room.players.size}`);
}

// ─── MESSAGE HANDLERS ────────────────────────────────
function handleJoin(ws, data) {
  const { nick, roomCode, mode = "casual", endMode = "time", target = 50000, duration = 300 } = data;
  if (!nick || !roomCode) return send(ws, "ERROR", { msg: "ต้องมี nick และ roomCode" });

  let room = rooms.get(roomCode);
  const playerId = randomUUID();
  const isHost = !room;

  if (!room) {
    // สร้างห้องใหม่
    room = createRoom(roomCode, playerId, mode, endMode, target, duration);
    rooms.set(roomCode, room);
    console.log(`[${roomCode}] Room created by ${nick}`);
  } else if (room.status === "running") {
    // Rejoin ถ้าเคยอยู่ก่อน (ชื่อเดียวกัน)
    const existing = [...room.players.values()].find(p => p.nick === nick);
    if (existing) {
      existing.connected = true;
      clients.set(ws, { playerId: existing.id, roomCode, nick });
      send(ws, "REJOINED", {
        playerId: existing.id,
        roomCode,
        nick,
        cash: existing.cash,
        hold: existing.hold,
        basis: existing.basis,
        gWin: existing.gWin,
        gLoss: existing.gLoss,
        prices: room.prices,
        timeLeft: room.timeLeft,
        mode: room.mode,
        endMode: room.endMode,
        target: room.target,
        assets: ASSETS,
        marketplace: room.marketplace,
        chat: room.chat.slice(-50),
      });
      console.log(`[${roomCode}] ${nick} rejoined`);
      return;
    }
  }

  if (room.status === "ended") return send(ws, "ERROR", { msg: "ห้องนี้เกมจบแล้ว" });
  if (room.players.size >= 8) return send(ws, "ERROR", { msg: "ห้องเต็ม (8/8)" });

  const player = createPlayer(playerId, nick, isHost);
  room.players.set(playerId, player);
  clients.set(ws, { playerId, roomCode, nick });

  // แจ้งคนในห้องว่ามีคนเข้าใหม่
  broadcast(room, "PLAYER_JOINED", { playerId, nick, isHost: false }, playerId);

  // ส่งข้อมูลห้องให้คนที่เพิ่งเข้า
  send(ws, "JOINED", {
    playerId,
    roomCode,
    nick,
    isHost,
    mode: room.mode,
    endMode: room.endMode,
    target: room.target,
    duration: room.duration,
    players: [...room.players.values()].map(p => ({
      id: p.id, nick: p.nick, isHost: p.isHost, ready: p.ready,
    })),
  });
  console.log(`[${roomCode}] ${nick} joined (${room.players.size} players)`);
}

function handleReady(ws, data) {
  const info = clients.get(ws);
  if (!info) return;
  const room = rooms.get(info.roomCode);
  if (!room || room.status !== "waiting") return;
  const player = room.players.get(info.playerId);
  if (!player) return;

  player.ready = !player.ready;
  broadcastAll(room, "PLAYER_READY", { playerId: info.playerId, ready: player.ready });

  // Auto-start: host กด start หรือทุกคน ready
  const allReady = [...room.players.values()].every(p => p.ready);
  if (allReady && room.players.size >= 2) {
    // Init cash สำหรับทุกคน
    room.players.forEach(p => {
      p.cash = room.cfg.start;
      p.nw = room.cfg.start;
    });
    startGameLoop(room);
  }
}

function handleStartGame(ws) {
  const info = clients.get(ws);
  if (!info) return;
  const room = rooms.get(info.roomCode);
  if (!room || room.status !== "waiting") return;
  const player = room.players.get(info.playerId);
  if (!player?.isHost) return send(ws, "ERROR", { msg: "เฉพาะ host เท่านั้น" });
  if (room.players.size < 2) return send(ws, "ERROR", { msg: "ต้องมีผู้เล่นอย่างน้อย 2 คน" });

  room.players.forEach(p => {
    p.cash = room.cfg.start;
    p.nw = room.cfg.start;
  });
  startGameLoop(room);
}

function handleTrade(ws, data) {
  const info = clients.get(ws);
  if (!info) return;
  const room = rooms.get(info.roomCode);
  if (!room || room.status !== "running") return send(ws, "TRADE_RESULT", { ok:false, msg:"เกมยังไม่เริ่ม" });
  const player = room.players.get(info.playerId);
  if (!player) return;

  const { action, assetId, qty } = data;
  const asset = ASSETS.find(a => a.id === assetId);
  if (!asset || qty < 1) return send(ws, "TRADE_RESULT", { ok:false, msg:"ข้อมูลผิด" });

  const price = room.prices[assetId] || asset.bp;
  const cost = price * qty;

  if (action === "buy") {
    if (player.cash < cost) return send(ws, "TRADE_RESULT", { ok:false, msg:"เงินไม่พอ" });
    player.cash -= cost;
    player.hold[assetId] = (player.hold[assetId] || 0) + qty;
    player.basis[assetId] = (player.basis[assetId] || 0) + cost;
    send(ws, "TRADE_RESULT", { ok:true, action:"buy", assetId, qty, price, cost, cash: player.cash, hold: player.hold });
  } else if (action === "sell") {
    const have = player.hold[assetId] || 0;
    if (have < qty) return send(ws, "TRADE_RESULT", { ok:false, msg:"ไม่มีของพอขาย" });
    const gain = price * qty;
    const avgCost = (player.basis[assetId] || 0) / Math.max(have, 1) * qty;
    player.cash += gain;
    player.hold[assetId] = have - qty;
    player.basis[assetId] = Math.max(0, (player.basis[assetId] || 0) - avgCost);
    send(ws, "TRADE_RESULT", { ok:true, action:"sell", assetId, qty, price, gain, cash: player.cash, hold: player.hold });
  }
}

function handleGamble(ws, data) {
  const info = clients.get(ws);
  if (!info) return;
  const room = rooms.get(info.roomCode);
  if (!room || room.status !== "running") return;
  const player = room.players.get(info.playerId);
  if (!player) return;

  const { game, bet, choice } = data;
  const costs = { lottery:100, scratch:50, crash:bet||200, flip:300, roulette:150 };
  const cost = costs[game] || 100;
  if (player.cash < cost) return send(ws, "GAMBLE_RESULT", { ok:false, msg:"เงินไม่พอ" });

  player.cash -= cost;
  let result = { win:false, amount:0, msg:"" };

  if (game === "lottery") {
    const r = Math.random();
    if (r < 0.002)      result = { win:true, amount:50000, msg:"🎉 JACKPOT!! +฿50,000" };
    else if (r < 0.008) result = { win:true, amount:5000,  msg:"🎊 รางวัลที่ 2 +฿5,000" };
    else if (r < 0.02)  result = { win:true, amount:500,   msg:"✨ รางวัลเล็ก +฿500" };
    else                result = { win:false, amount:0,    msg:"😭 ไม่ถูกรางวัล" };
  } else if (game === "flip") {
    const r = Math.random() > 0.5 ? "heads" : "tails";
    const win = r === choice;
    result = { win, amount: win ? cost : 0, msg: win ? `✅ ${r} ถูก! +฿${cost}` : `❌ ${r} เสีย ฿${cost}` };
  } else if (game === "scratch") {
    const SYMS = ["💎","⭐","7️⃣","🍋","🔔","🍒"];
    const s = [0,1,2].map(() => SYMS[Math.floor(Math.random() * SYMS.length)]);
    if (s[0]===s[1] && s[1]===s[2]) {
      const mul = s[0]==="💎"?500:s[0]==="7️⃣"?100:s[0]==="⭐"?50:20;
      result = { win:true, amount:cost*mul, msg:`${s.join(" ")} ×${mul} +฿${(cost*mul).toLocaleString()}!`, slots:s };
    } else {
      result = { win:false, amount:0, msg:`${s.join(" ")} ไม่ถูก`, slots:s };
    }
  }

  if (result.win) {
    player.cash += result.amount;
    player.gWin += result.amount;
  } else {
    player.gLoss += cost;
  }

  send(ws, "GAMBLE_RESULT", { ok:true, ...result, cash: player.cash, gWin: player.gWin, gLoss: player.gLoss });
}

function handleChat(ws, data) {
  const info = clients.get(ws);
  if (!info) return;
  const room = rooms.get(info.roomCode);
  if (!room) return;
  const msg = { id: randomUUID(), nick: info.nick, text: (data.text || "").slice(0,80), time: Date.now() };
  room.chat.push(msg);
  if (room.chat.length > 100) room.chat.shift();
  broadcastAll(room, "CHAT", { msg });
}

function handleGetState(ws) {
  const info = clients.get(ws);
  if (!info) return;
  const room = rooms.get(info.roomCode);
  if (!room) return;
  const player = room.players.get(info.playerId);
  if (!player) return;
  send(ws, "STATE", {
    cash: player.cash, hold: player.hold, basis: player.basis,
    gWin: player.gWin, gLoss: player.gLoss,
    prices: room.prices, timeLeft: room.timeLeft,
    activeEvent: room.activeEvent, eventTimer: room.eventTimer,
    hypeIdx: room.hypeIdx, marketplace: room.marketplace,
    phase: room.marketPhase,
  });
}

// ─── CONNECTION HANDLER ──────────────────────────────
wss.on("connection", (ws, req) => {
  const ip = req.socket.remoteAddress;
  console.log(`🔌 New connection from ${ip}`);

  ws.on("message", (raw) => {
    let data;
    try { data = JSON.parse(raw); } catch { return; }

    switch (data.type) {
      case "JOIN":       handleJoin(ws, data); break;
      case "READY":      handleReady(ws, data); break;
      case "START":      handleStartGame(ws); break;
      case "TRADE":      handleTrade(ws, data); break;
      case "GAMBLE":     handleGamble(ws, data); break;
      case "CHAT":       handleChat(ws, data); break;
      case "GET_STATE":  handleGetState(ws); break;
      default: console.log("Unknown message type:", data.type);
    }
  });

  ws.on("close", () => {
    const info = clients.get(ws);
    if (info) {
      const room = rooms.get(info.roomCode);
      if (room) {
        const player = room.players.get(info.playerId);
        if (player) {
          player.connected = false;
          broadcast(room, "PLAYER_DISCONNECTED", { playerId: info.playerId, nick: info.nick }, info.playerId);
          console.log(`[${info.roomCode}] ${info.nick} disconnected`);
        }
      }
      clients.delete(ws);
    }
  });

  ws.on("error", (err) => console.error("WS error:", err.message));

  // Ping-pong เพื่อ keep-alive
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
});

// Heartbeat: kick clients ที่หายไป
setInterval(() => {
  wss.clients.forEach(ws => {
    if (!ws.isAlive) { ws.terminate(); return; }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// ─── STATUS ENDPOINT ─────────────────────────────────
// ดู status ผ่าน HTTP GET (ต้องใช้ http module แยก)
const http = require("http");
const statusServer = http.createServer((req, res) => {
  if (req.url === "/status") {
    const data = {
      rooms: rooms.size,
      clients: clients.size,
      roomList: [...rooms.entries()].map(([code, r]) => ({
        code, status: r.status,
        players: r.players.size,
        mode: r.mode,
        timeLeft: r.timeLeft,
      })),
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data, null, 2));
  } else {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("Market Wars Server OK");
  }
});
statusServer.listen(parseInt(PORT) + 1, () => {
  console.log(`📊 Status endpoint: http://localhost:${PORT + 1}/status`);
});
